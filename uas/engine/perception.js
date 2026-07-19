// UAS — Perception Engine v1.0.0
// Policy-filtered event observation with bounded buffer management.
// Agents perceive only what their constitutional policy permits.

window.UASPerceptionEngine = (() => {
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

  const EVICTION = Object.freeze({
    Oldest: 'oldest',           // Remove oldest event first
    LowestPriority: 'lowest',   // Remove lowest priority first
    Reject: 'reject'            // Reject new event when full
  });

  const EVENT_TYPES = Object.freeze({
    Discovery: 'Discovery',
    Message: 'Message',
    TrustAssertion: 'TrustAssertion',
    StateChange: 'StateChange',
    GoalUpdate: 'GoalUpdate',
    ActionComplete: 'ActionComplete',
    PolicyViolation: 'PolicyViolation',
    System: 'System'
  });

  // ─── Perception Event ──────────────────────────────────────────────

  class PerceptionEvent {
    constructor(config) {
      this.id = config.id || generateId();
      this.source = config.source || 'unknown';
      this.eventType = config.eventType || EVENT_TYPES.System;
      this.payload = config.payload || {};
      this.priority = config.priority || 50;  // 0–255
      this.signature = config.signature || null;
      this.authenticated = config.authenticated !== false;
      this.receivedAt = isoNow();
    }

    toJSON() {
      return {
        id: this.id, source: this.source, eventType: this.eventType,
        payload: this.payload, priority: this.priority,
        signature: this.signature, authenticated: this.authenticated,
        receivedAt: this.receivedAt
      };
    }
  }

  // ─── Perception Filter ─────────────────────────────────────────────

  class PerceptionFilter {
    constructor(config) {
      this.id = config.id || generateId();
      this.name = config.name || 'Default Filter';
      this.allowedTypes = config.allowedTypes || null;  // null = all allowed
      this.blockedTypes = config.blockedTypes || [];     // explicit blocklist
      this.minPriority = config.minPriority || 0;
      this.requireAuthentication = config.requireAuthentication !== false;
      this.customPredicate = config.predicate || null;   // (event) → bool
    }

    matches(event) {
      // Authentication gate
      if (this.requireAuthentication && !event.authenticated) {
        return false;
      }

      // Type allowlist (if set, only these pass)
      if (this.allowedTypes && !this.allowedTypes.includes(event.eventType)) {
        return false;
      }

      // Type blocklist (always blocked)
      if (this.blockedTypes.includes(event.eventType)) {
        return false;
      }

      // Priority gate
      if (event.priority < this.minPriority) {
        return false;
      }

      // Custom predicate
      if (this.customPredicate && !this.customPredicate(event)) {
        return false;
      }

      return true;
    }

    toJSON() {
      return {
        id: this.id, name: this.name,
        allowedTypes: this.allowedTypes,
        blockedTypes: this.blockedTypes,
        minPriority: this.minPriority,
        requireAuthentication: this.requireAuthentication
      };
    }
  }

  // ─── Perception Buffer ─────────────────────────────────────────────

  class PerceptionBuffer {
    constructor(config) {
      this.maxSize = config.maxSize || 100;
      this.evictionStrategy = config.evictionStrategy || EVICTION.Oldest;
      this.events = [];
    }

    add(event) {
      if (this.events.length >= this.maxSize) {
        return this._evict(event);
      }
      this.events.push(event);
      return { added: true, evicted: null };
    }

    getLatest(count) {
      return this.events.slice(-count);
    }

    getByType(eventType) {
      return this.events.filter(e => e.eventType === eventType);
    }

    getBySource(source) {
      return this.events.filter(e => e.source === source);
    }

    search(predicate) {
      return this.events.filter(predicate);
    }

    size() {
      return this.events.length;
    }

    clear() {
      this.events = [];
    }

    _evict(newEvent) {
      let evicted = null;

      switch (this.evictionStrategy) {
        case EVICTION.Oldest:
          evicted = this.events.shift();
          this.events.push(newEvent);
          break;

        case EVICTION.LowestPriority:
          let lowestIdx = 0;
          for (let i = 1; i < this.events.length; i++) {
            if (this.events[i].priority < this.events[lowestIdx].priority) {
              lowestIdx = i;
            }
          }
          evicted = this.events.splice(lowestIdx, 1)[0];
          this.events.push(newEvent);
          break;

        case EVICTION.Reject:
          return { added: false, evicted: null, rejected: true };
      }

      return { added: true, evicted: evicted ? evicted.id : null };
    }
  }

  // ─── Perception Engine ─────────────────────────────────────────────

  class PerceptionEngine {
    constructor(config) {
      this.agentId = config?.agentId || 'default';
      this.filters = new Map();       // filterId → PerceptionFilter
      this.buffer = new PerceptionBuffer(config?.buffer || {});
      this.history = [];              // all perceived events (audit trail)
      this.maxHistory = config?.maxHistory || 500;
      this.stats = {
        received: 0,
        accepted: 0,
        rejected: 0,
        filtered: 0
      };
    }

    // ── Filter Management ──────────────────────────────────────────

    addFilter(filterConfig) {
      const filter = filterConfig instanceof PerceptionFilter
        ? filterConfig
        : new PerceptionFilter(filterConfig);
      this.filters.set(filter.id, filter);
      return filter;
    }

    removeFilter(filterId) {
      return this.filters.delete(filterId);
    }

    getFilters() {
      return Array.from(this.filters.values());
    }

    // ── Core Perception ────────────────────────────────────────────

    observe(eventConfig) {
      this.stats.received++;

      // Wrap raw config in PerceptionEvent
      const event = eventConfig instanceof PerceptionEvent
        ? eventConfig
        : new PerceptionEvent(eventConfig);

      // Apply all active filters
      const filterResult = this._applyFilters(event);
      if (!filterResult.allowed) {
        this.stats.filtered++;
        this._logHistory(event, 'filtered', filterResult.reason);
        return { perceived: false, event: event.toJSON(), reason: filterResult.reason };
      }

      // Sovereign rejection: agent may decline even permitted events
      // (caller can simulate this by not calling observe)

      // Add to bounded buffer
      const bufferResult = this.buffer.add(event);
      if (!bufferResult.added) {
        this.stats.rejected++;
        this._logHistory(event, 'rejected', 'buffer_full');
        return { perceived: false, event: event.toJSON(), reason: 'buffer_full' };
      }

      this.stats.accepted++;
      this._logHistory(event, 'perceived', null);

      return {
        perceived: true,
        event: event.toJSON(),
        buffer: { size: this.buffer.size(), max: this.buffer.maxSize },
        evicted: bufferResult.evicted
      };
    }

    // ── Query Methods ──────────────────────────────────────────────

    getPerceptionBuffer() {
      return this.buffer;
    }

    getPerceivedEvents(count) {
      return this.buffer.getLatest(count);
    }

    getEventsByType(eventType) {
      return this.buffer.getByType(eventType);
    }

    getEventsBySource(source) {
      return this.buffer.getBySource(source);
    }

    searchEvents(predicate) {
      return this.buffer.search(predicate);
    }

    getHistory(limit) {
      return limit ? this.history.slice(-limit) : [...this.history];
    }

    // ── Policy Integration ─────────────────────────────────────────

    createPolicyFilter(policy) {
      // Convert a UAS PolicyEngine policy into a PerceptionFilter
      const perceptionRules = policy.getRules ? policy.getRules('PerceptionFilter') : [];
      const allowedTypes = [];
      const blockedTypes = [];

      for (const rule of perceptionRules) {
        // Parse rule conditions into filter parameters
        if (rule.condition) {
          // Create a filter from the rule
          const filter = new PerceptionFilter({
            name: `Policy:${rule.name}`,
            predicate: rule.condition
          });
          this.filters.set(filter.id, filter);
        }
      }
    }

    // ── Internals ───────────────────────────────────────────────────

    _applyFilters(event) {
      const filters = Array.from(this.filters.values());

      if (filters.length === 0) {
        return { allowed: true };  // No filters = all events pass
      }

      for (const filter of filters) {
        if (!filter.matches(event)) {
          return { allowed: false, reason: `Blocked by filter: ${filter.name}` };
        }
      }

      return { allowed: true };
    }

    _logHistory(event, status, reason) {
      this.history.push({
        eventId: event.id,
        eventType: event.eventType,
        source: event.source,
        status,
        reason,
        timestamp: isoNow()
      });

      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }
    }

    getStats() {
      return {
        ...this.stats,
        bufferUsage: this.buffer.size(),
        bufferMax: this.buffer.maxSize,
        filters: this.filters.size,
        historySize: this.history.length
      };
    }

    clearBuffer() {
      this.buffer.clear();
    }

    clearHistory() {
      this.history = [];
    }

    // ── Pre-built Filters ──────────────────────────────────────────

    static authenticatedOnly() {
      return new PerceptionFilter({
        name: 'Authenticated Only',
        requireAuthentication: true
      });
    }

    static typesOnly(typeList) {
      return new PerceptionFilter({
        name: `Types: ${typeList.join(', ')}`,
        allowedTypes: typeList
      });
    }

    static excludeTypes(typeList) {
      return new PerceptionFilter({
        name: `Exclude: ${typeList.join(', ')}`,
        blockedTypes: typeList
      });
    }

    static highPriorityOnly(minPriority) {
      return new PerceptionFilter({
        name: `Priority ≥ ${minPriority}`,
        minPriority: minPriority
      });
    }
  }

  return Object.freeze({
    PerceptionEngine,
    PerceptionEvent,
    PerceptionFilter,
    PerceptionBuffer,
    EVICTION,
    EVENT_TYPES
  });
})();
