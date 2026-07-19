// USDS — Dashboard UI v0.2.0
window.USDS_DashboardUI = (() => {
  'use strict';

  let container;

  function render(stats, distStats, allPackages) {
    if (!container) container = document.getElementById('screen-dashboard');
    const totalPkgs = stats.total || 0;
    const signedPkgs = stats.signed || 0;
    const unsignedPkgs = stats.unsigned || 0;
    const distEvents = distStats ? distStats.total : 0;
    const activeDist = distStats ? distStats.active : 0;
    const revoked = distStats ? distStats.revoked : 0;
    const totalAttestations = stats.totalAttestations || 0;
    const totalChainEvents = stats.totalEvents || 0;

    // Build recent activity from all packages
    const recentEvents = [];
    if (allPackages) {
      for (const pkg of allPackages) {
        for (const entry of (pkg.chainOfCustody || [])) {
          recentEvents.push({
            action: entry.action,
            actor: entry.actor,
            detail: entry.detail,
            timestamp: entry.timestamp,
            packageName: pkg.name
          });
        }
      }
    }
    recentEvents.sort((a, b) => b.timestamp - a.timestamp);
    const lastFive = recentEvents.slice(0, 5);

    const iconMap = {
      'CREATED': '🆕', 'SIGNED': '🔐', 'DISTRIBUTED': '📤',
      'REVOKED': '🚫', 'ATTESTED': '✍️'
    };

    const activityHtml = lastFive.length > 0
      ? lastFive.map(ev => `
          <div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <div class="flex-row">
              <span>${iconMap[ev.action] || '📌'}</span>
              <div>
                <div style="font-size:0.85em;font-weight:500">${escHtml(ev.action)} <span class="text-accent">${escHtml(ev.packageName)}</span></div>
                <div style="font-size:0.75em;color:var(--text-secondary)">${escHtml(ev.detail)}</div>
              </div>
            </div>
            <div class="mono" style="font-size:0.7em;color:var(--text-muted);white-space:nowrap;margin-left:12px">${formatTime(ev.timestamp)}</div>
          </div>
        `).join('')
      : '<div class="empty-state" style="padding:20px"><div class="empty-icon">📊</div>No activity yet. Create a package to begin.</div>';

    const signRate = totalPkgs > 0 ? Math.round(signedPkgs / totalPkgs * 100) : 0;
    const distRate = distEvents > 0 ? Math.round(activeDist / distEvents * 100) : 0;

    container.innerHTML = `
      <div class="section-title">📊 Dashboard</div>

      <!-- Stats Row 1 -->
      <div class="grid-4col mb-2">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${totalPkgs}</div>
          <div class="stat-label">Packages Created</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔐</div>
          <div class="stat-value text-success">${signedPkgs}</div>
          <div class="stat-label">Signed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📤</div>
          <div class="stat-value">${distEvents}</div>
          <div class="stat-label">Distributions</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⛓️</div>
          <div class="stat-value">${totalChainEvents}</div>
          <div class="stat-label">Chain Events</div>
        </div>
      </div>

      <!-- Health Bars + Quick Actions -->
      <div class="grid-2col mb-2">
        <div class="card">
          <h2>🔐 Signing Coverage</h2>
          <div class="flex-between mb-1">
            <span class="badge ${signedPkgs > 0 ? 'badge-green' : 'badge-yellow'}">
              ${signRate}% Signed
            </span>
            <span style="font-size:0.82em;color:var(--text-secondary)">
              ${signedPkgs}/${totalPkgs}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${signRate >= 100 ? 'success' : 'accent'}" style="width:${signRate}%"></div>
          </div>
        </div>
        <div class="card">
          <h2>📤 Distribution Health</h2>
          <div class="flex-row mb-1">
            <span class="badge badge-green">${activeDist} Active</span>
            <span class="badge badge-red">${revoked} Revoked</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill success" style="width:${distRate}%"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Recent Activity -->
      <div class="grid-2col">
        <div class="card">
          <h2>🚀 Quick Actions</h2>
          <div class="flex-row flex-wrap" style="gap:8px">
            <button class="btn btn-primary" onclick="USDS_App.navigate('packages')">📦 Create Package</button>
            <button class="btn" onclick="USDS_App.navigate('distribute')">📤 Distribute</button>
            <button class="btn" onclick="USDS_App.navigate('verify')">🔍 Verify</button>
            <button class="btn" onclick="USDS_App.navigate('history')">⛓️ Chain History</button>
          </div>
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
            <div class="flex-row" style="gap:12px;font-size:0.78em;color:var(--text-secondary)">
              <span>📝 ${stats.totalAttestations || 0} attestations</span>
              <span>·</span>
              <span>🏢 ${distStats ? (distStats.channels || {}).sovereign || 0 : 0} sovereign dists</span>
            </div>
          </div>
        </div>
        <div class="card">
          <h2>📋 Recent Activity</h2>
          ${activityHtml}
        </div>
      </div>
    `;
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
  }

  return { render };
})();
