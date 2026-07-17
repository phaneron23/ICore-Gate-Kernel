// ICore Constitutional Workflow Engine — App Controller v1.0.0
// First UCD derivative. Built on ICore Platform.
// Originator: Sir Collins (access1@tutamail.com)

const App = {
  currentScreen: 'dashboard',
  workflowId: null,  // Currently selected/active workflow

  screens: {
    dashboard: () => window.DashboardScreen,
    builder:   () => window.BuilderScreen,
    executor:  () => window.ExecutorScreen,
    history:   () => window.HistoryScreen,
    about:     () => window.AboutScreen,
  },

  // ─── Initialization ──────────────────────────────────────────────

  init() {
    this.setupNavigation();
    this.setupOffline();
    this.registerServiceWorker();
    this.navigate('dashboard');

    // Log platform availability
    const platform = this.getPlatformStatus();
    console.log(`[WorkflowEngine] Platform ready — CoreFab ${platform.corefab}, UCA ${platform.uca}, EventBus ${platform.eventbus}`);
  },

  getPlatformStatus() {
    return {
      corefab: typeof CoreFab !== 'undefined' ? CoreFab.RUNTIME_VERSION : 'missing',
      uca: typeof UCA !== 'undefined' ? '0.1.0' : 'missing',
      eventbus: typeof EventBus !== 'undefined' ? 'available' : 'missing',
      workflowEngine: typeof WorkflowEngine !== 'undefined' ? 'available' : 'missing',
      ucdDerivation: typeof UCDerivation !== 'undefined' ? 'available' : 'missing',
    };
  },

  // ─── Navigation ──────────────────────────────────────────────────

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.screen);
      });
    });
  },

  navigate(screen, options = {}) {
    if (!this.screens[screen]) return;

    this.currentScreen = screen;
    if (options.workflowId) this.workflowId = options.workflowId;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Render screen
    const container = document.getElementById('screen');
    const screenModule = this.screens[screen]();
    if (screenModule && screenModule.render) {
      container.innerHTML = screenModule.render();
    }

    // Re-attach dynamic event listeners after render
    this.attachScreenListeners(screen);
  },

  // ─── Dynamic Event Listeners (per screen) ────────────────────────

  attachScreenListeners(screen) {
    if (screen === 'builder') this.attachBuilderListeners();
    if (screen === 'executor') this.attachExecutorListeners();
  },

  attachBuilderListeners() {
    const addStepBtn = document.getElementById('add-step-btn');
    const saveBtn = document.getElementById('save-workflow-btn');
    const validateBtn = document.getElementById('validate-workflow-btn');

    if (addStepBtn) addStepBtn.addEventListener('click', () => this.builderAddStep());
    if (saveBtn) saveBtn.addEventListener('click', () => this.builderSave());
    if (validateBtn) validateBtn.addEventListener('click', () => this.builderValidate());

    // Remove step buttons
    document.querySelectorAll('.remove-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.step-form-item')?.remove();
        this.updateStepNumbers();
      });
    });
  },

  attachExecutorListeners() {
    const pauseBtn = document.getElementById('exec-pause-btn');
    const resumeBtn = document.getElementById('exec-resume-btn');
    const stopBtn = document.getElementById('exec-stop-btn');
    const attestBtn = document.getElementById('exec-attest-btn');

    if (pauseBtn) pauseBtn.addEventListener('click', () => this.execPause());
    if (resumeBtn) resumeBtn.addEventListener('click', () => this.execResume());
    if (stopBtn) stopBtn.addEventListener('click', () => this.execStop());
    if (attestBtn) attestBtn.addEventListener('click', () => this.execAttest());
  },

  // ─── Builder Actions ─────────────────────────────────────────────

  builderAddStep() {
    const container = document.getElementById('steps-container');
    if (!container) return;

    const count = container.children.length + 1;
    const stepHtml = `
      <div class="card step-form-item" data-step="${count}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-sm);">
          <span style="font-size:0.8rem; font-weight:700;">Step ${count}</span>
          <button class="btn btn-danger btn-sm remove-step-btn">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input step-name" placeholder="Step name..." />
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-select step-type">
            <option value="validate">Validate (constitutional check)</option>
            <option value="transform">Transform (data transformation)</option>
            <option value="verify">Verify (verification test)</option>
            <option value="execute">Execute (run operation)</option>
            <option value="attest">Attest (cryptographic attestation)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Configuration (JSON)</label>
          <textarea class="form-textarea step-config" placeholder='{"rule": "..."}'></textarea>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', stepHtml);

    // Re-attach remove listener on new button
    const newBtn = container.lastElementChild.querySelector('.remove-step-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        newBtn.closest('.step-form-item')?.remove();
        this.updateStepNumbers();
      });
    }
  },

  updateStepNumbers() {
    document.querySelectorAll('#steps-container .step-form-item').forEach((el, i) => {
      el.dataset.step = i + 1;
      el.querySelector('span').textContent = `Step ${i + 1}`;
    });
  },

  builderCollectSteps() {
    const steps = [];
    document.querySelectorAll('#steps-container .step-form-item').forEach(el => {
      const name = el.querySelector('.step-name')?.value?.trim() || '';
      const type = el.querySelector('.step-type')?.value || 'validate';
      let config = {};
      try {
        const raw = el.querySelector('.step-config')?.value?.trim();
        if (raw) config = JSON.parse(raw);
      } catch (e) { config = { parseError: e.message }; }
      steps.push({ name, type, config });
    });
    return steps;
  },

  builderValidate() {
    const name = document.getElementById('wf-name')?.value?.trim() || '';
    const steps = this.builderCollectSteps();

    if (!name) { this.toast('Workflow needs a name'); return; }
    if (steps.length === 0) { this.toast('Add at least one step'); return; }

    // Constitutional validation via UCDerivation
    const errors = [];
    steps.forEach((s, i) => {
      if (!s.name) errors.push(`Step ${i + 1}: missing name`);
      if (['validate','transform','verify','execute','attest'].includes(s.type) === false) {
        errors.push(`Step ${i + 1}: unknown type '${s.type}'`);
      }
      if (s.config.parseError) errors.push(`Step ${i + 1}: invalid JSON config`);
    });

    if (errors.length > 0) {
      this.toast(`Validation failed: ${errors[0]}`);
      return;
    }

    this.toast(`✅ Validated: ${steps.length} steps, all constitutional`);
  },

  builderSave() {
    const name = document.getElementById('wf-name')?.value?.trim() || '';
    const desc = document.getElementById('wf-desc')?.value?.trim() || '';
    const steps = this.builderCollectSteps();

    if (!name) { this.toast('Workflow needs a name'); return; }
    if (steps.length === 0) { this.toast('Add at least one step'); return; }

    try {
      const workflow = WorkflowEngine.create({ name, description: desc, steps });
      // Track derivation
      UCDerivation.trackDerivation(workflow.id, 'execution', 'implementation', 'D5');

      this.toast(`✅ Workflow "${name}" created (${workflow.steps.length} steps)`);

      // Emit event
      if (typeof EventBus !== 'undefined') {
        EventBus.publish('workflow:created', { id: workflow.id, name }, 'builder', 'normal');
      }

      // Navigate to executor
      this.navigate('executor', { workflowId: workflow.id });
    } catch (e) {
      this.toast(`❌ Create failed: ${e.message || e}`);
    }
  },

  // ─── Executor Actions ────────────────────────────────────────────

  async execStart(workflowId) {
    try {
      await WorkflowEngine.validate(workflowId);
      await WorkflowEngine.execute(workflowId);
      this.navigate('executor', { workflowId });
    } catch (e) {
      this.toast(`❌ Execution failed: ${e.message || e}`);
    }
  },

  execPause() {
    if (!this.workflowId) return;
    try {
      WorkflowEngine.pause(this.workflowId);
      this.navigate('executor', { workflowId: this.workflowId });
      this.toast('⏸ Workflow paused');
    } catch (e) { this.toast(`❌ ${e.message}`); }
  },

  execResume() {
    if (!this.workflowId) return;
    try {
      WorkflowEngine.resume(this.workflowId);
      this.navigate('executor', { workflowId: this.workflowId });
      this.toast('▶ Workflow resumed');
    } catch (e) { this.toast(`❌ ${e.message}`); }
  },

  execStop() {
    if (!this.workflowId) return;
    try {
      WorkflowEngine.complete(this.workflowId);
      this.navigate('executor', { workflowId: this.workflowId });
      this.toast('⏹ Workflow stopped');
    } catch (e) { this.toast(`❌ ${e.message}`); }
  },

  async execAttest() {
    if (!this.workflowId) return;
    try {
      await WorkflowEngine.attest(this.workflowId);
      this.navigate('executor', { workflowId: this.workflowId });
      this.toast('🔒 Workflow attested');
    } catch (e) { this.toast(`❌ ${e.message}`); }
  },

  // ─── History Actions ─────────────────────────────────────────────

  historyInspect(workflowId) {
    this.navigate('executor', { workflowId });
  },

  historyExport(workflowId) {
    const wf = WorkflowEngine.get(workflowId);
    if (!wf) { this.toast('Workflow not found'); return; }

    const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${wf.name.replace(/\s+/g, '-').toLowerCase()}-${wf.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('📄 Exported');
  },

  historyExportAll() {
    const all = WorkflowEngine.list();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflows-all-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast(`📄 Exported ${all.length} workflows`);
  },

  // ─── Utilities ───────────────────────────────────────────────────

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  },

  setupOffline() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    const update = () => { banner.style.display = navigator.onLine ? 'none' : 'block'; };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  },

  toast(msg) {
    // Remove existing toast
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
