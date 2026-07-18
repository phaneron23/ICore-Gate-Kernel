// UAS — Agents List UI v1.0.0
window.UASAgents = (() => {
  'use strict';

  function render(container, ctx) {
    const { registry, trustEngine } = ctx;
    const agents = registry.getAll();
    const stats = registry.getStats();

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Agents (${agents.length})</h2>
        <button class="btn btn-primary" onclick="window.UASUtils.navigate('builder')">
          + New Agent
        </button>
      </div>

      ${agents.length === 0
        ? `<div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">🤖</div>
              <div class="empty-state-text">No agents registered yet.</div>
              <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.UASUtils.navigate('builder')">Create First Agent</button>
            </div>
          </div>`
        : agents.map(agent => renderAgentCard(agent, trustEngine, ctx)).join('')
      }
    `;
  }

  function renderAgentCard(agent, trustEngine, ctx) {
    const identityHash = agent.identity?.id
      ? agent.identity.id.substring(0, 24) + '...'
      : agent.id.substring(0, 24) + '...';

    const stateClass = agent.state === 'Active' ? 'green'
      : agent.state === 'Suspended' ? 'yellow'
      : agent.state === 'Terminated' ? 'red' : '';

    const trustColor = agent.trustScore >= 70 ? 'var(--green)'
      : agent.trustScore >= 40 ? 'var(--yellow)'
      : 'var(--red)';

    const achievedGoals = agent.goals.filter(g => g.status === 'achieved').length;

    // Get trust report if available
    const trustReport = trustEngine ? trustEngine.produceReport(agent.id) : null;

    return `
      <div class="agent-card" data-agent-id="${agent.id}">
        <div class="agent-card-header">
          <span class="agent-card-name">${escapeHtml(agent.name)}</span>
          <span class="badge badge-${stateClass}">${agent.state}</span>
        </div>

        <div class="agent-card-meta">
          ID: ${agent.id}<br>
          Identity: ${identityHash}
        </div>

        ${agent.description ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0;">${escapeHtml(agent.description)}</div>` : ''}

        <div class="agent-card-stats">
          <span>Trust: <strong style="color: ${trustColor};">${agent.trustScore}</strong></span>
          <span>Goals: ${achievedGoals}/${agent.goals.length}</span>
          <span>Perceptions: ${agent.perceptionLog.length}</span>
          <span>Actions: ${agent.actionLog.length}</span>
        </div>

        <div class="trust-bar">
          <div class="trust-bar-fill" style="width: ${agent.trustScore}%; background: ${trustColor};"></div>
        </div>

        ${agent.constraints.length > 0 ? `
          <div style="margin-top: 0.5rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Constraints</div>
            <div class="chip-list">
              ${agent.constraints.map(c => `<span class="chip">${escapeHtml(c.name || c.type)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${agent.goals.length > 0 ? `
          <div style="margin-top: 0.5rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Goals</div>
            ${agent.goals.map(g => `
              <div class="goal-card">
                <span class="goal-text">${escapeHtml(g.title)}</span>
                <span class="badge ${g.status === 'achieved' ? 'badge-green' : 'badge-yellow'}">${g.status}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${trustReport ? `
          <div style="margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-muted);">
            Trust Factors — Conformance: ${trustReport.factors.conformance} ·
            Attestation: ${trustReport.factors.attestation} ·
            Communication: ${trustReport.factors.communication} ·
            Goal Completion: ${trustReport.factors.goalCompletion}
          </div>
        ` : ''}

        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${agent.state === 'Registered' ? `
            <button class="btn btn-sm btn-primary" onclick="agentAction('${agent.id}', 'activate', this)">Activate</button>
          ` : ''}
          ${agent.state === 'Active' ? `
            <button class="btn btn-sm" onclick="agentAction('${agent.id}', 'suspend', this)">Suspend</button>
            <button class="btn btn-sm" onclick="agentAction('${agent.id}', 'addGoal', this)">+ Goal</button>
          ` : ''}
          ${agent.state === 'Suspended' ? `
            <button class="btn btn-sm btn-primary" onclick="agentAction('${agent.id}', 'activate', this)">Resume</button>
          ` : ''}
          ${agent.state !== 'Terminated' ? `
            <button class="btn btn-sm btn-danger" onclick="agentAction('${agent.id}', 'terminate', this)">Terminate</button>
          ` : ''}
        </div>

        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">
          Created: ${formatTime(agent.createdAt)} · Updated: ${formatTime(agent.updatedAt)}
        </div>
      </div>
    `;
  }

  // Global action handler
  window.agentAction = async function(agentId, action, btn) {
    const registry = window.UASApp.getRegistry();
    const agent = registry.get(agentId);
    if (!agent) return;

    try {
      switch (action) {
        case 'activate':
          await agent.activate();
          window.UASUtils.showToast(`Agent '${agent.name}' activated`, 'success');
          break;
        case 'suspend':
          await agent.suspend('User action');
          window.UASUtils.showToast(`Agent '${agent.name}' suspended`, 'info');
          break;
        case 'terminate':
          if (confirm(`Terminate agent '${agent.name}'? This cannot be undone.`)) {
            await agent.terminate('User action');
            window.UASUtils.showToast(`Agent '${agent.name}' terminated`, 'error');
          }
          break;
        case 'addGoal': {
          const title = prompt('Enter goal title:');
          if (title) {
            await agent.addGoal({ title, description: `Goal: ${title}` });
            window.UASUtils.showToast(`Goal added to '${agent.name}'`, 'success');
          }
          break;
        }
      }
      // Save to DB and refresh
      await window.UASUtils.dbPut('agents', agent.toJSON());
      await window.UASUtils.addLog('agent', `Agent '${agent.name}' ${action}`, { agentId });
      // Re-render the agents screen
      window.UASUtils.navigate('agents');
    } catch (err) {
      window.UASUtils.showToast(`Error: ${err.message}`, 'error');
    }
  };

  function formatTime(isoString) {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  return Object.freeze({ render });
})();
