// UCA — Serialization Engine (constitutional meaning ↔ external formats)
class SerializationEngine {
  constructor(adapterEngine) { this.adapterEngine = adapterEngine; this.roundTrips = []; }

  async serialize(adapterId, data) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'serialization') throw new Error(`InvalidDomain: Adapter not serialization`);
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    const hash = await uca_sha256(JSON.stringify(data));
    const record = { adapterId, format: a.profile, hash, timestamp: uca_ts(), size: bytes.length };
    window.dispatchEvent(new CustomEvent('uca:serialization:serialize', { detail: record }));
    return { bytes, record };
  }

  async deserialize(adapterId, bytes) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'serialization') throw new Error(`InvalidDomain: Adapter not serialization`);
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }

  async verifyRoundtrip(adapterId, data) {
    const { bytes } = await this.serialize(adapterId, data);
    const result = await this.deserialize(adapterId, bytes);
    const identical = JSON.stringify(data) === JSON.stringify(result);
    this.roundTrips.push({ adapterId, identical, timestamp: uca_ts() });
    return identical;
  }

  getRoundTrips() { return this.roundTrips; }
}
window.SerializationEngine = SerializationEngine;
