// USDS — Package Engine v0.1.0
// ConstitutionalPackage: create, sign, verify, and track constitutional software packages.

window.USDS_PackageEngine = (() => {
  'use strict';

  const DB_NAME = 'usds_packages';
  const STORE_NAME = 'packages';
  const DB_VERSION = 1;

  // ── SHA-256 Utility ──────────────────────────────
  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function sha256Hex(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── ID Generator ─────────────────────────────────
  function generateId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ── ConstitutionalPackage Class ──────────────────
  class ConstitutionalPackage {
    constructor({ id, name, version, content, metadata, signature,
                  attestations, chainOfCustody, contentHash, createdAt }) {
      this.id = id || generateId();
      this.name = name;
      this.version = version || '1.0.0';
      this.content = content || '';
      this.metadata = metadata || { type: 'constitutional', author: '', description: '' };
      this.signature = signature || null;
      this.attestations = attestations || [];
      this.chainOfCustody = chainOfCustody || [];
      this.contentHash = contentHash || null;
      this.createdAt = createdAt || Date.now();
      this.updatedAt = Date.now();
      this.size = new Blob([this.content]).size;
    }

    toJSON() {
      return {
        id: this.id, name: this.name, version: this.version,
        content: this.content, metadata: { ...this.metadata },
        signature: this.signature ? { ...this.signature } : null,
        attestations: this.attestations.map(a => ({ ...a })),
        chainOfCustody: this.chainOfCustody.map(c => ({ ...c })),
        contentHash: this.contentHash, createdAt: this.createdAt,
        updatedAt: this.updatedAt, size: this.size
      };
    }

    static fromJSON(data) {
      const pkg = new ConstitutionalPackage(data);
      return pkg;
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
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  function tx(mode) {
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  function promisify(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function init() {
    if (!db) await openDB();
  }

  // ── Create Package ───────────────────────────────
  async function createPackage({ name, version, content, metadata }) {
    await init();
    const contentHash = await sha256(content || '');
    const pkg = new ConstitutionalPackage({
      name, version, content, metadata, contentHash
    });
    pkg.chainOfCustody.push({
      action: 'CREATED',
      timestamp: Date.now(),
      actor: (metadata && metadata.author) || 'system',
      detail: `Package "${name}" v${version} created. Hash: ${contentHash.substring(0, 16)}...`
    });
    await promisify(tx('readwrite').add(pkg.toJSON()));
    return pkg;
  }

  // ── Get Package ──────────────────────────────────
  async function getPackage(id) {
    await init();
    const data = await promisify(tx('readonly').get(id));
    return data ? ConstitutionalPackage.fromJSON(data) : null;
  }

  // ── List All Packages ────────────────────────────
  async function getAllPackages() {
    await init();
    const items = await promisify(tx('readonly').getAll());
    return items.map(d => ConstitutionalPackage.fromJSON(d));
  }

  // ── Sign Package ─────────────────────────────────
  async function signPackage(id, signatureData) {
    await init();
    const pkg = await getPackage(id);
    if (!pkg) throw new Error('Package not found');
    pkg.signature = {
      algorithm: 'HMAC-SHA256',
      signer: signatureData.signer || 'constitutional-authority',
      publicKey: signatureData.publicKey || '',
      signatureHash: signatureData.signatureHash || await sha256(pkg.content + (signatureData.signer || '')),
      signedAt: Date.now()
    };
    pkg.updatedAt = Date.now();
    pkg.chainOfCustody.push({
      action: 'SIGNED',
      timestamp: Date.now(),
      actor: signatureData.signer || 'constitutional-authority',
      detail: `Package signed by ${pkg.signature.signer}. Sig: ${pkg.signature.signatureHash.substring(0, 16)}...`
    });
    await promisify(tx('readwrite').put(pkg.toJSON()));
    return pkg;
  }

  // ── Verify Package ───────────────────────────────
  async function verifyPackage(id) {
    const pkg = await getPackage(id);
    if (!pkg) return { valid: false, error: 'Package not found' };
    const currentHash = await sha256(pkg.content);
    const hashValid = currentHash === pkg.contentHash;
    let signatureValid = false;
    if (pkg.signature) {
      const expectedSig = await sha256(pkg.content + (pkg.signature.signer || ''));
      signatureValid = expectedSig === pkg.signature.signatureHash;
    }
    const chainValid = pkg.chainOfCustody.length > 0 &&
      pkg.chainOfCustody[0].action === 'CREATED';
    return {
      valid: hashValid && (pkg.signature ? signatureValid : true) && chainValid,
      hashValid, signatureValid, chainValid,
      contentHash: currentHash, expectedHash: pkg.contentHash,
      signature: pkg.signature, chainLength: pkg.chainOfCustody.length
    };
  }

  // ── Update Package ───────────────────────────────
  async function updatePackage(id, updates) {
    await init();
    const pkg = await getPackage(id);
    if (!pkg) throw new Error('Package not found');
    if (updates.content !== undefined) {
      pkg.content = updates.content;
      pkg.contentHash = await sha256(updates.content);
      pkg.size = new Blob([updates.content]).size;
    }
    if (updates.name) pkg.name = updates.name;
    if (updates.version) pkg.version = updates.version;
    if (updates.metadata) pkg.metadata = { ...pkg.metadata, ...updates.metadata };
    pkg.updatedAt = Date.now();
    await promisify(tx('readwrite').put(pkg.toJSON()));
    return pkg;
  }

  // ── Delete Package ───────────────────────────────
  async function deletePackage(id) {
    await init();
    return promisify(tx('readwrite').delete(id));
  }

  // ── Get Package History ──────────────────────────
  async function getPackageHistory(id) {
    const pkg = await getPackage(id);
    return pkg ? pkg.chainOfCustody : [];
  }

  // ── Add Attestation ──────────────────────────────
  async function addAttestation(id, attestation) {
    await init();
    const pkg = await getPackage(id);
    if (!pkg) throw new Error('Package not found');
    pkg.attestations.push({
      id: generateId(),
      attestor: attestation.attestor || 'anonymous',
      statement: attestation.statement || '',
      hash: attestation.hash || await sha256(attestation.statement || ''),
      timestamp: Date.now()
    });
    pkg.updatedAt = Date.now();
    await promisify(tx('readwrite').put(pkg.toJSON()));
    return pkg;
  }

  // ── Stats ────────────────────────────────────────
  async function getStats() {
    const packages = await getAllPackages();
    const total = packages.length;
    const signed = packages.filter(p => p.signature !== null).length;
    const totalAttestations = packages.reduce((s, p) => s + p.attestations.length, 0);
    const totalEvents = packages.reduce((s, p) => s + p.chainOfCustody.length, 0);
    return { total, signed, unsigned: total - signed, totalAttestations, totalEvents };
  }

  return {
    ConstitutionalPackage, sha256, sha256Hex, init,
    createPackage, getPackage, getAllPackages,
    signPackage, verifyPackage, updatePackage, deletePackage,
    getPackageHistory, addAttestation, getStats
  };
})();