// UAS — Dashboard UI v1.0.0
window.UASDashboard = (() => {
  'use strict';

  function render(container, ctx) {
    const { registry, trustEngine, orchestrator } = ctx;
    const stats = registry.getStats();
    const sessionStats = orchestrator.getStats();
    const allAgents = registry.getAll();

    // Calculate system health
    const healthScore = calculateHealth(stats, sessionStats);
    const healthLevel = healthScore >= 80 ? 'Healthy' : healthScore >= 50 ? 'Degraded' : 'Critical';
    const healthClass = healthScore >= 80 ? 'green' : healthScore >= 50 ? 'yellow' : 'red';

    // Get recent operations
    const recentAgents = allAgents
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Dashboard</h2>
        <span class="badge badge-accent">UAS v1.0.0</span>
      </div>

      <!-- Stats Grid -->
      <div class="grid-3col" style="margin-bottom: 1rem;">
        <div class="stat-card">
          <div class="stat-card-value">${stats.total}</div>
          <div class="stat-card-label">Total Agents</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="color: var(--green);">${stats.active}</div>
          <div class="stat-card-label">Active Agents</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="color: var(--yellow);">${stats.avgTrust.toFixed(1)}</div>
          <div class="stat-card-label">Avg Trust Score</div>
        </div>
      </div>

      <!-- Second row -->
      <div class="grid-3col" style="margin-bottom: 1rem;">
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem;">${stats.totalGoals}</div>
          <div class="stat-card-label">Total Goals</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem; color: var(--green);">${stats.achievedGoals}</div>
          <div class="stat-card-label">Goals Achieved</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem;">${sessionStats.total}</div>
          <div class="stat-card-label">Sessions</div>
        </div>
      </div>

      <!-- System Health -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">System Health</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
              Score: ${healthScore}/100
            </div>
          </div>
          <span class="badge badge-${healthClass}">${healthLevel}</span>
        </div>
        <div class="trust-bar" style="margin-top: 0.5rem;">
          <div class="trust-bar-fill" style="width: ${healthScore}%; background: var(--${healthClass === 'green' ? 'green' : healthClass === 'yellow' ? 'yellow' : 'red'});"></div>
        </div>
      </div>

      <!-- Agent Breakdown -->
      <div class="card">
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;">Agent Breakdown</div>
        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
          <span>Registered: <strong style="color: var(--text-primary);">${stats.registered}</strong></span>
          <span>Active: <strong style="color: var(--green);">${stats.active}</strong></span>
          <span>Suspended: <strong style="color: var(--yellow);">${stats.suspended}</strong></span>
          <span>Terminated: <strong style="color: var(--red);">${stats.terminated}</strong></span>
        </div>
      </div>

      <!-- Session Summary -->
      <div class="card">
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;">Session Summary</div>
        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
          <span>Completed: <strong style="color: var(--green);">${sessionStats.completed}</strong></span>
          <span>Running: <strong style="color: var(--yellow);">${sessionStats.running}</strong></span>
          <span>Failed: <strong style="color: var(--red);">${sessionStats.failed}</strong></span>
        </div>
      </div>

      <!-- Recent Operations -->
      <div class="card">
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;">Recent Activity</div>
        ${recentAgents.length === 0
          ? '<div class="empty-state"><div class="empty-state-text">No agents yet. Create one in the Builder.</div></div>'
          : recentAgents.map(agent => `
            <div class="log-entry log-info">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${escapeHtml(agent.name)}</strong>
                  <span class="badge badge-${agent.state === 'Active' ? 'green' : agent.state === 'Suspended' ? 'yellow' : agent.state === 'Terminated' ? 'red' : ''}" style="margin-left: 0.5rem;">${agent.state}</span>
                </div>
                <span class="log-entry-time">${formatTime(agent.updatedAt)}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                Trust: ${agent.trustScore} · Goals: ${agent.goals.length}
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  }

  function calculateHealth(stats, sessionStats) {
    let score = 100;

    // No agents = neutral
    if (stats.total === 0) return 75;

    // Penalize for terminated agents
    if (stats.terminated > 0) score -= Math.min(20, stats.terminated * 5);

    // Penalize for suspended agents
    if (stats.suspended > 0) score -= Math.min(15, stats.suspended * 5);

    // Bonus for good trust
    score += (stats.avgTrust - 50) * 0.3;

    // Penalize for failed sessions
    if (sessionStats.failed > 0) score -= sessionStats.failed * 10;

    // Bonus for active agents
    if (stats.active > 0) score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  function formatTime(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return Object.freeze({ render });
})();
