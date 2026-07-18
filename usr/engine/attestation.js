// USR/CoreFab — Attestation Contract (C5)
// Constitutional Attestation Engine — cryptographic provenance of execution.

class AttestationEngine {
  constructor() {
    this.chain = [];
  }

  async attest(componentId, operation, input, output, result) {
    const inputHash = await sha256(typeof input === 'string' ? input : JSON.stringify(input));
    const outputHash = await sha256(typeof output === 'string' ? output : JSON.stringify(output));
    const ts = timestamp();

    const signingData = `${componentId}:${operation}:${inputHash}:${outputHash}:${ts}:${result}`;
    const signature = await sha256(`attestation:${signingData}`);

    const record = { componentId, operation, inputHash, outputHash, timestamp: ts, result, signature };
    this.chain.push(record);

    window.dispatchEvent(new CustomEvent('usr:attestation:created', { detail: { record } }));
    return record;
  }

  async verify(record) {
    const signingData = `${record.componentId}:${record.operation}:${record.inputHash}:${record.outputHash}:${record.timestamp}:${record.result}`;
    const expectedSig = await sha256(`attestation:${signingData}`);

    if (record.signature !== expectedSig) {
      throw new Error('AttestationFailed: Signature mismatch');
    }

    const inChain = this.chain.some(r =>
      r.componentId === record.componentId && r.operation === record.operation &&
      r.timestamp === record.timestamp && r.signature === record.signature
    );

    return inChain;
  }

  getChain(componentId) { return this.chain.filter(r => r.componentId === componentId); }
  fullChain() { return this.chain.slice(); }

  async verifyChain() {
    for (const record of this.chain) {
      await this.verify(record);
    }
    return true;
  }
}

window.AttestationEngine = AttestationEngine;
