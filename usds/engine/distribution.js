// USDS — Distribution Engine v0.1.0
// DistributionRecord: distribute, track, revoke, verify chain of custody.

window.USDS_DistributionEngine = (() => {
  'use strict';

  const DB_NAME = 'usds_distribution';
  const STORE_NAME = 'records';
  const DB_VERSION = 1;

  function generateId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Distribution Channels ────────────────────────
  const CHANNELS = {
    SOVEREIGN: { id: 'sovereign', name: 'Sovereign Direct', icon: '🏛️' },
    FEDERATED: { id: 'federated', name: 'Federated Network', icon: '🌐' },
    LOCAL: { id: 'local', name: 'Local Distribution', icon: '📍' },
    ARCHIVE: { id: 'archive', name: 'Constitutional Archive', icon: '📜' },
    MIRROR: { id: 'mirror', name: 'Mirror Replication', icon: '🪞' }
  };

  // ── DistributionRecord Class ─────────────────────
  class DistributionRecord {
    constructor({ id, packageId, packageName, packageVersion, channel,
                  recipient, distributedBy, distributedAt, status,
                  distributionHash, metadata, revokedAt, revokedBy, revokeReason }) {
      this.id = id || generateId();
      this.packageId = packageId;
      this.packageName = packageName || '';
      this.packageVersion = packageVersion || '';
      this.channel = channel || 'sovereign';
      this.recipient = recipient || '';
      this.distributedBy = distributedBy || 'system';
      this.distributedAt = distributedAt || Date.now();
      this.status = status || 'active';
      this.distributionHash = distributionHash || null;
      this.metadata = metadata || {};
      this.revokedAt = revokedAt || null;
      this.revokedBy = revokedBy || null;
      this.revokeReason = revokeReason || null;
    }

    toJSON() {
      return { ...this };
    }

    static fromJSON(data) {
      return new DistributionRecord(data);
    }
  }

  // ── IndexedDB ────────────────────────────────────
  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('packageId', 'packageId', { unique: false });
          store.createIndex('channel', 'channel', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('distributedAt', 'distributedAt', { unique: false });
        }
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  function tx(mode) { return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME); }
  function promisify(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function init() { if (!db) await openDB(); }

  // ── Distribute ───────────────────────────────────
  async function distribute({ packageId, packageName, packageVersion, channel,
                               recipient, distributedBy, metadata }) {
    await init();
    const distHash = await sha256(`${packageId}:${channel}:${recipient}:${Date.now()}`);
    const record = new DistributionRecord({
      packageId, packageName, packageVersion,
      channel, recipient, distributedBy,
      distributionHash: distHash, metadata
    });
    await promisify(tx('readwrite').add(record.toJSON()));
    return record;
  }

  // ── Get All Distribution Records ─────────────────
  async function getAllRecords() {
    await init();
    const items = await promisify(tx('readonly').getAll());
    return items.map(d => DistributionRecord.fromJSON(d));
  }

  // ── Get History for a Package ────────────────────
  async function getDistributionHistory(packageId) {
    await init();
    const all = await promisify(tx('readonly').getAll());
    return all
      .filter(r => r.packageId === packageId)
      .map(d => DistributionRecord.fromJSON(d))
      .sort((a, b) => b.distributedAt - a.distributedAt);
  }

  // ── Revoke a Distribution ────────────────────────
  async function revokePackage(recordId, revokedBy, reason) {
    await init();
    const record = await promisify(tx('readonly').get(recordId));
    if (!record) throw new Error('Distribution record not found');
    record.status = 'revoked';
    record.revokedAt = Date.now();
    record.revokedBy = revokedBy || 'system';
    record.revokeReason = reason || 'Revoked by authority';
    await promisify(tx('readwrite').put(record));
    return DistributionRecord.fromJSON(record);
  }

  // ── Verify Chain of Custody ──────────────────────
  async function verifyChainOfCustody(packageId) {
    const records = await getDistributionHistory(packageId);
    if (records.length === 0) {
      return { valid: false, reason: 'No distribution records found', events: [] };
    }
    let chainBroken = false;
    let lastTimestamp = 0;
    const verified = records.map((r, i) => {
      if (i > 0 && r.distributedAt < lastTimestamp) chainBroken = true;
      lastTimestamp = r.distributedAt;
      const isActive = r.status === 'active' || r.status === 'revoked';
      return {
        id: r.id, action: r.status === 'revoked' ? 'REVOKED' : 'DISTRIBUTED',
        channel: r.channel, recipient: r.recipient,
        timestamp: r.distributedAt, status: r.status, valid: isActive
      };
    });
    return {
      valid: !chainBroken,
      chainBroken,
      totalEvents: records.length,
      activeEvents: records.filter(r => r.status === 'active').length,
      revokedEvents: records.filter(r => r.status === 'revoked').length,
      events: verified
    };
  }

  // ── Get Stats ────────────────────────────────────
  async function getStats() {
    const records = await getAllRecords();
    const total = records.length;
    const active = records.filter(r => r.status === 'active').length;
    const revoked = records.filter(r => r.status === 'revoked').length;
    const channels = {};
    for (const ch of Object.values(CHANNELS)) channels[ch.id] = 0;
    records.forEach(r => { if (channels[r.channel] !== undefined) channels[r.channel]++; });
    return { total, active, revoked, channels };
  }

  return {
    DistributionRecord, CHANNELS,
    init, distribute, getAllRecords,
    getDistributionHistory, revokePackage,
    verifyChainOfCustody, getStats
  };
})();