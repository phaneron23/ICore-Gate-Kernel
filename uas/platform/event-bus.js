// ICore Platform — Constitutional Event Bus v0.1.0
// Publish/subscribe event system for cross-PWA constitutional communication.
// Supports wildcards, priorities, event history, and typed events.

window.EventBus = (() => {
  'use strict';

  const MAX_HISTORY = 100;

  const PRIORITIES = Object.freeze({
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  });

  // ─── Internal State ──────────────────────────────────────────────

  // Map of eventType -> Array of { id, callback, priority, once }
  const subscriptions = new Map();

  // Circular buffer of past events
  const eventHistory = [];

  // ─── Helpers ─────────────────────────────────────────────────────

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function normalizePriority(priority) {
    if (priority === undefined || priority === null) return 'normal';
    if (typeof priority === 'number') {
      const names = Object.keys(PRIORITIES);
      return names[priority] || 'normal';
    }
    return PRIORITIES[priority] !== undefined ? priority : 'normal';
  }

  function createEvent(type, payload, source, priority) {
    return {
      id: generateId(),
      type,
      payload: payload !== undefined ? payload : null,
      timestamp: new Date().toISOString(),
      source: source || 'platform',
      priority: normalizePriority(priority),
    };
  }

  function addHistory(event) {
    eventHistory.push(event);
    if (eventHistory.length > MAX_HISTORY) {
      eventHistory.shift();
    }
  }

  function matchesWildcard(pattern, eventType) {
    // '*' matches everything
    if (pattern === '*') return true;
    // 'namespace.*' matches 'namespace.anything'
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType === prefix || eventType.startsWith(prefix + '.');
    }
    return false;
  }

  function matchesSubscription(pattern, eventType) {
    // Exact match
    if (pattern === eventType) return true;
    // Wildcard match
    return matchesWildcard(pattern, eventType);
  }

  // ─── Core API ────────────────────────────────────────────────────

  /**
   * Subscribe to an event type.
   * @param {string} eventType - Event type string or '*' for all events.
   * @param {Function} callback - Handler function receiving the event object.
   * @param {string} [priority='normal'] - Subscriber priority: 'critical'|'high'|'normal'|'low'.
   * @returns {string} Subscription ID for unsubscribing.
   */
  function subscribe(eventType, callback, priority) {
    if (typeof eventType !== 'string') throw new TypeError('eventType must be a string');
    if (typeof callback !== 'function') throw new TypeError('callback must be a function');

    const sub = {
      id: generateId(),
      callback,
      priority: normalizePriority(priority),
      once: false,
    };

    if (!subscriptions.has(eventType)) {
      subscriptions.set(eventType, []);
    }
    subscriptions.get(eventType).push(sub);

    return sub.id;
  }

  /**
   * Subscribe to an event type, firing only once.
   * @param {string} eventType - Event type string or '*'.
   * @param {Function} callback - Handler function.
   * @param {string} [priority='normal'] - Subscriber priority.
   * @returns {string} Subscription ID.
   */
  function once(eventType, callback, priority) {
    if (typeof eventType !== 'string') throw new TypeError('eventType must be a string');
    if (typeof callback !== 'function') throw new TypeError('callback must be a function');

    const sub = {
      id: generateId(),
      callback,
      priority: normalizePriority(priority),
      once: true,
    };

    if (!subscriptions.has(eventType)) {
      subscriptions.set(eventType, []);
    }
    subscriptions.get(eventType).push(sub);

    return sub.id;
  }

  /**
   * Publish an event.
   * @param {string} eventType - Event type string.
   * @param {*} [payload] - Event payload.
   * @param {string} [source] - Originating source identifier.
   * @param {string} [priority='normal'] - Event priority.
   * @returns {object} The typed event object that was published.
   */
  function publish(eventType, payload, source, priority) {
    if (typeof eventType !== 'string') throw new TypeError('eventType must be a string');

    const event = createEvent(eventType, payload, source, priority);
    addHistory(event);

    // Collect all matching subscribers across exact and wildcard patterns
    const matchingSubs = [];
    const priorityOrder = ['critical', 'high', 'normal', 'low'];

    for (const [pattern, subs] of subscriptions) {
      if (matchesSubscription(pattern, eventType)) {
        for (const sub of subs) {
          matchingSubs.push(sub);
        }
      }
    }

    // Sort by priority (critical first)
    matchingSubs.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });

    // Fire handlers; collect once-subscription IDs to remove
    const toRemove = [];

    for (const sub of matchingSubs) {
      try {
        sub.callback(event);
      } catch (err) {
        console.error(`EventBus: Error in handler for '${eventType}':`, err);
      }
      if (sub.once) {
        toRemove.push(sub);
      }
    }

    // Remove once-subscriptions
    for (const sub of toRemove) {
      for (const [, subs] of subscriptions) {
        const idx = subs.indexOf(sub);
        if (idx !== -1) {
          subs.splice(idx, 1);
          break;
        }
      }
    }

    return event;
  }

  /**
   * Unsubscribe from events.
   * @param {string} eventType - The event type to unsubscribe from.
   * @param {string|Function} idOrCallback - Subscription ID or callback reference.
   * @returns {boolean} True if subscription was found and removed.
   */
  function off(eventType, idOrCallback) {
    if (!subscriptions.has(eventType)) return false;

    const subs = subscriptions.get(eventType);
    const before = subs.length;

    if (typeof idOrCallback === 'function') {
      // Remove by callback reference
      for (let i = subs.length - 1; i >= 0; i--) {
        if (subs[i].callback === idOrCallback) {
          subs.splice(i, 1);
        }
      }
    } else if (typeof idOrCallback === 'string') {
      // Remove by subscription ID
      for (let i = subs.length - 1; i >= 0; i--) {
        if (subs[i].id === idOrCallback) {
          subs.splice(i, 1);
          break;
        }
      }
    } else {
      // Remove all subscriptions for this event type
      subscriptions.delete(eventType);
      return before > 0;
    }

    return subs.length < before;
  }

  /**
   * Get event history (most recent last).
   * @param {number} [count] - Number of recent events to return. Defaults to all.
   * @returns {Array} Array of event objects.
   */
  function history(count) {
    if (count === undefined) return [...eventHistory];
    return eventHistory.slice(-count);
  }

  /**
   * Clear event history.
   */
  function clearHistory() {
    eventHistory.length = 0;
  }

  /**
   * Get all active subscription counts.
   * @returns {object} Map of event types to subscriber counts.
   */
  function subscribers() {
    const result = {};
    for (const [eventType, subs] of subscriptions) {
      result[eventType] = subs.length;
    }
    return result;
  }

  /**
   * Remove all subscriptions and clear history.
   */
  function reset() {
    subscriptions.clear();
    eventHistory.length = 0;
  }

  // ─── Public API ──────────────────────────────────────────────────

  return Object.freeze({
    PRIORITIES,
    subscribe,
    once,
    publish,
    off,
    history,
    clearHistory,
    subscribers,
    reset,
  });
})();
