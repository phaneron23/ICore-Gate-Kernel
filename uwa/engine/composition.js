// UWA — Composition Engine
class CompositionEngine {
  constructor() { this.graph = new Map(); }
  addEdge(parentId, childId, type) {
    if (!COMPOSITION_TYPES.includes(type)) throw new Error(`CompositionError: Invalid type '${type}'`);
    if (!this.graph.has(parentId)) this.graph.set(parentId, []);
    this.graph.get(parentId).push({ childId, type });
    window.dispatchEvent(new CustomEvent('uwa:composition:added', { detail: { parentId, childId, type } }));
  }
  getChildren(parentId) { return this.graph.get(parentId) || []; }
  getGraph() { const g = {}; for (const [k,v] of this.graph) g[k] = v; return g; }
  validate(components) {
    const ids = new Set(components.map(c => c.id));
    for (const [pid, edges] of this.graph) {
      if (!ids.has(pid)) throw new Error(`CompositionError: Parent ${pid} not found`);
      for (const e of edges) {
        if (!ids.has(e.childId)) throw new Error(`CompositionError: Child ${e.childId} not found`);
        const parent = components.find(c => c.id === pid);
        const child = components.find(c => c.id === e.childId);
        if (e.type === 'hierarchical' && child.lifecycle === ComponentLifecycle.Terminated && parent.lifecycle !== ComponentLifecycle.Terminated) {
          throw new Error(`CompositionError: Child terminated before parent`);
        }
      }
    }
    return true;
  }
}
window.CompositionEngine = CompositionEngine;
