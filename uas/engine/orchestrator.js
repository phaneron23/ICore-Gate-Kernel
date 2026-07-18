// UAS — Multi-Agent Orchestrator Engine v1.0.0
// Orchestrates multiple agents in structured sessions with trust propagation.

window.UASOrchestrator = (() => {
  'use strict';

  const PATTERNS = Object.freeze({
    sequential: { id: 'sequential', name: 'Sequential', desc: 'Agents execute one after another' },
    parallel: { id: 'parallel', name: 'Parallel', desc: 'All agents execute simultaneously' },
    consensus: { id: 'consensus', name: 'Consensus', desc: 'Agents vote to reach agreement' },
    pipeline: { id: 'pipeline', name: 'Pipeline', desc: 'Each agent passes output to the next' }
  });

  const SESSION_STATES = Object.freeze({
    Created: 'Created',
    Running: 'Running',
    Completed: 'Completed',
    Failed: 'Failed',
    Cancelled: 'Cancelled'
  });

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function isoNow() {
    return new Date().toISOString();
  }

  // ─── Session Class ───────────────────────────────────────────────────

  class Session {
    constructor(config) {
      this.id = generateId();
      this.name = config.name || 'Unnamed Session';
      this.agentIds = config.agentIds || [];
      this.pattern = config.pattern || 'sequential';
      this.goal = config.goal || null;
      this.state = SESSION_STATES.Created;
      this.roles = {};          // agentId → role string
      this.results = {};        // agentId → result
      this.conflicts = [];
      this.log = [];
      this.minTrust = 100;      // inherited minimum trust
      this.createdAt = isoNow();
      this.completedAt = null;

      // Validate pattern
      if (!PATTERNS[this.pattern]) {
        throw new Error(`Invalid pattern: '${this.pattern}'. Valid: ${Object.keys(PATTERNS).join(', ')}`);
      }
    }

    addLog(entry) {
      this.log.push({
        ...entry,
        timestamp: isoNow()
      });
    }
  }

  // ─── Orchestrator Class ──────────────────────────────────────────────

  class Orchestrator {
    constructor() {
      this.sessions = [];
    }

    createSession(name, agentIds, pattern, goal) {
      if (!agentIds || agentIds.length < 1) {
        throw new Error('At least 1 agent is required for a session');
      }

      const session = new Session({ name, agentIds, pattern, goal });
      this.sessions.push(session);

      session.addLog({ type: 'created', message: `Session '${name}' created with ${agentIds.length} agent(s)`, pattern });

      if (window.EventBus) {
        EventBus.publish('orchestrator.sessionCreated', session, 'uas:orchestrator');
      }

      return session;
    }

    assignRoles(sessionId, roles) {
      const session = this._getSession(sessionId);
      if (session.state !== SESSION_STATES.Created) {
        throw new Error(`Cannot assign roles in '${session.state}' state`);
      }

      // Validate all agents are in the session
      for (const agentId of Object.keys(roles)) {
        if (!session.agentIds.includes(agentId)) {
          throw new Error(`Agent '${agentId}' is not in this session`);
        }
      }

      session.roles = { ...session.roles, ...roles };
      session.addLog({ type: 'roles', message: 'Roles assigned', roles: session.roles });
      return session.roles;
    }

    broadcastGoal(sessionId, goal) {
      const session = this._getSession(sessionId);
      session.goal = goal;
      session.addLog({ type: 'goal', message: `Goal set: ${goal.title || goal}`, goal });

      if (window.EventBus) {
        EventBus.publish('orchestrator.goalBroadcast', { sessionId, goal }, 'uas:orchestrator');
      }

      return session.goal;
    }

    async executeSession(sessionId, registry) {
      const session = this._getSession(sessionId);
      if (session.state !== SESSION_STATES.Created) {
        throw new Error(`Cannot execute session in '${session.state}' state`);
      }

      session.state = SESSION_STATES.Running;
      session.addLog({ type: 'execution', message: `Execution started — pattern: ${session.pattern}` });

      // Calculate minimum trust across participants
      if (registry) {
        let minTrust = 100;
        for (const agentId of session.agentIds) {
          const agent = registry.get(agentId);
          if (agent && agent.trustScore < minTrust) {
            minTrust = agent.trustScore;
          }
        }
        session.minTrust = minTrust;

        // Propagate minimum trust to all agents
        for (const agentId of session.agentIds) {
          const agent = registry.get(agentId);
          if (agent && agent.trustScore < minTrust) {
            await agent.earnTrust(minTrust - agent.trustScore);
            session.addLog({ type: 'trust', message: `Trust elevated for agent ${agent.name} to session minimum ${minTrust}` });
          }
        }
      }

      try {
        switch (session.pattern) {
          case 'sequential':
            await this._executeSequential(session, registry);
            break;
          case 'parallel':
            await this._executeParallel(session, registry);
            break;
          case 'consensus':
            await this._executeConsensus(session, registry);
            break;
          case 'pipeline':
            await this._executePipeline(session, registry);
            break;
        }

        session.state = SESSION_STATES.Completed;
        session.completedAt = isoNow();
        session.addLog({ type: 'completed', message: 'Session completed successfully' });
      } catch (error) {
        session.state = SESSION_STATES.Failed;
        session.completedAt = isoNow();
        session.addLog({ type: 'failed', message: `Session failed: ${error.message}` });
      }

      if (window.EventBus) {
        EventBus.publish('orchestrator.sessionComplete', {
          sessionId: session.id,
          state: session.state,
          results: session.results
        }, 'uas:orchestrator');
      }

      return session;
    }

    collectResults(sessionId) {
      const session = this._getSession(sessionId);
      return {
        sessionId: session.id,
        state: session.state,
        results: session.results,
        conflicts: session.conflicts,
        log: session.log
      };
    }

    resolveConflicts(sessionId, conflicts) {
      const session = this._getSession(sessionId);
      session.conflicts = conflicts;

      // Simple conflict resolution: majority vote for consensus, first-wins for others
      const resolutions = conflicts.map(conflict => {
        if (session.pattern === 'consensus' && conflict.votes) {
          const voteCounts = {};
          for (const vote of conflict.votes) {
            voteCounts[vote] = (voteCounts[vote] || 0) + 1;
          }
          const winner = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];
          return { ...conflict, resolved: true, decision: winner[0], votes: voteCounts };
        }
        return { ...conflict, resolved: true, decision: conflict.proposals?.[0] || 'default' };
      });

      session.addLog({ type: 'conflicts', message: `${resolutions.length} conflict(s) resolved`, resolutions });
      return resolutions;
    }

    getSession(sessionId) {
      return this._getSession(sessionId);
    }

    getAllSessions() {
      return [...this.sessions];
    }

    getStats() {
      const all = this.sessions;
      return {
        total: all.length,
        completed: all.filter(s => s.state === SESSION_STATES.Completed).length,
        running: all.filter(s => s.state === SESSION_STATES.Running).length,
        failed: all.filter(s => s.state === SESSION_STATES.Failed).length
      };
    }

    // ── Pattern Executors ──────────────────────────────────────────

    async _executeSequential(session, registry) {
      for (const agentId of session.agentIds) {
        const agent = registry ? registry.get(agentId) : null;
        const agentName = agent ? agent.name : agentId;

        session.addLog({ type: 'agent-start', message: `Agent '${agentName}' starting` });

        if (agent) {
          // Simulate agent execution
          const result = {
            agentId,
            agentName,
            goalId: session.goal?.id || 'default',
            status: 'completed',
            output: `${agentName} completed goal '${session.goal?.title || 'default'}'`,
            executedAt: isoNow()
          };
          session.results[agentId] = result;

          if (agent.actionLog) {
            agent.actionLog.push({ type: 'session-execution', ...result });
          }
        } else {
          session.results[agentId] = { agentId, status: 'completed', output: 'Simulated completion' };
        }

        session.addLog({ type: 'agent-done', message: `Agent '${agentName}' completed` });
      }
    }

    async _executeParallel(session, registry) {
      const promises = session.agentIds.map(async agentId => {
        const agent = registry ? registry.get(agentId) : null;
        const agentName = agent ? agent.name : agentId;

        session.addLog({ type: 'agent-start', message: `Agent '${agentName}' starting (parallel)` });

        const result = {
          agentId,
          agentName,
          goalId: session.goal?.id || 'default',
          status: 'completed',
          output: `${agentName} completed goal '${session.goal?.title || 'default'}'`,
          executedAt: isoNow()
        };

        if (agent && agent.actionLog) {
          agent.actionLog.push({ type: 'session-execution', ...result });
        }

        session.addLog({ type: 'agent-done', message: `Agent '${agentName}' completed (parallel)` });
        return { agentId, result };
      });

      const results = await Promise.all(promises);
      for (const { agentId, result } of results) {
        session.results[agentId] = result;
      }
    }

    async _executeConsensus(session, registry) {
      // First: execute all in parallel to get proposals
      const proposals = {};
      for (const agentId of session.agentIds) {
        const agent = registry ? registry.get(agentId) : null;
        const agentName = agent ? agent.name : agentId;
        proposals[agentId] = {
          agentId,
          agentName,
          proposal: `${agentName} proposes approach A for '${session.goal?.title || 'default'}'`,
          confidence: 0.7 + Math.random() * 0.3
        };
        session.addLog({ type: 'proposal', message: `${agentName} submitted proposal` });
      }

      // Second: vote (each agent votes on best proposal)
      const allAgentIds = Object.keys(proposals);
      const votes = {};
      for (const voterId of allAgentIds) {
        // Vote for self or highest confidence
        let bestProposal = allAgentIds[0];
        let bestConfidence = 0;
        for (const pid of allAgentIds) {
          if (proposals[pid].confidence > bestConfidence) {
            bestConfidence = proposals[pid].confidence;
            bestProposal = pid;
          }
        }
        votes[voterId] = bestProposal;
      }

      // Count votes
      const voteCounts = {};
      for (const vote of Object.values(votes)) {
        voteCounts[vote] = (voteCounts[vote] || 0) + 1;
      }
      const winner = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];

      session.results = {
        proposals,
        votes,
        voteCounts,
        decision: winner ? winner[0] : null,
        consensusReached: winner && winner[1] > allAgentIds.length / 2
      };

      session.addLog({
        type: 'consensus',
        message: session.results.consensusReached
          ? `Consensus reached: agent '${winner[0]}' won with ${winner[1]} votes`
          : 'No consensus reached — defaulting to first proposal'
      });
    }

    async _executePipeline(session, registry) {
      let pipelineInput = session.goal || { title: 'default pipeline input' };

      for (const agentId of session.agentIds) {
        const agent = registry ? registry.get(agentId) : null;
        const agentName = agent ? agent.name : agentId;

        session.addLog({ type: 'pipeline-stage', message: `Stage: '${agentName}' receiving input` });

        const result = {
          agentId,
          agentName,
          input: pipelineInput,
          status: 'completed',
          output: {
            processed: true,
            stageAgent: agentName,
            transformedInput: typeof pipelineInput === 'object'
              ? { ...pipelineInput, processedBy: agentName }
              : `${agentName} processed: ${pipelineInput}`
          },
          executedAt: isoNow()
        };

        if (agent && agent.actionLog) {
          agent.actionLog.push({ type: 'pipeline-stage', ...result });
        }

        session.results[agentId] = result;
        pipelineInput = result.output; // Pass output as next input

        session.addLog({ type: 'pipeline-stage', message: `Stage: '${agentName}' completed` });
      }
    }

    _getSession(sessionId) {
      const session = this.sessions.find(s => s.id === sessionId);
      if (!session) throw new Error(`Session '${sessionId}' not found`);
      return session;
    }
  }

  return Object.freeze({
    Orchestrator,
    Session,
    PATTERNS,
    SESSION_STATES
  });
})();
