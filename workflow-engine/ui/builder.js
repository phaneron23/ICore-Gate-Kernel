window.BuilderScreen = {
  render() {
    return `
      <div class="animate-in">
        <div class="text-center mb-lg">
          <h1 style="font-size:1.3rem; font-weight:800;">🔧 Build Workflow</h1>
          <p class="text-secondary" style="font-size:0.8rem;">Create a constitutional workflow</p>
        </div>

        <div class="card">
          <div class="form-group">
            <label class="form-label">Workflow Name</label>
            <input id="wf-name" class="form-input" placeholder="e.g. Data Validation Pipeline" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="wf-desc" class="form-textarea" placeholder="What does this workflow do?"></textarea>
          </div>
        </div>

        <!-- Steps -->
        <div class="card">
          <div class="card-header mb-sm">
            <span style="font-size:1.2rem;">📝</span>
            <div class="card-title">Steps</div>
          </div>
          <div id="steps-container"></div>
          <button id="add-step-btn" class="btn btn-secondary" style="margin-top:var(--space-sm);">+ Add Step</button>
        </div>

        <!-- Actions -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); margin-top:var(--space-md);">
          <button id="validate-workflow-btn" class="btn btn-secondary">✅ Validate</button>
          <button id="save-workflow-btn" class="btn btn-primary">💾 Save & Run</button>
        </div>

        <div class="card" style="margin-top:var(--space-md); border-color:var(--accent);">
          <p class="text-muted" style="font-size:0.75rem; font-style:italic;">
            Each workflow is a constitutional derivative. Steps are validated against the 6 USCP primitives.
            Execution produces attestation chains. Nothing leaves your device.
          </p>
        </div>
      </div>
    `;
  }
};
