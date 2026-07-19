// ICore JSON-LD Context Engine v1.0.0
// Loads the constitutional vocabulary (context.jsonld) and provides:
//   - Typed entity creation with @type and @context
//   - Serialization to JSON-LD documents
//   - Deserialization from JSON-LD documents
//   - Semantic linking between entities
//   - Vocabulary queries for display and tooling
//   - Structural validation against the schema
//
// Depends on: EventBus (platform/event-bus.js)
// Used by: UAS engines (agent, action, communication, policy, sovereignty)

window.ICoreContext = (() => {
  'use strict';

  const CONTEXT_URL = '/context/v1/context.jsonld';
  const VOCAB_IRI = 'https://initialcore.net/context/v1#';

  // ─── Embedded Vocabulary (inline fallback) ────────────────────────

  const VOCABULARY = {
    classes: {
      ConstitutionalEngine:  { parent: 'ConstitutionalEntity', id: 'icore:ConstitutionalEngine' },
      Runtime:               { parent: 'ConstitutionalEntity', id: 'icore:Runtime' },
      Specification:         { parent: 'ConstitutionalEntity', id: 'icore:Specification' },
      Verification:          { parent: 'ConstitutionalEntity', id: 'icore:Verification' },
      Attestation:           { parent: 'ConstitutionalEntity', id: 'icore:Attestation' },
      Workflow:              { parent: 'ConstitutionalEntity', id: 'icore:Workflow' },
      Event:                 { parent: 'ConstitutionalEntity', id: 'icore:Event' },
      Identity:              { parent: 'ConstitutionalEntity', id: 'icore:Identity' },
      Policy:                { parent: 'ConstitutionalEntity', id: 'icore:Policy' },
      Constraint:            { parent: 'ConstitutionalEntity', id: 'icore:Constraint' },
      Capability:            { parent: 'ConstitutionalEntity', id: 'icore:Capability' },
      Adapter:               { parent: 'ConstitutionalEntity', id: 'icore:Adapter' },
      Workspace:             { parent: 'ConstitutionalEntity', id: 'icore:Workspace' },
      Agent:                 { parent: 'ConstitutionalEntity', id: 'icore:Agent' },
      Tool:                  { parent: 'ConstitutionalEntity', id: 'icore:Tool' },
      Knowledge:             { parent: 'ConstitutionalEntity', id: 'icore:Knowledge' },
      Document:              { parent: 'ConstitutionalEntity', id: 'icore:Document' },
      Project:               { parent: 'ConstitutionalEntity', id: 'icore:Project' },
      Provenance:            { parent: 'ConstitutionalEntity', id: 'icore:Provenance' }
    },
    properties: {
      implements:   { type: '@id',     id: 'icore:implements' },
      defines:      { type: '@id',     id: 'icore:defines' },
      invokes:      { type: '@id',     id: 'icore:invokes' },
      emits:        { type: '@id',     id: 'icore:emits' },
      produces:     { type: '@id',     id: 'icore:produces' },
      generates:    { type: '@id',     id: 'icore:generates' },
      attests:      { type: '@id',     id: 'icore:attests' },
      adapts:       { type: '@id',     id: 'icore:adapts' },
      transports:   { type: '@id',     id: 'icore:transports' },
      distributes:  { type: '@id',     id: 'icore:distributes' },
      presents:     { type: '@id',     id: 'icore:presents' },
      conforms:     { type: '@id',     id: 'icore:conforms' },
      validates:    { type: '@id',     id: 'icore:validates' }
    },
    dataProperties: {
      trustLevel: { type: 'xsd:string',  id: 'icore:trustLevel' },
      version:    { type: 'xsd:string',  id: 'icore:version' },
      status:     { type: 'xsd:string',  id: 'icore:status' },
      timestamp:  { type: 'xsd:dateTime', id: 'icore:timestamp' },
      evidence:   { type: null,          id: 'icore:evidence' },
      result:     { type: 'xsd:string',  id: 'icore:result' },
      score:      { type: 'xsd:decimal', id: 'icore:score' },
      hash:       { type: 'xsd:string',  id: 'icore:hash' },
      engine:     { type: '@id',         id: 'icore:engine' },
      subsystem:  { type: 'xsd:string',  id: 'icore:subsystem' }
    }
  };

  // ─── Entity Registry ──────────────────────────────────────────────

  class EntityRegistry {
    constructor() {
      this.entities = new Map();  // iri → JSON-LD entity
    }

    register(entity) {
      if (!entity['@id']) throw new Error('Entity must have @id');
      this.entities.set(entity['@id'], entity);
      return entity;
    }

    get(iri) {
      return this.entities.get(iri) || null;
    }

    remove(iri) {
      return this.entities.delete(iri);
    }

    findByType(type) {
      const results = [];
      for (const entity of this.entities.values()) {
        const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']];
        if (types.includes(type) || types.includes('icore:' + type)) {
          results.push(entity);
        }
      }
      return results;
    }

    findAll() {
      return Array.from(this.entities.values());
    }

    size() {
      return this.entities.size;
    }
  }

  // ─── Context Engine ───────────────────────────────────────────────

  class ContextEngine {
    constructor() {
      this.context = null;         // Loaded context object
      this.registry = new EntityRegistry();
      this.vocabulary = VOCABULARY;
      this.loaded = false;
    }

    // ── Loading ────────────────────────────────────────────────────

    async load() {
      try {
        const resp = await fetch(CONTEXT_URL);
        if (resp.ok) {
          this.context = await resp.json();
          this.loaded = true;
          return true;
        }
      } catch (e) {
        // Network unavailable — use embedded vocabulary
      }
      // Build context from embedded vocabulary
      this.context = this._buildContextFromVocab();
      this.loaded = true;
      return true;
    }

    loadSync() {
      this.context = this._buildContextFromVocab();
      this.loaded = true;
      return true;
    }

    // ── Entity Creation ────────────────────────────────────────────

    createEntity(type, props) {
      const className = type.charAt(0).toUpperCase() + type.slice(1);
      const classDef = this.vocabulary.classes[className];
      if (!classDef) {
        // Allow unknown types — they still get JSON-LD framing
      }

      const entity = {
        '@context': VOCAB_IRI,
        '@id': props.id || this._generateIRI(type),
        '@type': 'icore:' + className,
        ...this._serializeProps(props),
        'icore:timestamp': props.timestamp || new Date().toISOString()
      };

      this.registry.register(entity);
      return entity;
    }

    // ── Serialization ──────────────────────────────────────────────

    toJSON_LD(obj, type) {
      if (obj['@context']) return obj; // Already JSON-LD

      const className = type || this._inferType(obj);
      return {
        '@context': VOCAB_IRI,
        '@id': obj.id || obj['@id'] || this._generateIRI(className || 'Entity'),
        '@type': 'icore:' + (className || 'ConstitutionalEntity'),
        ...this._serializeProps(obj),
        'icore:timestamp': obj.timestamp || new Date().toISOString()
      };
    }

    fromJSON_LD(doc) {
      if (!doc || !doc['@context']) return doc;

      const result = {};
      const type = doc['@type'];
      if (type) result._type = type.replace('icore:', '');

      for (const [key, value] of Object.entries(doc)) {
        if (key === '@context' || key === '@type') continue;
        if (key === '@id') { result.id = value; continue; }
        // Strip icore: prefix for clean output
        const cleanKey = key.replace('icore:', '');
        result[cleanKey] = value;
      }

      return result;
    }

    // ── Linking ────────────────────────────────────────────────────

    link(subjectIRI, predicate, objectIRI) {
      const subject = this.registry.get(subjectIRI);
      if (!subject) throw new Error(`Subject '${subjectIRI}' not in registry`);

      const propDef = this.vocabulary.properties[predicate];
      const predIRI = propDef ? propDef.id : 'icore:' + predicate;

      if (!subject[predIRI]) {
        subject[predIRI] = objectIRI;
      } else if (Array.isArray(subject[predIRI])) {
        subject[predIRI].push(objectIRI);
      } else {
        subject[predIRI] = [subject[predIRI], objectIRI];
      }

      return subject;
    }

    getLinked(entityIRI, predicate) {
      const entity = this.registry.get(entityIRI);
      if (!entity) return [];

      const propDef = this.vocabulary.properties[predicate];
      const predIRI = propDef ? propDef.id : 'icore:' + predicate;
      const value = entity[predIRI];

      if (!value) return [];
      const values = Array.isArray(value) ? value : [value];
      return values.map(v => this.registry.get(v)).filter(Boolean);
    }

    // ── Validation ─────────────────────────────────────────────────

    validate(entity) {
      const errors = [];
      const warnings = [];

      // Must have @context
      if (!entity['@context']) {
        errors.push({ field: '@context', message: 'Missing @context' });
      }

      // Must have @type
      if (!entity['@type']) {
        errors.push({ field: '@type', message: 'Missing @type' });
      } else {
        const type = entity['@type'].replace('icore:', '');
        if (!this.vocabulary.classes[type]) {
          warnings.push({ field: '@type', message: `Unknown class: ${type} (not in vocabulary)` });
        }
      }

      // Must have @id
      if (!entity['@id']) {
        errors.push({ field: '@id', message: 'Missing @id' });
      }

      // Validate data property types
      for (const [key, value] of Object.entries(entity)) {
        if (key.startsWith('@')) continue;
        const propName = key.replace('icore:', '');
        const dataDef = this.vocabulary.dataProperties[propName];
        if (dataDef && dataDef.type && value !== null && value !== undefined) {
          if (dataDef.type === 'xsd:dateTime' && isNaN(Date.parse(value))) {
            warnings.push({ field: key, message: `Invalid dateTime: ${value}` });
          }
          if (dataDef.type === 'xsd:decimal' && typeof value !== 'number') {
            warnings.push({ field: key, message: `Expected decimal, got ${typeof value}` });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        entity: entity['@id']
      };
    }

    // ── Vocabulary Queries ─────────────────────────────────────────

    getClasses() {
      return Object.entries(this.vocabulary.classes).map(([name, def]) => ({
        name,
        iri: def.id,
        parent: def.parent
      }));
    }

    getProperties() {
      return Object.entries(this.vocabulary.properties).map(([name, def]) => ({
        name,
        iri: def.id,
        type: def.type
      }));
    }

    getDataProperties() {
      return Object.entries(this.vocabulary.dataProperties).map(([name, def]) => ({
        name,
        iri: def.id,
        type: def.type
      }));
    }

    getClassHierarchy() {
      const hierarchy = {};
      for (const [name, def] of Object.entries(this.vocabulary.classes)) {
        if (!hierarchy[def.parent]) hierarchy[def.parent] = [];
        hierarchy[def.parent].push(name);
      }
      return hierarchy;
    }

    // ── Document Building ──────────────────────────────────────────

    buildDocument(type, properties) {
      const entity = this.createEntity(type, properties);

      // Auto-link to related entities in registry
      if (properties.parent) {
        this.link(entity['@id'], 'conforms', properties.parent);
      }
      if (properties.engine) {
        this.link(entity['@id'], 'implements', properties.engine);
      }

      return {
        '@context': {
          '@version': '1.1',
          '@vocab': VOCAB_IRI,
          'icore': VOCAB_IRI
        },
        '@graph': [entity]
      };
    }

    buildGraphDocument(entities) {
      return {
        '@context': {
          '@version': '1.1',
          '@vocab': VOCAB_IRI,
          'icore': VOCAB_IRI
        },
        '@graph': entities.map(e => e['@id'] ? e : this.toJSON_LD(e))
      };
    }

    // ── Stats ──────────────────────────────────────────────────────

    getStats() {
      return {
        loaded: this.loaded,
        classes: Object.keys(this.vocabulary.classes).length,
        properties: Object.keys(this.vocabulary.properties).length,
        dataProperties: Object.keys(this.vocabulary.dataProperties).length,
        registeredEntities: this.registry.size(),
        totalTerms: Object.keys(this.vocabulary.classes).length +
                    Object.keys(this.vocabulary.properties).length +
                    Object.keys(this.vocabulary.dataProperties).length
      };
    }

    // ── Internals ───────────────────────────────────────────────────

    _buildContextFromVocab() {
      const ctx = { '@version': '1.1', '@vocab': VOCAB_IRI, 'icore': VOCAB_IRI };

      for (const [name, def] of Object.entries(this.vocabulary.classes)) {
        ctx[name] = { '@id': def.id, '@subPropertyOf': 'icore:ConstitutionalEntity' };
      }
      for (const [name, def] of Object.entries(this.vocabulary.properties)) {
        ctx[name] = { '@id': def.id, '@type': def.type };
      }
      for (const [name, def] of Object.entries(this.vocabulary.dataProperties)) {
        ctx[name] = { '@id': def.id, '@type': def.type };
      }

      return { '@context': ctx };
    }

    _serializeProps(obj) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id' || key === '@id') continue;
        if (key === 'timestamp') {
          result['icore:timestamp'] = value;
          continue;
        }
        result['icore:' + key] = value;
      }
      return result;
    }

    _inferType(obj) {
      if (obj.agentId || obj.operation) return 'Agent';
      if (obj.messageType) return 'Event';
      if (obj.trustScore !== undefined) return 'Verification';
      if (obj.policyName || obj.rules) return 'Policy';
      if (obj.goalId) return 'Workflow';
      return 'ConstitutionalEntity';
    }

    _generateIRI(type) {
      const safeType = (type || 'entity').replace(/[^a-zA-Z0-9]/g, '');
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().split('-')[0]
        : Math.random().toString(36).substring(2, 10);
      return `${VOCAB_IRI}${safeType.toLowerCase()}/${id}`;
    }
  }

  return Object.freeze({
    ContextEngine,
    EntityRegistry,
    VOCAB_IRI,
    VOCABULARY
  });
})();
