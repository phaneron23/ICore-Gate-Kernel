// USR/CoreFab — Isolation Contract (C4)
// Constitutional Isolation Engine — capability-based sandboxing.

const GOVERNED_RESOURCES = [
  'execution', 'attestation', 'orchestration',
  'identity', 'constraints', 'storage', 'network',
];

class IsolationEngine {
  constructor() {
    this.granted = new Map();
  }

  async requestCapability(componentId, resource, permissions) {
    if (!GOVERNED_RESOURCES.includes(resource)) {
      throw new Error(`CapabilityNotGranted: Resource '${resource}' is not governed`);
    }

    const capability = {
      resource,
      permissions: Array.isArray(permissions) ? permissions : [permissions],
      expires: 'permanent',
      grantedTo: componentId,
      grantedAt: timestamp(),
    };

    if (!this.granted.has(componentId)) this.granted.set(componentId, []);
    this.granted.get(componentId).push(capability);

    window.dispatchEvent(new CustomEvent('usr:isolation:granted', { detail: { componentId, capability } }));
    return capability;
  }

  checkCapability(componentId, resource, permission) {
    const caps = this.granted.get(componentId) || [];
    for (const cap of caps) {
      if (cap.resource === resource && cap.permissions.includes(permission)) {
        if (cap.expires === 'permanent' || cap.expires > timestamp()) return true;
      }
    }
    return false;
  }

  revokeCapability(componentId, resource) {
    const caps = this.granted.get(componentId) || [];
    const before = caps.length;
    const filtered = caps.filter(c => c.resource !== resource);
    this.granted.set(componentId, filtered);
    const revoked = filtered.length < before;
    if (revoked) window.dispatchEvent(new CustomEvent('usr:isolation:revoked', { detail: { componentId, resource } }));
    return revoked;
  }

  getCapabilities(componentId) { return this.granted.get(componentId) || []; }

  async verifyAll() {
    const now = timestamp();
    for (const [id, caps] of this.granted) {
      for (const cap of caps) {
        if (cap.expires !== 'permanent' && cap.expires < now) {
          throw new Error(`CapabilityNotGranted: Expired capability for ${id} on ${cap.resource}`);
        }
      }
    }
    return true;
  }
}

window.IsolationEngine = IsolationEngine;
window.GOVERNED_RESOURCES = GOVERNED_RESOURCES;
