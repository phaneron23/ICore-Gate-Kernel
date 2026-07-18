// USDS — Verification Engine v0.1.0
// VerificationResult: full verify, quick verify, produce verification reports.

window.USDS_VerificationEngine = (() => {
  'use strict';

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

  function ts(epoch) {
    return new Date(epoch).toISOString();
  }

  // ── VerificationResult Class ─────────────────────
  class VerificationResult {
    constructor({ id, packageId, packageName, integrity, signature,
                  chainOfCustody, attestations, fullReport, verifiedAt }) {
      this.id = id || generateId();
      this.packageId = packageId;
      this.packageName = packageName || '';
      this.integrity = integrity || { valid: false, currentHash: '', expectedHash: '' };
      this.signature = signature || { valid: false, signer: '', signedAt: null };
      this.chainOfCustody = chainOfCustody || { valid: false, events: 0 };
      this.attestations = attestations || { valid: false, count: 0, verified: 0 };
      this.fullReport = fullReport || null;
      this.verifiedAt = verifiedAt || Date.now();
    }

    get overallValid() {
      return this.integrity.valid && this.signature.valid &&
             this.chainOfCustody.valid && this.attestations.valid;
    }

    toJSON() {
      return {
        id: this.id, packageName: this.packageName,
        integrity: { ...this.integrity },
        signature: { ...this.signature },
        chainOfCustody: { ...this.chainOfCustody },
        attestations: { ...this.attestations },
        overallValid: this.overallValid,
        verifiedAt: this.verifiedAt
      };
    }
  }

  // ── Full Verify ──────────────────────────────────
  async function fullVerify(pkg) {
    if (!pkg) {
      return new VerificationResult({
        packageId: '',
        integrity: { valid: false, error: 'No package provided' }
      });
    }

    // 1. Integrity check
    const currentHash = await sha256(pkg.content || '');
    const hashValid = currentHash === pkg.contentHash;
    const integrity = {
      valid: hashValid,
      currentHash: currentHash,
      expectedHash: pkg.contentHash || '',
      match: hashValid
    };

    // 2. Signature check
    let signature = { valid: false, signer: '', signedAt: null };
    if (pkg.signature) {
      const salt = pkg.signature.publicKey || '';
      const sigInput = `${pkg.content}:${pkg.signature.signer}:${salt}`;
      const expectedHash = await sha256(sigInput);
      const sigValid = expectedHash === pkg.signature.signatureHash;
      signature = {
        valid: sigValid,
        signer: pkg.signature.signer,
        algorithm: pkg.signature.algorithm,
        signedAt: pkg.signature.signedAt,
        signedAtStr: pkg.signature.signedAt ? ts(pkg.signature.signedAt) : ''
      };
    } else {
      signature = { valid: false, signer: 'unsigned', signedAt: null, unsigned: true };
    }

    // 3. Chain of custody check
    const chain = pkg.chainOfCustody || [];
    const chainValid = chain.length > 0 && chain[0].action === 'CREATED';
    let chainBroken = false;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].timestamp < chain[i - 1].timestamp) { chainBroken = true; break; }
    }
    const chainOfCustody = {
      valid: chainValid && !chainBroken,
      events: chain.length,
      chainBroken,
      firstEvent: chain[0] ? ts(chain[0].timestamp) : null,
      lastEvent: chain.length > 0 ? ts(chain[chain.length - 1].timestamp) : null
    };

    // 4. Attestations check
    const atts = pkg.attestations || [];
    let verifiedAtts = 0;
    for (const att of atts) {
      const stmtHash = await sha256(att.statement);
      if (stmtHash === att.hash) verifiedAtts++;
    }
    const attestations = {
      valid: atts.length === 0 || verifiedAtts === atts.length,
      count: atts.length,
      verified: verifiedAtts,
      unverified: atts.length - verifiedAtts
    };

    const result = new VerificationResult({
      packageId: pkg.id,
      packageName: pkg.name,
      integrity, signature, chainOfCustody, attestations
    });

    return result;
  }

  // ── Quick Verify ─────────────────────────────────
  async function quickVerify(pkg) {
    if (!pkg) return { valid: false, error: 'No package' };
    const currentHash = await sha256(pkg.content || '');
    return {
      valid: currentHash === pkg.contentHash,
      hashMatch: currentHash === pkg.contentHash,
      hasSignature: !!pkg.signature,
      hasChain: (pkg.chainOfCustody || []).length > 0,
      packageName: pkg.name
    };
  }

  // ── Produce Verification Report ──────────────────
  async function produceVerificationReport(pkg) {
    const result = await fullVerify(pkg);
    const report = {
      id: generateId(),
      packageName: pkg.name,
      packageVersion: pkg.version,
      packageId: pkg.id,
      overallStatus: result.overallValid ? 'PASS' : 'FAIL',
      sections: [
        {
          name: 'Integrity Verification',
          status: result.integrity.valid ? 'PASS' : 'FAIL',
          details: `Content hash: ${result.integrity.valid ? 'MATCH' : 'MISMATCH'}`,
          currentHash: result.integrity.currentHash,
          expectedHash: result.integrity.expectedHash
        },
        {
          name: 'Signature Verification',
          status: result.signature.valid ? 'PASS' : (result.signature.unsigned ? 'N/A' : 'FAIL'),
          details: result.signature.unsigned
            ? 'Package is unsigned'
            : `Signed by ${result.signature.signer} — ${result.signature.valid ? 'VALID' : 'INVALID'}`,
          signer: result.signature.signer,
          algorithm: result.signature.algorithm || 'N/A'
        },
        {
          name: 'Chain of Custody',
          status: result.chainOfCustody.valid ? 'PASS' : 'FAIL',
          details: `${result.chainOfCustody.events} event(s) — ${result.chainOfCustody.chainBroken ? 'BROKEN' : 'INTACT'}`,
          events: result.chainOfCustody.events
        },
        {
          name: 'Attestations',
          status: result.attestations.valid ? 'PASS' : 'FAIL',
          details: `${result.attestations.verified}/${result.attestations.count} attestation(s) verified`
        }
      ],
      verifiedAt: Date.now(),
      verifiedAtStr: ts(Date.now())
    };
    result.fullReport = report;
    return { result, report };
  }

  // ── Verify Multiple Packages ─────────────────────
  async function batchVerify(packages) {
    const results = [];
    for (const pkg of packages) {
      const result = await quickVerify(pkg);
      results.push(result);
    }
    return results;
  }

  return {
    VerificationResult,
    fullVerify, quickVerify,
    produceVerificationReport, batchVerify, sha256
  };
})();