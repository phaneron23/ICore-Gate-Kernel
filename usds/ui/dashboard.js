// USDS — Dashboard UI v0.1.0
window.USDS_DashboardUI = (() => {
  'use strict';

  let container;

  function render(stats, distStats) {
    if (!container) container = document.getElementById('screen-dashboard');
    const totalPkgs = stats.total || 0;
    const signedPkgs = stats.signed || 0;
    const distEvents = distStats ? distStats.total : 0;
    const activeDist = distStats ? distStats.active : 0;
    const revoked = distStats ? distStats.revoked : 0;
    const unsignedPkgs = stats.unsigned || 0;

    container.innerHTML = `
      <div class="section-title">📊 Dashboard</div>
      <div class="grid-3col mb-2">
        <div class="stat-card">
          <div class="stat-value">${totalPkgs}</div>
          <div class="stat-label">Total Packages</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-success">${signedPkgs}</div>
          <div class="stat-label">Signed Packages</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-warning">${unsignedPkgs}</div>
          <div class="stat-label">Unsigned Packages</div>
        </div>
      </div>
      <div class="grid-3col mb-2">
        <div class="stat-card">
          <div class="stat-value">${distEvents}</div>
          <div class="stat-label">Distribution Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-success">${activeDist}</div>
          <div class="stat-label">Active Distributions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-danger">${revoked}</div>
          <div class="stat-label">Revoked Distributions</div>
        </div>
      </div>
      <div class="grid-2col">
        <div class="card">
          <h2>🔐 Verification Status</h2>
          <div class="flex-row mb-1">
            <span class="badge ${signedPkgs > 0 ? 'badge-green' : 'badge-yellow'}">
              ${signedPkgs > 0 ? 'SIGNED' : 'NONE SIGNED'}
            </span>
            <span style="font-size:0.82em;color:var(--text-secondary)">
              ${signedPkgs}/${totalPkgs} packages signed
            </span>
          </div>
          <div style="height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${totalPkgs ? (signedPkgs/totalPkgs*100) : 0}%;background:var(--accent);border-radius:3px"></div>
          </div>
        </div>
        <div class="card">
          <h2>📦 Distribution Health</h2>
          <div class="flex-row mb-1">
            <span class="badge badge-green">${activeDist} Active</span>
            <span class="badge badge-red">${revoked} Revoked</span>
          </div>
          <div style="font-size:0.82em;color:var(--text-secondary);margin-top:8px">
            ${totalPkgs === 0
              ? 'No packages yet. Create a constitutional package to begin.'
              : `${stats.totalEvents || 0} total chain events across all packages.`}
          </div>
        </div>
      </div>
      <div class="card mt-2">
        <h2>🚀 Quick Actions</h2>
        <div class="flex-row" style="flex-wrap:wrap;gap:8px">
          <button class="btn btn-primary" onclick="USDS_App.navigate('packages')">Create Package</button>
          <button class="btn" onclick="USDS_App.navigate('distribute')">Distribute</button>
          <button class="btn" onclick="USDS_App.navigate('verify')">Verify</button>
          <button class="btn" onclick="USDS_App.navigate('history')">View History</button>
        </div>
      </div>
    `;
  }

  return { render };
})();