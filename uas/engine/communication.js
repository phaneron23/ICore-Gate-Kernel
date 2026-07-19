// UAS — Communication Layer v1.0.0
// Authenticated, ordered, sovereign agent-to-agent message passing.
// Every message is signed; every sequence is tracked; every agent is sovereign.

window.UASCommunicationLayer = (() => {
  'use strict';

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

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const MESSAGE_TYPES = Object.freeze({
    CoordinationRequest: 'CoordinationRequest',
    CoordinationResponse: 'CoordinationResponse',
    StateShare: 'StateShare',
    TrustAssertion: 'TrustAssertion',
    TrustRevocation: 'TrustRevocation',
    GoalAdvertisement: 'GoalAdvertisement',
    CompletionNotice: 'CompletionNotice'
  });

  // ─── Agent Message ─────────────────────────────────────────────────

  class AgentMessage {
    constructor(config) {
      this.id = config.id || generateId();
      this.senderId = config.senderId || 'unknown';
      this.receiverId = config.receiverId || 'broadcast';
      this.messageType = config.messageType || MESSAGE_TYPES.StateShare;
      this.payload = config.payload || {};
      this.goalContext = config.goalContext || null;
      this.timestamp = config.timestamp || isoNow();
      this.epoch = config.epoch || 0;
      this.sequence = config.sequence || 0;
      this.signature = config.signature || null;
    }

    async sign(privateKeyHint) {
      // In production, this would use Ed25519 signing.
      // For the browser reference, we use SHA-256 as a commitment hash.
      const body = `${this.senderId}:${this.receiverId}:${this.messageType}:${JSON.stringify(this.payload)}:${this.timestamp}:${this.sequence}`;
      this.signature = await sha256(body + ':' + (privateKeyHint || 'default'));
      return this.signature;
    }

    async verify(publicKeyHint) {
      if (!this.signature) return false;
      const body = `${this.senderId}:${this.receiverId}:${this.messageType}:${JSON.stringify(this.payload)}:${this.timestamp}:${this.sequence}`;
      const expected = await sha256(body + ':' + (publicKeyHint || 'default'));
      return this.signature === expected;
    }

    toJSON() {
      return {
        id: this.id, senderId: this.senderId, receiverId: this.receiverId,
        messageType: this.messageType, payload: this.payload,
        goalContext: this.goalContext, timestamp: this.timestamp,
        epoch: this.epoch, sequence: this.sequence, signature: this.signature
      };
    }

    static fromJSON(data) {
      return new AgentMessage(data);
    }
  }

  // ─── Communication Channel ─────────────────────────────────────────

  class CommunicationChannel {
    constructor(agentA, agentB) {
      this.agentA = agentA;
      this.agentB = agentB;
      this.messages = [];
      this.sequenceAtoB = 0;  // sequence counter A → B
      this.sequenceBtoA = 0;  // sequence counter B → A
    }

    getChannelKey() {
      return [this.agentA, this.agentB].sort().join(':');
    }
  }

  // ─── Communication Layer ───────────────────────────────────────────

  class CommunicationLayer {
    constructor(config) {
      this.channels = new Map();       // channelKey → CommunicationChannel
      this.agentSequences = new Map(); // agentId → outgoing sequence counter
      this.inbox = new Map();          // agentId → [AgentMessage]
      this.sentLog = [];
      this.receivedLog = [];
      this.maxLogSize = config?.maxLogSize || 500;
      this.policyEngine = config?.policyEngine || null;
    }

    // ── Message Sending (CM1: Authenticated) ───────────────────────

    async sendMessage(senderId, receiverId, messageType, payload, options) {
      // Get or create channel
      const channel = this._getChannel(senderId, receiverId);

      // Determine sequence
      const seqKey = `${senderId}:${receiverId}`;
      const seq = (this.agentSequences.get(seqKey) || 0) + 1;
      this.agentSequences.set(seqKey, seq);

      // Create message
      const message = new AgentMessage({
        senderId,
        receiverId,
        messageType: messageType || MESSAGE_TYPES.StateShare,
        payload: payload || {},
        goalContext: options?.goalContext || null,
        epoch: options?.epoch || 0,
        sequence: seq
      });

      // Sign (CM1: every message authenticated)
      await message.sign(options?.privateKeyHint);

      // Policy gate (CM2: sovereign — agent may refuse)
      if (this.policyEngine) {
        const policyResult = this.policyEngine.evaluateCommunication({
          senderId,
          receiverId,
          messageType: message.messageType,
          payload: message.payload
        });

        if (!policyResult.allowed) {
          return {
            sent: false,
            message: message.toJSON(),
            reason: 'Blocked by communication policy',
            violations: policyResult.evaluations.filter(e => !e.passed)
          };
        }
      }

      // Deliver to receiver's inbox
      if (!this.inbox.has(receiverId)) {
        this.inbox.set(receiverId, []);
      }
      this.inbox.get(receiverId).push(message);

      // Log
      channel.messages.push(message);
      this._logSent(message);

      // EventBus
      if (window.EventBus) {
        EventBus.publish('communication.messageSent', message.toJSON(), `uas:${senderId}`);
      }

      return { sent: true, message: message.toJSON(), sequence: seq };
    }

    // ── Message Receiving (CM5: Transparent) ───────────────────────

    receiveMessages(agentId, options) {
      const messages = this.inbox.get(agentId) || [];
      let result = [...messages];

      // Filter by type
      if (options?.type) {
        result = result.filter(m => m.messageType === options.type);
      }

      // Filter by sender
      if (options?.from) {
        result = result.filter(m => m.senderId === options.from);
      }

      // Filter by minimum sequence
      if (options?.sinceSequence !== undefined) {
        result = result.filter(m => m.sequence > options.sinceSequence);
      }

      // Log received
      for (const msg of result) {
        this._logReceived(msg);
      }

      return result.map(m => m.toJSON());
    }

    // ── Message Verification (CM1) ─────────────────────────────────

    async verifyMessage(messageData, publicKeyHint) {
      const message = AgentMessage.fromJSON(messageData);
      const verified = await message.verify(publicKeyHint);

      return {
        messageId: message.id,
        verified,
        sender: message.senderId,
        receiver: message.receiverId,
        type: message.messageType,
        signature: message.signature
      };
    }

    // ── Sequence Tracking (CM3: Ordered) ───────────────────────────

    getSequence(senderId, receiverId) {
      const seqKey = `${senderId}:${receiverId}`;
      return this.agentSequences.get(seqKey) || 0;
    }

    getOrdering(senderId, receiverId) {
      const channel = this._getChannel(senderId, receiverId);
      const messages = channel.messages
        .filter(m => m.senderId === senderId && m.receiverId === receiverId)
        .sort((a, b) => a.sequence - b.sequence);

      return {
        channel: channel.getChannelKey(),
        count: messages.length,
        sequences: messages.map(m => m.sequence),
        isOrdered: messages.every((m, i) => i === 0 || m.sequence > messages[i - 1].sequence)
      };
    }

    // ── Communication History (CM5: Transparent) ───────────────────

    getHistory(options) {
      let allMessages = [...this.sentLog, ...this.receivedLog];
      allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (options?.agentId) {
        allMessages = allMessages.filter(m =>
          m.senderId === options.agentId || m.receiverId === options.agentId
        );
      }

      if (options?.type) {
        allMessages = allMessages.filter(m => m.messageType === options.type);
      }

      if (options?.limit) {
        allMessages = allMessages.slice(-options.limit);
      }

      return allMessages;
    }

    // ── Query ──────────────────────────────────────────────────────

    getInboxSize(agentId) {
      return (this.inbox.get(agentId) || []).length;
    }

    clearInbox(agentId) {
      this.inbox.delete(agentId);
    }

    getStats() {
      return {
        channels: this.channels.size,
        sent: this.sentLog.length,
        received: this.receivedLog.length,
        pendingInboxes: Array.from(this.inbox.values()).reduce((sum, arr) => sum + arr.length, 0)
      };
    }

    // ── Pre-built Message Builders ──────────────────────────────────

    static buildCoordinationRequest(senderId, receiverId, goalId, proposal) {
      return { senderId, receiverId, messageType: MESSAGE_TYPES.CoordinationRequest,
               payload: { goalId, proposal }, goalContext: goalId };
    }

    static buildTrustAssertion(senderId, receiverId, trustLevel, evidence) {
      return { senderId, receiverId, messageType: MESSAGE_TYPES.TrustAssertion,
               payload: { trustLevel, evidence } };
    }

    static buildGoalAdvertisement(senderId, goalId, description, capabilities) {
      return { senderId, receiverId: 'broadcast', messageType: MESSAGE_TYPES.GoalAdvertisement,
               payload: { goalId, description, capabilities }, goalContext: goalId };
    }

    static buildCompletionNotice(senderId, receiverId, goalId, result) {
      return { senderId, receiverId, messageType: MESSAGE_TYPES.CompletionNotice,
               payload: { goalId, result }, goalContext: goalId };
    }

    // ── Internals ───────────────────────────────────────────────────

    _getChannel(agentA, agentB) {
      const key = [agentA, agentB].sort().join(':');
      if (!this.channels.has(key)) {
        this.channels.set(key, new CommunicationChannel(agentA, agentB));
      }
      return this.channels.get(key);
    }

    _logSent(message) {
      this.sentLog.push(message.toJSON());
      if (this.sentLog.length > this.maxLogSize) {
        this.sentLog = this.sentLog.slice(-this.maxLogSize);
      }
    }

    _logReceived(message) {
      this.receivedLog.push(message.toJSON());
      if (this.receivedLog.length > this.maxLogSize) {
        this.receivedLog = this.receivedLog.slice(-this.maxLogSize);
      }
    }
  }

  return Object.freeze({
    CommunicationLayer,
    AgentMessage,
    CommunicationChannel,
    MESSAGE_TYPES
  });
})();
