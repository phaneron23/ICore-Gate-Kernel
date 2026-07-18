// USDS — Signature Engine v0.1.0
// ConstitutionalSignature: sign, verify, attest constitutional actions.

window.USDS_SigningEngine = (() => {
  'use strict';

  // ── SHA-256 Utility ──────────────────────────────
  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ── Key Pair Generation ──────────────────────────
  async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    );
    const rawKey = await crypto.subtle.exportKey('raw', keyPair);
    const keyHex = Array.from(new Uint8Array(rawKey))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    return { keyPair, keyHex };
  }

  // ── ConstitutionalSignature Class ────────────────
  class ConstitutionalSignature {
    constructor({ id, signer, algorithm, publicKey, signedAt, payload, signatureHash }) {
      this.id = id || generateId();
      this.signer = signer || 'constitutional-authority';
      this.algorithm = algorithm || 'HMAC-SHA256';
      this.publicKey = publicKey || '';
      this.signedAt = signedAt || Date.now();
      this.payload = payload || '';
      this.signatureHash = signatureHash || null;
    }

    toJSON() {
      return {
        id: this.id, signer: this.signer, algorithm: this.algorithm,
        publicKey: this.publicKey, signedAt: this.signedAt,
        payload: this.payload, signatureHash: this.signatureHash
      };
    }
  }

  // ── Sign Data ────────────────────────────────────
  async function sign(data, signerName, passphrase) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const salt = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const signingInput = `${payload}:${signerName}:${salt}`;
    const signatureHash = await sha256(signingInput);
    const sig = new ConstitutionalSignature({
      signer: signerName,
      payload: payload,
      signatureHash: signatureHash,
      publicKey: salt
    });
    return sig;
  }

  // ── Verify Signature ─────────────────────────────
  async function verify(signature, originalData) {
    if (!signature || !signature.signatureHash) {
      return { valid: false, error: 'No signature provided' };
    }
    const payload = typeof originalData === 'string'
      ? originalData : JSON.stringify(originalData);
    const salt = signature.publicKey;
    const signingInput = `${payload}:${signature.signer}:${salt}`;
    const expectedHash = await sha256(signingInput);
    const valid = expectedHash === signature.signatureHash;
    return {
      valid,
      signer: signature.signer,
      algorithm: signature.algorithm,
      signedAt: signature.signedAt,
      expectedHash: expectedHash.substring(0, 16) + '...',
      actualHash: signature.signatureHash.substring(0, 16) + '...'
    };
  }

  // ── Produce Attestation ──────────────────────────
  async function produceAttestation(attestor, statement, context) {
    const statementHash = await sha256(statement);
    const attestation = {
      id: generateId(),
      type: 'constitutional-attestation',
      attestor: attestor,
      statement: statement,
      statementHash: statementHash,
      context: context || {},
      timestamp: Date.now(),
      attestationHash: await sha256(`${attestor}:${statementHash}:${Date.now()}`)
    };
    return attestation;
  }

  // ── Verify Attestation ───────────────────────────
  async function verifyAttestation(attestation) {
    if (!attestation) return { valid: false, error: 'No attestation provided' };
    const statementHash = await sha256(attestation.statement);
    const hashValid = statementHash === attestation.statementHash;
    const expectedAttestHash = await sha256(
      `${attestation.attestor}:${statementHash}:${attestation.timestamp}`
    );
    const attestationHashValid = expectedAttestHash === attestation.attestationHash;
    const isValid = hashValid && attestationHashValid;
    const age = Date.now() - attestation.timestamp;
    const ageHours = (age / 3600000).toFixed(1);
    return {
      valid: isValid,
      hashValid,
      attestationHashValid,
      attestor: attestation.attestor,
      statement: attestation.statement,
      ageHours: parseFloat(ageHours),
      timestamp: attestation.timestamp
    };
  }

  // ── Batch Sign ───────────────────────────────────
  async function batchSign(items, signerName) {
    const results = [];
    for (const item of items) {
      const sig = await sign(item, signerName);
      results.push({ item, signature: sig });
    }
    return results;
  }

  // ── Verify Batch ─────────────────────────────────
  async function batchVerify(signatures, dataItems) {
    const results = [];
    for (let i = 0; i < signatures.length; i++) {
      const result = await verify(signatures[i], dataItems[i]);
      results.push(result);
    }
    return results;
  }

  return {
    ConstitutionalSignature,
    sha256, generateKeyPair,
    sign, verify,
    produceAttestation, verifyAttestation,
    batchSign, batchVerify
  };
})();