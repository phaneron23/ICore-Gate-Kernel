window.HistoryScreen = {
  render() {
    const workflows = typeof WorkflowEngine !== 'undefined' ? WorkflowEngine.list() : [];

    return `
      <div class="animate-in">
        <div class="text-center mb-lg">
          <h1 style="font-size:1.3rem; font-weight:800;">📋 Workflow History</h1>
          <p class="text-secondary" style="font-size:0.8rem;">${workflows.length} workflows total</p>
        </div>

        <!-- Export All -->
        ${workflows.length > 0 ? `
          <button class="btn btn-secondary mb-md" onclick="App.historyExportAll()">
            📄 Export All (${workflows.length})
          </button>
        ` : ''}

        <!-- Filter -->
        <div class="card mb-md">
          <div style="display:flex; gap:var(--space-xs); flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary filter-btn active-filter" data-filter="all">All</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="draft">Draft</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="completed">Completed</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="attested">Attested</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="failed">Failed</button>
          </div>
        </div>

        <!-- Workflow List -->
        <div id="history-list">
          ${workflows.length === 0 ? `
            <div class="card text-center">
              <div style="font-size:2rem; margin-bottom:var(--space-sm);">📭</div>
              <p class="text-secondary">No workflows yet.</p>
              <button class="btn btn-primary mt-md" onclick="App.navigate('builder')">🔧 Build One</button>
            </div>
          ` :
            workflows.slice().reverse().map(wf => `
              <div class="card workflow-card" data-status="${wf.status}" style="cursor:pointer;">
                <div style="display:flex; align-items:center; gap:var(--space-sm); margin-bottom:var(--space-xs);">
                  <span class="status-badge status-${wf.status}">${wf.status}</span>
                  <span style="font-size:0.9rem; font-weight:700; flex:1;">${wf.name}</span>
                </div>
                ${wf.description ? `<p class="text-secondary" style="font-size:0.75rem; margin-bottom:var(--space-xs);">${wf.description}</p>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="text-muted" style="font-size:0.7rem;">${wf.steps.length} steps · ${new Date(wf.metadata.created).toLocaleDateString()}</span>
                  <div style="display:flex; gap:var(--space-xs);">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); App.historyInspect('${wf.id}')">👁 Inspect</button>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); App.historyExport('${wf.id}')">📄</button>
                  </div>
                </div>
                ${wf.attestation ? `<div style="margin-top:var(--space-xs); font-family:var(--font-mono); font-size:0.6rem; color:var(--accent);">🔒 ${wf.attestation.hash.slice(0, 24)}…</div>` : ''}
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  }
};
