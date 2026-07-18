// UAS — History UI v1.0.0
window.UASHistory = (() => {
  'use strict';

  let filterType = '';
  let filterAgent = '';
  let filterDate = '';

  async function render(container, ctx) {
    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Operation History</h2>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom: 1rem;">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Filters</div>
        <div class="grid-3col">
          <div class="input-group">
            <label>Type</label>
            <select id="filterType" onchange="filterHistory()">
              <option value="">All Types</option>
              <option value="agent">Agent</option>
              <option value="session">Session</option>
              <option value="attestation">Attestation</option>
            </select>
          </div>
          <div class="input-group">
            <label>Agent</label>
            <select id="filterAgent" onchange="filterHistory()">
              <option value="">All Agents</option>
            </select>
          </div>
          <div class="input-group">
            <label>Date</label>
            <input type="date" id="filterDate" onchange="filterHistory()">
          </div>
        </div>
      </div>

      <!-- Log entries -->
      <div id="historyEntries">
        <div class="empty-state">
          <div class="empty-state-text">Loading history...</div>
        </div>
      </div>
    `;

    // Populate agent filter
    await populateAgentFilter(ctx.registry);

    // Load and render entries
    await loadEntries();
  }

  async function populateAgentFilter(registry) {
    const select = document.getElementById('filterAgent');
    if (!select) return;

    const agents = registry.getAll();
    for (const agent of agents) {
      const option = document.createElement('option');
      option.value = agent.id;
      option.textContent = agent.name;
      select.appendChild(option);
    }
  }

  window.filterHistory = async function() {
    filterType = document.getElementById('filterType')?.value || '';
    filterAgent = document.getElementById('filterAgent')?.value || '';
    filterDate = document.getElementById('filterDate')?.value || '';
    await loadEntries();
  };

  async function loadEntries() {
    const entriesDiv = document.getElementById('historyEntries');
    if (!entriesDiv) return;

    let allEntries = [];
    try {
      allEntries = await window.UASUtils.dbGetAll('logs');
    } catch (err) {
      entriesDiv.innerHTML = '<div class="empty-state"><div class="empty-state-text">Failed to load history.</div></div>';
      return;
    }

    // Apply filters
    let filtered = allEntries;

    if (filterType) {
      filtered = filtered.filter(e => e.type === filterType);
    }

    if (filterAgent) {
      filtered = filtered.filter(e => e.agentId === filterAgent);
    }

    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      const nextDay = new Date(filterDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.timestamp);
        return entryDate >= filterDateObj && entryDate < nextDay;
      });
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit display
    const display = filtered.slice(0, 100);

    if (display.length === 0) {
      entriesDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <div class="empty-state-text">No entries match your filters.</div>
        </div>
      `;
      return;
    }

    entriesDiv.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
        Showing ${display.length} of ${filtered.length} entries
      </div>
      ${display.map(entry => renderLogEntry(entry)).join('')}
    `;
  }

  function renderLogEntry(entry) {
    const typeClass = entry.type === 'agent' ? 'info'
      : entry.type === 'attestation' ? 'success'
      : entry.type === 'session' ? 'info'
      : 'info';

    const typeIcon = entry.type === 'agent' ? '🤖'
      : entry.type === 'attestation' ? '✓'
      : entry.type === 'session' ? '📋'
      : '📝';

    const time = new Date(entry.timestamp).toLocaleString();

    return `
      <div class="log-entry log-${typeClass}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="log-entry-type">${typeIcon} ${escapeHtml(entry.type)}</span>
            <div style="margin-top: 0.2rem; font-size: 0.82rem;">${escapeHtml(entry.message)}</div>
            ${entry.agentId ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">Agent: ${entry.agentId.substring(0, 16)}...</div>` : ''}
          </div>
          <span class="log-entry-time" style="white-space: nowrap; margin-left: 1rem;">${time}</span>
        </div>
        ${entry.data ? `
          <details style="margin-top: 0.3rem;">
            <summary style="font-size: 0.7rem; color: var(--text-muted); cursor: pointer;">Details</summary>
            <pre style="font-size: 0.7rem; color: var(--text-muted); background: var(--bg-secondary); padding: 0.5rem; border-radius: var(--radius-sm); margin-top: 0.3rem; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(JSON.stringify(entry.data, null, 2))}</pre>
          </details>
        ` : ''}
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  return Object.freeze({ render });
})();
