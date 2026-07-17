window.DashboardScreen = {
  render() {
    const workflows = typeof WorkflowEngine !== 'undefined' ? WorkflowEngine.list() : [];
    const status = typeof App !== 'undefined' ? App.getPlatformStatus() : {};
    const recent = workflows.slice(-5).reverse();

    const statusList = [
      { name: 'CoreFab',  ok: status.corefab !== 'missing', ver: status.corefab },
      { name: 'UCA',      ok: status.uca !== 'missing', ver: status.uca },
      { name: 'EventBus', ok: status.eventbus !== 'missing', ver: status.eventbus },
      { name: 'Workflow', ok: status.workflowEngine !== 'missing', ver: status.workflowEngine },
      { name: 'UCD',      ok: status.ucdDerivation !== 'missing', ver: status.ucdDerivation },
    ];

    const counts = { draft: 0, validated: 0, executing: 0, completed: 0, attested: 0, failed: 0 };
    workflows.forEach(wf => { if (counts[wf.status] !== undefined) counts[wf.status]++; });

    return `
      <div class="animate-in">
        <div class="text-center mb-lg">
          <div style="font-size:3rem; margin-bottom:var(--space-sm);">⚙️</div>
          <h1 style="font-size:1.3rem; font-weight:800;">Constitutional Workflow Engine</h1>
          <p class="text-secondary" style="font-size:0.8rem;">First UCD Derivative · ICore Platform Module</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid mb-lg">
          <div class="stat-box">
            <div class="stat-label">Total</div>
            <div class="stat-value">${workflows.length}</div>
            <div class="stat-detail">workflows</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Attested</div>
            <div class="stat-value" style="color:var(--accent);">${counts.attested}</div>
            <div class="stat-detail">verified</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Running</div>
            <div class="stat-value" style="color:var(--warning);">${counts.executing}</div>
            <div class="stat-detail">active</div>
          </div>
        </div>

        <!-- Platform Status -->
        <div class="card">
          <div class="card-header mb-sm">
            <span style="font-size:1.2rem;">🔷</span>
            <div class="card-title">Platform Status</div>
          </div>
          ${statusList.map(s => `
            <div style="display:flex; align-items:center; gap:var(--space-sm); padding:4px 0;">
              <span style="font-size:0.8rem;">${s.ok ? '✅' : '❌'}</span>
              <span style="font-size:0.8rem; flex:1;">${s.name}</span>
              <span class="text-muted" style="font-size:0.7rem;">${s.ver}</span>
            </div>
          `).join('')}
        </div>

        <!-- Quick Actions -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); margin-bottom:var(--space-md);">
          <button class="btn btn-primary" onclick="App.navigate('builder')">🔧 New Workflow</button>
          <button class="btn btn-secondary" onclick="App.navigate('history')">📋 View All</button>
        </div>

        <!-- Recent Workflows -->
        <div class="card">
          <div class="card-header mb-sm">
            <span style="font-size:1.2rem;">📋</span>
            <div class="card-title">Recent Workflows</div>
          </div>
          ${recent.length === 0 ? '<p class="text-muted" style="font-size:0.8rem;">No workflows yet. Build one!</p>' :
            recent.map(wf => `
              <div style="display:flex; align-items:center; gap:var(--space-sm); padding:var(--space-xs) 0; border-top:1px solid var(--border); cursor:pointer;"
                   onclick="App.navigate('executor', {workflowId:'${wf.id}'})">
                <span class="status-badge status-${wf.status}">${wf.status}</span>
                <span style="font-size:0.8rem; flex:1;">${wf.name}</span>
                <span class="text-muted" style="font-size:0.65rem;">${wf.steps.length} steps</span>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  }
};
