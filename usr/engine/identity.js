// USR/CoreFab — Identity Contract (C1)
// Constitutional Identity Registry — every component declares who it is.

const ConstitutionalLayer = {
  Pre: { name: 'pre', ordinal: 0 },
  Uscp: { name: 'uscp', ordinal: 1 },
  Usc: { name: 'usc', ordinal: 2 },
  Science: { name: 'science', ordinal: 3 },
  Expression: { name: 'expression', ordinal: 4 },
  Execution: { name: 'execution', ordinal: 5 },
  Implementation: { name: 'implementation', ordinal: 6 },
};

const LAYER_MAP = {};
Object.values(ConstitutionalLayer).forEach(l => { LAYER_MAP[l.name] = l; });
LAYER_MAP['impl'] = LAYER_MAP['implementation'];

const CONSTITUTIONAL_QUESTIONS = [
  ['exist', 'What is?'],
  ['identity', 'Who/what is it?'],
  ['relationship', 'How is it connected?'],
  ['constraint', 'What governs it?'],
  ['transformation', 'How does it change?'],
  ['verification', 'How do we know it is valid?'],
];

async function sha256(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timestamp() {
  return new Date().toISOString();
}

class IdentityEngine {
  constructor() {
    this.components = new Map();
  }

  async declare(name, layer, version, parents, question) {
    const layerObj = typeof layer === 'string' ? (LAYER_MAP[layer.toLowerCase()] || ConstitutionalLayer.Implementation) : layer;
    const metadata = `${name}:${layerObj.name}:${version}:${(parents || []).join(',')}`;
    const id = await sha256(metadata);

    const component = {
      id, name, layer: layerObj, version,
      parents: parents || [], question,
    };

    await this.verify(component);
    return component;
  }

  async register(component) {
    await this.verify(component);
    if (this.components.has(component.id)) {
      throw new Error(`IdentityNotDeclared: Component ${component.id} already registered`);
    }
    this.components.set(component.id, component);
    window.dispatchEvent(new CustomEvent('usr:identity:registered', { detail: { component } }));
    return component;
  }

  async verify(component) {
    if (!component.name || component.name.length === 0) {
      throw new Error('IdentityNotDeclared: Component has no name');
    }
    if (component.layer.name === 'pre' && component.parents.length > 0) {
      throw new Error('ConstraintViolation: Pre-constitutional components cannot have parents');
    }
    if (component.layer.name !== 'pre' && component.parents.length === 0) {
      throw new Error('ConstraintViolation: Non-pre components must derive from a parent');
    }
    if (!component.question || component.question.length === 0) {
      throw new Error('IdentityNotDeclared: Component does not answer a constitutional question');
    }
    return true;
  }

  lookup(id) { return this.components.get(id) || null; }

  atLayer(layerName) {
    const layer = typeof layerName === 'string' ? LAYER_MAP[layerName.toLowerCase()] : layerName;
    return Array.from(this.components.values()).filter(c => c.layer.name === layer.name);
  }

  async verifyAll() {
    for (const component of this.components.values()) {
      await this.verify(component);
      for (const parentId of component.parents) {
        const parent = this.lookup(parentId);
        if (parent && parent.layer.ordinal > component.layer.ordinal) {
          throw new Error(`ConstraintViolation: ${component.name} derives from ${parent.name} at higher layer`);
        }
      }
    }
    return true;
  }

  list() { return Array.from(this.components.values()); }
}

window.IdentityEngine = IdentityEngine;
window.ConstitutionalLayer = ConstitutionalLayer;
window.LAYER_MAP = LAYER_MAP;
window.CONSTITUTIONAL_QUESTIONS = CONSTITUTIONAL_QUESTIONS;
window.sha256 = sha256;
window.timestamp = timestamp;
