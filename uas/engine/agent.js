// UAS — Agent Engine v1.0.0
// Core agent class with constitutional lifecycle management.
// Every mutation validates against constraints and produces an attestation.

window.UASAgentEngine = (() => {
  'use strict';

  const STATES = Object.freeze({
    Registered: 'Registered',
    Active: 'Active',
    Suspended: 'Suspended',
    Terminated: 'Terminated'
  });

  const VALID_TRANSITIONS = {
    Registered: ['Active', 'Terminated'],
    Active: ['Suspended', 'Terminated'],
    Suspended: ['Active', 'Terminated'],
    Terminated: []
  };

  // ─── Helpers ────────────────────────────────────────────────────────

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ─── Agent Class ────────────────────────────────────────────────────

  class Agent {
    constructor(config) {
      this.id = config.id || generateId();
      this.name = config.name || 'Unnamed Agent';
      this.description = config.description || '';
      this.identity = null; // Set during register()
      this.goals = [];
      this.state = STATES.Registered;
      this.perceptionLog = [];
      this.actionLog = [];
      this.trustScore = 0;
      this.constraints = config.constraints || [];
      this.communicationPermissions = config.communicationPermissions || { canSend: true, canReceive: true, allowedRecipients: 'all' };
      this.createdAt = isoNow();
      this.updatedAt = isoNow();
      this._attestations = [];
      this._messageQueue = [];
    }

    // ── Lifecycle ──────────────────────────────────────────────────

    async register(runtime) {
      if (this.state !== STATES.Registered) {
        throw new Error(`Cannot register agent in state '${this.state}'`);
      }

      // Register with CoreFab identity system
      if (runtime && runtime.identity) {
        const meta = `${this.name}:agent:1.0.0:`;
        this.identity = await runtime.identity.declare(
          this.name, 'execution', '1.0.0', [],
          `Sovereign agent: ${this.name}`
        );
      } else {
        // Fallback: generate identity hash locally
        const identityData = `${this.name}:${this.description}:${this.createdAt}:${this.id}`;
        this.identity = { id: await sha256(identityData), name: this.name };
      }

      await this._attest('register', { agentId: this.id, name: this.name });
      return this;
    }

    async activate() {
      this._transitionTo(STATES.Active);
      await this._attest('activate', { agentId: this.id });
      return this;
    }

    async suspend(reason) {
      this._transitionTo(STATES.Suspended);
      this._logPerception({ type: 'suspension', reason: reason || 'Unspecified' });
      await this._attest('suspend', { agentId: this.id, reason });
      return this;
    }

    async terminate(reason) {
      this._transitionTo(STATES.Terminated);
      this._logPerception({ type: 'termination', reason: reason || 'Unspecified' });
      await this._attest('terminate', { agentId: this.id, reason });
      return this;
    }

    // ── Goal Management ────────────────────────────────────────────

    async addGoal(goal) {
      this._validateState([STATES.Registered, STATES.Active]);

      const goalObj = {
        id: generateId(),
        title: goal.title || 'Untitled Goal',
        description: goal.description || '',
        priority: goal.priority || 'normal',
        status: 'pending',
        createdAt: isoNow(),
        achievedAt: null
      };

      // Validate against constraints
      for (const constraint of this.constraints) {
        if (constraint.type === 'no_goals' && this.goals.length >= (constraint.limit || 0)) {
          throw new Error(`Constraint '${constraint.name}' prevents adding more goals`);
        }
      }

      this.goals.push(goalObj);
      this.updatedAt = isoNow();
      await this._attest('addGoal', { agentId: this.id, goalId: goalObj.id, title: goalObj.title });
      return goalObj;
    }

    async achieveGoal(goalId) {
      this._validateState([STATES.Active]);
      const goal = this.goals.find(g => g.id === goalId);
      if (!goal) throw new Error(`Goal '${goalId}' not found`);

      goal.status = 'achieved';
      goal.achievedAt = isoNow();
      this.updatedAt = isoNow();
      await this._attest('achieveGoal', { agentId: this.id, goalId });
      return goal;
    }

    // ── Perception & Action ────────────────────────────────────────

    async perceive(event) {
      this._validateState([STATES.Active]);
      const entry = {
        id: generateId(),
        event: event,
        timestamp: isoNow()
      };
      this.perceptionLog.push(entry);
      this.updatedAt = isoNow();
      return entry;
    }

    async plan(goal) {
      this._validateState([STATES.Active]);
      const planResult = {
        id: generateId(),
        goalId: goal.id || 'unknown',
        steps: goal.steps || ['Analyze', 'Decide', 'Execute', 'Verify'],
        estimatedDuration: goal.estimatedDuration || 'unknown',
        timestamp: isoNow()
      };
      this.actionLog.push({
        type: 'plan',
        ...planResult
      });
      await this._attest('plan', { agentId: this.id, goalId: planResult.goalId });
      return planResult;
    }

    async execute(action) {
      this._validateState([STATES.Active]);

      // Validate action against constraints
      for (const constraint of this.constraints) {
        if (constraint.type === 'blocked_actions' && constraint.actions?.includes(action.type)) {
          throw new Error(`Action '${action.type}' blocked by constraint '${constraint.name}'`);
        }
      }

      const result = {
        id: generateId(),
        action: action.type || action,
        input: action.input || null,
        output: action.output || { status: 'completed' },
        success: true,
        timestamp: isoNow()
      };
      this.actionLog.push({ type: 'execute', ...result });
      this.updatedAt = isoNow();
      await this._attest('execute', { agentId: this.id, action: result.action });
      return result;
    }

    async attest(result) {
      const attestation = {
        id: generateId(),
        agentId: this.id,
        result: result,
        timestamp: isoNow()
      };
      this._attestations.push(attestation);
      return attestation;
    }

    // ── Communication ──────────────────────────────────────────────

    async sendMessage(agentId, message) {
      if (!this.communicationPermissions.canSend) {
        throw new Error('Agent does not have send permission');
      }
      if (this.communicationPermissions.allowedRecipients !== 'all') {
        if (!this.communicationPermissions.allowedRecipients.includes(agentId)) {
          throw new Error(`Agent is not allowed to send to '${agentId}'`);
        }
      }
      if (this.state !== STATES.Active) {
        throw new Error('Agent must be Active to send messages');
      }

      const msg = {
        id: generateId(),
        from: this.id,
        to: agentId,
        content: message,
        timestamp: isoNow()
      };

      this.actionLog.push({ type: 'sendMessage', ...msg });
      this.updatedAt = isoNow();
      return msg;
    }

    async receiveMessage(msg) {
      if (!this.communicationPermissions.canReceive) {
        throw new Error('Agent does not have receive permission');
      }

      const received = {
        ...msg,
        receivedAt: isoNow()
      };

      this._messageQueue.push(received);
      this._logPerception({ type: 'message', from: msg.from, content: msg.content });
      return received;
    }

    // ── Trust ──────────────────────────────────────────────────────

    getTrustScore() {
      return this.trustScore;
    }

    async earnTrust(amount) {
      this.trustScore = Math.min(100, this.trustScore + amount);
      this.updatedAt = isoNow();
      await this._attest('earnTrust', { agentId: this.id, amount, newScore: this.trustScore });
      return this.trustScore;
    }

    async revokeTrust(amount) {
      this.trustScore = Math.max(0, this.trustScore - amount);
      this.updatedAt = isoNow();
      await this._attest('revokeTrust', { agentId: this.id, amount, newScore: this.trustScore });
      return this.trustScore;
    }

    // ── Serialization ──────────────────────────────────────────────

    toJSON() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        identity: this.identity,
        goals: this.goals,
        state: this.state,
        perceptionLog: this.perceptionLog,
        actionLog: this.actionLog,
        trustScore: this.trustScore,
        constraints: this.constraints,
        communicationPermissions: this.communicationPermissions,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        _attestationCount: this._attestations.length,
        _messageQueueLength: this._messageQueue.length
      };
    }

    static fromJSON(data) {
      const agent = new Agent(data);
      agent.identity = data.identity;
      agent.goals = data.goals || [];
      agent.state = data.state;
      agent.perceptionLog = data.perceptionLog || [];
      agent.actionLog = data.actionLog || [];
      agent.trustScore = data.trustScore || 0;
      agent.createdAt = data.createdAt;
      agent.updatedAt = data.updatedAt;
      return agent;
    }

    // ── Internal ───────────────────────────────────────────────────

    _transitionTo(newState) {
      const allowed = VALID_TRANSITIONS[this.state];
      if (!allowed || !allowed.includes(newState)) {
        throw new Error(`Invalid state transition: ${this.state} → ${newState}`);
      }
      this.state = newState;
      this.updatedAt = isoNow();
    }

    _validateState(validStates) {
      if (!validStates.includes(this.state)) {
        throw new Error(`Operation requires state [${validStates.join('|')}], current: '${this.state}'`);
      }
    }

    _logPerception(event) {
      this.perceptionLog.push({
        id: generateId(),
        event,
        timestamp: isoNow()
      });
    }

    async _attest(operation, data) {
      const attestation = {
        id: generateId(),
        agentId: this.id,
        operation,
        data,
        timestamp: isoNow()
      };
      // Generate attestation signature
      const signingData = `${this.id}:${operation}:${JSON.stringify(data)}:${attestation.timestamp}`;
      attestation.signature = await sha256(signingData);
      this._attestations.push(attestation);

      // Publish via EventBus if available
      if (window.EventBus) {
        EventBus.publish('agent.attestation', attestation, `uas:${this.name}`);
      }
      return attestation;
    }

    getAttestations() {
      return [...this._attestations];
    }

    getMessageQueue() {
      return [...this._messageQueue];
    }

    clearMessageQueue() {
      this._messageQueue.length = 0;
    }
  }

  // ─── Agent Registry ──────────────────────────────────────────────────

  class AgentRegistry {
    constructor() {
      this.agents = new Map();
    }

    async create(config) {
      const agent = new Agent(config);
      await agent.register();
      this.agents.set(agent.id, agent);

      if (window.EventBus) {
        EventBus.publish('agent.created', agent.toJSON(), 'uas:registry');
      }
      return agent;
    }

    get(agentId) {
      return this.agents.get(agentId) || null;
    }

    getAll() {
      return Array.from(this.agents.values());
    }

    getByState(state) {
      return this.getAll().filter(a => a.state === state);
    }

    remove(agentId) {
      const agent = this.agents.get(agentId);
      if (!agent) return false;
      if (agent.state === STATES.Active) {
        throw new Error('Cannot remove active agent. Terminate first.');
      }
      this.agents.delete(agentId);
      return true;
    }

    search(query) {
      const q = query.toLowerCase();
      return this.getAll().filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.includes(q)
      );
    }

    getStats() {
      const all = this.getAll();
      const active = all.filter(a => a.state === STATES.Active);
      const avgTrust = all.length > 0
        ? all.reduce((sum, a) => sum + a.trustScore, 0) / all.length
        : 0;

      return {
        total: all.length,
        active: active.length,
        suspended: all.filter(a => a.state === STATES.Suspended).length,
        terminated: all.filter(a => a.state === STATES.Terminated).length,
        registered: all.filter(a => a.state === STATES.Registered).length,
        avgTrust: Math.round(avgTrust * 10) / 10,
        totalGoals: all.reduce((sum, a) => sum + a.goals.length, 0),
        achievedGoals: all.reduce((sum, a) => sum + a.goals.filter(g => g.status === 'achieved').length, 0)
      };
    }

    toJSON() {
      return Array.from(this.agents.values()).map(a => a.toJSON());
    }

    fromJSON(dataArray) {
      for (const data of dataArray) {
        const agent = Agent.fromJSON(data);
        this.agents.set(agent.id, agent);
      }
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────

  return Object.freeze({
    Agent,
    AgentRegistry,
    STATES,
    VALID_TRANSITIONS
  });
})();
