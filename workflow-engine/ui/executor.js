window.ExecutorScreen = {
  render() {
    const wfId = typeof App !== 'undefined' ? App.workflowId : null;
    const wf = wfId && typeof WorkflowEngine !== 'undefined' ? WorkflowEngine.get(wfId) : null;

    if (!wf) {
      return `
        <div class="animate-in text-center" style="margin-top:var(--space-xl);">
          <div style="font-size:3rem; margin-bottom:var(--space-md);">⚡</div>
          <h2 style="font-size:1.1rem; font-weight:700;">No Workflow Selected</h2>
          <p class="text-secondary" style="font-size:0.85rem; margin:var(--space-sm) 0;">
            Create or select a workflow to execute.
          </p>
          <button class="btn btn-primary" style="max-width:300px; margin:var(--space-md) auto;"
                  onclick="App.navigate('builder')">🔧 Build a Workflow</button>
          <button class="btn btn-secondary" style="max-width:300px; margin:var(--space-sm) auto;"
                  onclick="App.navigate('history')">📋 View History</button>
        </div>
      `;
    }

    const canPause = wf.status === 'executing';
    const canResume = wf.status === 'paused';
    const canStop = ['executing', 'paused'].includes(wf.status);
    const canAttest = wf.status === 'completed';
    const canStart = ['validated', 'ready', 'draft'].includes(wf.status);

    const events = (wf.events || []).slice(-10).reverse();

    return `
      <div class="animate-in">
        <div class="text-center mb-md">
          <h1 style="font-size:1.2rem; font-weight:800;">⚡ ${wf.name}</h1>
          <span class="status-badge status-${wf.status}" style="margin-top:var(--space-xs);">${wf.status.toUpperCase()}</span>
        </div>

        ${wf.description ? `<p class="text-secondary text-center mb-md" style="font-size:0.8rem;">${wf.description}</p>` : ''}

        <!-- Steps -->
        <div class="card">
          <div class="card-header mb-sm">
            <span style="font-size:1.2rem;">📋</span>
            <div class="card-title">Steps (${wf.steps.length})</div>
          </div>
          ${wf.steps.map((step, i) => {
            const icon = step.status === 'done' ? '✅' : step.status === 'running' ? '⚡' :
                         step.status === 'failed' ? '❌' : step.status === 'attested' ? '🔒' : '⏳';
            const cls = step.status === 'done' ? 'done' : step.status === 'failed' ? 'error' :
                        step.status === 'running' ? 'active' : '';
            return `
              <div class="step-item ${cls}">
                <span class="step-icon">${icon}</span>
                <div class="step-info">
                  <div class="step-name">${step.name}</div>
                  <div class="step-detail">${step.type} · ${step.status}</div>
                  ${step.result?.outputHash ? `<div class="step-detail" style="font-family:var(--font-mono);">hash: ${step.result.outputHash.slice(0,16)}…</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Controls -->
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:var(--space-sm); margin-bottom:var(--space-md);">
          ${canStart ? `<button class="btn btn-primary" onclick="App.execStart('${wf.id}')">▶ Start</button>` : ''}
          ${canPause ? `<button id="exec-pause-btn" class="btn btn-secondary">⏸ Pause</button>` : ''}
          ${canResume ? `<button id="exec-resume-btn" class="btn btn-primary">▶ Resume</button>` : ''}
          ${canStop ? `<button id="exec-stop-btn" class="btn btn-danger">⏹ Stop</button>` : ''}
          ${canAttest ? `<button id="exec-attest-btn" class="btn btn-primary" style="grid-column:span 2;">🔒 Attest Workflow</button>` : ''}
        </div>

        <!-- Attestation -->
        ${wf.attestation ? `
          <div class="card" style="border-color:var(--accent);">
            <div class="card-header mb-sm">
              <span style="font-size:1.2rem;">🔒</span>
              <div class="card-title">Attestation</div>
            </div>
            <div style="font-family:var(--font-mono); font-size:0.7rem; word-break:break-all;">
              <div class="mb-sm"><strong>Hash:</strong> ${wf.attestation.hash}</div>
              <div class="mb-sm"><strong>Sig:</strong> ${wf.attestation.signature}</div>
              <div class="text-muted">${wf.attestation.timestamp}</div>
            </div>
          </div>
        ` : ''}

        <!-- Event Log -->
        <div class="card">
          <div class="card-header mb-sm">
            <span style="font-size:1.2rem;">📜</span>
            <div class="card-title">Event Log</div>
          </div>
          <div class="event-log">
            ${events.length === 0 ? '<div class="event-entry text-muted">No events yet</div>' :
              events.map(e => `
                <div class="event-entry ${e.type === 'transition' ? 'high' : ''}">
                  <span class="ts">${e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}</span>
                  ${e.type}${e.from ? `: ${e.from} → ${e.to}` : ''}${e.result ? `: ${e.result}` : ''}
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }
};
