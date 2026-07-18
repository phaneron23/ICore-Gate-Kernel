// USR/CoreFab — Constitutional Runtime (Composition)
// The unified USR interface — 6 engines, 1 runtime.

const RUNTIME_VERSION = '0.1.0';

class UsrRuntime {
  constructor() {
    this.identity = new IdentityEngine();
    this.execution = new ExecutionEngine();
    this.constraints = new ConstraintEngine();
    this.isolation = new IsolationEngine();
    this.attestation = new AttestationEngine();
    this.orchestration = new OrchestrationEngine();
    this._blueprintResults = [];
  }

  version() { return RUNTIME_VERSION; }
  capabilities() { return ['execution', 'constraint-enforcement', 'isolation', 'attestation', 'orchestration']; }

  validateBlueprint(blueprint) {
    const data = typeof blueprint === 'string' ? JSON.parse(blueprint) : blueprint;
    if (!data.name) throw new Error('BlueprintInvalid: Must have a name');
    if (!data.layer) throw new Error('BlueprintInvalid: Must have a layer');
    const layer = LAYER_MAP[data.layer.toLowerCase()];
    if (!layer) throw new Error(`BlueprintInvalid: Invalid layer: ${data.layer}`);
    return true;
  }

  async executeBlueprint(blueprint) {
    const data = typeof blueprint === 'string' ? JSON.parse(blueprint) : blueprint;
    this.validateBlueprint(data);

    const layer = LAYER_MAP[data.layer.toLowerCase()] || ConstitutionalLayer.Implementation;

    // 1. Register identity
    const component = await this.identity.declare(
      data.name, layer, data.version || '0.1.0',
      data.parents || [], data.question || `Constitutional component: ${data.name}`
    );
    await this.identity.register(component);

    // 2. Register orchestration
    this.orchestration.register(component.id);

    // 3. Grant capabilities
    await this.isolation.requestCapability(component.id, 'execution', ['execute', 'attest']);

    // 4. Initialize + Start
    this.orchestration.initialize(component.id);
    this.orchestration.start(component.id);

    // 5. Execute operation if specified
    if (data.operation) {
      const input = data.input || {};
      const execResult = await this.execution.execute(data.operation, input, component.id);

      // 6. Attest
      const attestation = await this.attestation.attest(
        component.id, data.operation,
        JSON.stringify(input), JSON.stringify(execResult.output),
        execResult.success ? 'success' : 'failure'
      );

      const result = {
        status: execResult.success ? 'completed' : 'failed',
        component: data.name, componentId: component.id,
        operation: data.operation, result: execResult.output,
        attestation: { signature: attestation.signature, timestamp: attestation.timestamp },
        timestamp: timestamp(),
      };

      this._blueprintResults.push(result);
      return result;
    }

    const result = {
      status: 'registered', component: data.name,
      componentId: component.id, timestamp: timestamp(),
    };
    this._blueprintResults.push(result);
    return result;
  }

  async verify() {
    await this.identity.verifyAll();
    await this.isolation.verifyAll();
    await this.attestation.verifyChain();
    await this.orchestration.verifyAll();
    return true;
  }

  getStatus() {
    return {
      version: this.version(),
      capabilities: this.capabilities(),
      components: this.identity.list().length,
      attestations: this.attestation.fullChain().length,
      messages: this.orchestration.messages.length,
      blueprints: this._blueprintResults.length,
    };
  }
}

window.UsrRuntime = UsrRuntime;
window.RUNTIME_VERSION = RUNTIME_VERSION;
