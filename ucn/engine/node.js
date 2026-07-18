// UCN — Node Engine (network identity across space)
const NodeState = { Dormant:'dormant', Proving:'proving', Active:'active', Revoked:'revoked' };
const TrustLevel = { Unverified:'unverified', Provisional:'provisional', Established:'established' };
const TRUST_ORDER = { [TrustLevel.Unverified]:0, [TrustLevel.Provisional]:1, [TrustLevel.Established]:2 };

async function ucn_sha256(d) { const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(d)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function ucn_ts() { return new Date().toISOString(); }
function ucn_epoch() { return Date.now(); }

class NodeEngine {
  constructor() { this.nodes = new Map(); this.counter = 0; }

  async createNode(name, layer, capabilities) {
    const coreId = await ucn_sha256(`node:${name}:${layer}:${ucn_ts()}`);
    const node = {
      coreId, name, layer: layer || 'implementation',
      capabilities: capabilities || [],
      state: NodeState.Dormant,
      trustLevel: TrustLevel.Unverified,
      epoch: 0,
      capabilityDigest: await ucn_sha256(JSON.stringify(capabilities || [])),
      signature: null, history: [],
    };
    this.nodes.set(coreId, node);
    window.dispatchEvent(new CustomEvent('ucn:node:created', { detail: { coreId, name } }));
    return node;
  }

  async extendNetwork(coreId) {
    const n = this._get(coreId);
    if (n.state !== NodeState.Dormant) throw new Error(`IdentityNotDeclared: Node in ${n.state} state`);
    n.state = NodeState.Proving;
    n.epoch = ucn_epoch();
    n.signature = await ucn_sha256(`extend:${coreId}:${n.epoch}`);
    window.dispatchEvent(new CustomEvent('ucn:node:proving', { detail: { coreId } }));
    return n;
  }

  async activateNetwork(coreId) {
    const n = this._get(coreId);
    if (n.state !== NodeState.Proving) throw new Error(`IdentityNotDeclared: Cannot activate from ${n.state}`);
    n.state = NodeState.Active;
    window.dispatchEvent(new CustomEvent('ucn:node:active', { detail: { coreId } }));
    return n;
  }

  async revoke(coreId) {
    const n = this._get(coreId);
    if (n.state === NodeState.Revoked) throw new Error(`IdentityNotDeclared: Already revoked`);
    n.state = NodeState.Revoked;
    window.dispatchEvent(new CustomEvent('ucn:node:revoked', { detail: { coreId } }));
    return n;
  }

  getNode(coreId) { return this._get(coreId); }
  list() { return Array.from(this.nodes.values()); }
  listActive() { return this.list().filter(n => n.state === NodeState.Active); }
  getCapabilities(coreId) { return this._get(coreId).capabilities; }

  _get(id) { const n=this.nodes.get(id); if(!n) throw new Error(`IdentityNotDeclared: Node ${id}`); return n; }
}
window.NodeEngine = NodeEngine;
window.NodeState = NodeState;
window.TrustLevel = TrustLevel;
window.TRUST_ORDER = TRUST_ORDER;
window.ucn_sha256 = ucn_sha256;
window.ucn_ts = ucn_ts;
window.ucn_epoch = ucn_epoch;
