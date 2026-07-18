// UAS — Orchestrator UI v1.0.0
window.UASOrchestratorUI = (() => {
  'use strict';

  const PATTERNS = [
    { id: 'sequential', name: 'Sequential', desc: 'One after another' },
    { id: 'parallel', name: 'Parallel', desc: 'All at once' },
    { id: 'consensus', name: 'Consensus', desc: 'Vote to agree' },
    { id: 'pipeline', name: 'Pipeline', desc: 'Output → Input' }
  ];

  let selectedPattern = 'sequential';
  let selectedAgents = [];

  function render(container, ctx) {
    const { registry, orchestrator } = ctx;
    const activeAgents = registry.getAll().filter(a => a.state === 'Active' || a.state === 'Registered');
    const sessions = orchestrator.getAllSessions();
    const stats = orchestrator.getStats();

    selectedAgents = [];

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Orchestrator</h2>
        <span class="badge badge-accent">Multi-Agent</span>
      </div>

      <!-- Stats -->
      <div class="grid-3col" style="margin-bottom: 1rem;">
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem;">${stats.total}</div>
          <div class="stat-card-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem; color: var(--green);">${stats.completed}</div>
          <div class="stat-card-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="font-size: 1.3rem; color: var(--red);">${stats.failed}</div>
          <div class="stat-card-label">Failed</div>
        </div>
      </div>

      <!-- New Session -->
      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9rem;">Create Session</div>

        <div class="input-group">
          <label>Session Name</label>
          <input type="text" id="sessionName" placeholder="e.g. Research Collaboration">
        </div>

        <div class="input-group">
          <label>Shared Goal</label>
          <input type="text" id="sessionGoal" placeholder="e.g. Analyze and summarize findings">
        </div>

        <!-- Agent Selection -->
        <div style="margin-bottom: 0.75rem;">
          <label style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">
            Select Agents (${activeAgents.length} available)
          </label>
          ${activeAgents.length === 0
            ? '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem;">No active agents. Create agents first.</div>'
            : `<div id="agentSelector" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${activeAgents.map(agent => `
                  <label style="display: flex; align-items: center; gap: 0.3rem; padding: 0.4rem 0.75rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.82rem; transition: all 0.2s;"
                         class="agent-select-item" data-agent-id="${agent.id}">
                    <input type="checkbox" value="${agent.id}" onchange="toggleAgentSelection('${agent.id}')">
                    <span>${escapeHtml(agent.name)}</span>
                    <span class="badge ${agent.state === 'Active' ? 'badge-green' : ''}" style="font-size: 0.6rem;">${agent.trustScore}</span>
                  </label>
                `).join('')}
              </div>`
          }
        </div>

        <!-- Pattern Selection -->
        <div style="margin-bottom: 0.75rem;">
          <label style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">
            Orchestration Pattern
          </label>
          <div class="pattern-selector">
            ${PATTERNS.map(p => `
              <div class="pattern-option ${p.id === selectedPattern ? 'selected' : ''}"
                   onclick="selectPattern('${p.id}')" data-pattern="${p.id}">
                <div class="pattern-option-name">${p.name}</div>
                <div class="pattern-option-desc">${p.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary" id="executeSessionBtn" style="width: 100%;" onclick="executeSession()">
          Execute Session
        </button>
      </div>

      <!-- Session History -->
      <div style="margin-top: 1rem;">
        <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Session History</div>
        ${sessions.length === 0
          ? '<div class="empty-state"><div class="empty-state-text">No sessions yet.</div></div>'
          : sessions.slice().reverse().map(session => renderSessionCard(session)).join('')
        }
      </div>
    `;
  }

  function renderSessionCard(session) {
    const stateClass = session.state === 'Completed' ? 'green'
      : session.state === 'Running' ? 'yellow'
      : session.state === 'Failed' ? 'red' : '';

    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.9rem;">${escapeHtml(session.name || 'Unnamed')}</strong>
            <span class="badge badge-${stateClass}" style="margin-left: 0.5rem;">${session.state}</span>
          </div>
          <span style="font-size: 0.7rem; color: var(--text-muted);">${formatTime(session.createdAt)}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.3rem;">
          Pattern: ${session.pattern} · Agents: ${session.agentIds?.length || 0}
          ${session.minTrust !== undefined && session.minTrust < 100 ? ` · Min Trust: ${session.minTrust}` : ''}
        </div>
        ${session.goal ? `
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem;">
            Goal: ${escapeHtml(typeof session.goal === 'object' ? session.goal.title : session.goal)}
          </div>
        ` : ''}
        ${session.log && session.log.length > 0 ? `
          <div style="margin-top: 0.5rem; max-height: 120px; overflow-y: auto;">
            ${session.log.slice(-5).map(entry => `
              <div class="log-entry log-${entry.type === 'failed' ? 'error' : entry.type === 'completed' ? 'success' : 'info'}" style="padding: 0.25rem 0.5rem;">
                <span style="font-size: 0.72rem;">${escapeHtml(entry.message)}</span>
                <span class="log-entry-time" style="margin-left: 0.5rem;">${formatTime(entry.timestamp)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${session.results && Object.keys(session.results).length > 0 ? `
          <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
            Results: ${Object.keys(session.results).length} agent(s) reported
          </div>
        ` : ''}
      </div>
    `;
  }

  // Global handlers
  window.toggleAgentSelection = function(agentId) {
    const idx = selectedAgents.indexOf(agentId);
    if (idx >= 0) {
      selectedAgents.splice(idx, 1);
    } else {
      selectedAgents.push(agentId);
    }
    // Update visual
    const items = document.querySelectorAll('.agent-select-item');
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (item.dataset.agentId === agentId) {
        item.style.borderColor = checkbox.checked ? 'var(--accent)' : 'var(--border)';
        item.style.background = checkbox.checked ? 'var(--accent-dim)' : 'var(--bg-input)';
      }
    });
  };

  window.selectPattern = function(patternId) {
    selectedPattern = patternId;
    document.querySelectorAll('.pattern-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.pattern === patternId);
    });
  };

  window.executeSession = async function() {
    const { registry, orchestrator } = {
      registry: window.UASApp.getRegistry(),
      orchestrator: window.UASApp.getOrchestrator()
    };

    const name = document.getElementById('sessionName').value.trim() || 'Untitled Session';
    const goalText = document.getElementById('sessionGoal').value.trim();

    if (selectedAgents.length < 1) {
      window.UASUtils.showToast('Select at least one agent', 'error');
      return;
    }

    try {
      // Create session
      const session = orchestrator.createSession(
        name,
        selectedAgents,
        selectedPattern,
        goalText ? { title: goalText, description: goalText } : null
      );

      // Execute
      await orchestrator.executeSession(session.id, registry);

      // Save all updated agents
      for (const agentId of selectedAgents) {
        const agent = registry.get(agentId);
        if (agent) {
          await window.UASUtils.dbPut('agents', agent.toJSON());
        }
      }

      // Save session
      await window.UASUtils.dbPut('sessions', session);

      const result = session.state === 'Completed' ? 'success' : 'error';
      window.UASUtils.showToast(`Session '${name}' ${session.state.toLowerCase()}`, result);

      // Re-render
      window.UASUtils.navigate('orchestrator');

    } catch (err) {
      window.UASUtils.showToast(`Error: ${err.message}`, 'error');
    }
  };

  function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return d.toLocaleString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  return Object.freeze({ render });
})();
