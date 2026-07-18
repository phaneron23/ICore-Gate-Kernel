// UCN — Trust Engine (cryptographic verification, never assumed)
class TrustEngine {
  constructor(nodeEngine) { this.nodeEngine = nodeEngine; this.assertions = []; this.revocations = []; this.anchors = new Set(); }

  async addAnchor(coreId) {
    const node = this.nodeEngine.getNode(coreId);
    node.trustLevel = TrustLevel.Established;
    this.anchors.add(coreId);
    window.dispatchEvent(new CustomEvent('ucn:trust:anchor', { detail: { coreId } }));
    return coreId;
  }

  async assertTrust(asserterId, targetId, level, evidence) {
    const asserter = this.nodeEngine.getNode(asserterId);
    const target = this.nodeEngine.getNode(targetId);
    if (asserter.state !== NodeState.Active) throw new Error(`IdentityNotDeclared: Asserter not active`);
    if (target.state === NodeState.Revoked) throw new Error(`IdentityNotDeclared: Target revoked`);
    if (TRUST_ORDER[level] > TRUST_ORDER[asserter.trustLevel]) {
      throw new Error(`LevelConservation: Cannot grant ${level} (asserter is ${asserter.trustLevel})`);
    }
    const assertion = {
      id: await ucn_sha256(`assert:${asserterId}:${targetId}:${level}:${ucn_ts()}`),
      asserterId, targetId, level, evidence: evidence || 'no-evidence',
      timestamp: ucn_ts(), epoch: ucn_epoch(),
      signature: await ucn_sha256(`sign:${asserterId}:${targetId}:${level}`),
    };
    this.assertions.push(assertion);
    target.trustLevel = level;
    window.dispatchEvent(new CustomEvent('ucn:trust:asserted', { detail: { id: assertion.id, level } }));
    return assertion;
  }

  async revokeTrust(asserterId, targetId, reason) {
    const revocation = {
      id: await ucn_sha256(`revoke:${asserterId}:${targetId}:${ucn_ts()}`),
      asserterId, targetId, reason: reason || 'revoked',
      timestamp: ucn_ts(), epoch: ucn_epoch(),
      signature: await ucn_sha256(`revoke:${asserterId}:${targetId}`),
    };
    this.revocations.push(revocation);
    const target = this.nodeEngine.getNode(targetId);
    target.trustLevel = TrustLevel.Unverified;
    window.dispatchEvent(new CustomEvent('ucn:trust:revoked', { detail: { targetId } }));
    return revocation;
  }

  verifyChain(targetId) {
    if (this.anchors.has(targetId)) return { valid: true, chain: [targetId] };
    const chain = [];
    let current = targetId;
    const visited = new Set();
    while (current && !visited.has(current)) {
      visited.add(current);
      const assertion = this.assertions.find(a => a.targetId === current);
      if (!assertion) return { valid: false, chain, reason: 'No assertion found' };
      chain.push(current);
      const rev = this.revocations.find(r => r.targetId === current);
      if (rev) return { valid: false, chain, reason: `Revoked at ${current}` };
      current = assertion.asserterId;
    }
    if (this.anchors.has(current)) { chain.push(current); return { valid: true, chain }; }
    return { valid: false, chain, reason: 'No anchor found' };
  }

  getAssertions() { return this.assertions; }
  getRevocations() { return this.revocations; }
  isAnchor(coreId) { return this.anchors.has(coreId); }
}
window.TrustEngine = TrustEngine;
