// USDS — History UI v0.2.0
window.USDS_HistoryUI = (() => {
  'use strict';

  let container;

  function render(packages, distRecords) {
    if (!container) container = document.getElementById('screen-history');

    // Merge all events into a timeline
    const allEvents = [];

    for (const pkg of packages) {
      for (const entry of (pkg.chainOfCustody || [])) {
        allEvents.push({
          type: 'chain',
          action: entry.action,
          actor: entry.actor,
          detail: entry.detail,
          timestamp: entry.timestamp,
          packageName: pkg.name
        });
      }
    }

    for (const rec of (distRecords || [])) {
      const action = rec.status === 'revoked' ? 'REVOKED' : 'DISTRIBUTED';
      allEvents.push({
        type: 'distribution',
        action: action,
        actor: rec.status === 'revoked' ? (rec.revokedBy || 'system') : rec.distributedBy,
        detail: rec.status === 'revoked'
          ? `Revoked: ${rec.revokeReason || 'N/A'}`
          : `Distributed to ${rec.recipient} via ${rec.channel}`,
        timestamp: rec.status === 'revoked' ? rec.revokedAt : rec.distributedAt,
        packageName: rec.packageName
      });
    }

    allEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Filter buttons
    const filters = ['ALL', 'CREATED', 'SIGNED', 'DISTRIBUTED', 'REVOKED'];
    const filterBtns = filters.map(f => {
      const count = f === 'ALL' ? allEvents.length : allEvents.filter(e => e.action === f).length;
      return `<button class="btn btn-sm history-filter" data-filter="${f}">${f} (${count})</button>`;
    }).join('');

    const timelineHtml = allEvents.map(ev => {
      const isCreated = ev.action === 'CREATED';
      const isRevoked = ev.action === 'REVOKED';
      const iconMap = {
        'CREATED': '🆕', 'SIGNED': '🔐', 'DISTRIBUTED': '📤',
        'REVOKED': '🚫', 'ATTESTED': '✍️'
      };
      const icon = iconMap[ev.action] || '📌';
      const timeStr = new Date(ev.timestamp).toISOString();
      const timeAgo = formatTimeAgo(ev.timestamp);
      return `
        <div class="chain-entry ${isRevoked ? 'revoked' : ''}" data-action="${ev.action}">
          <div class="chain-action">${icon} ${escHtml(ev.action)}</div>
          <div class="chain-detail">
            <strong>${escHtml(ev.packageName)}</strong> — ${escHtml(ev.detail)}
            <span style="color:var(--text-muted)"> by ${escHtml(ev.actor)}</span>
          </div>
          <div class="chain-time">${timeStr} (${timeAgo})</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-title">⛓️ Chain of Custody</div>

      <!-- Filter Bar -->
      <div class="flex-row flex-wrap mb-2" style="gap:6px">
        ${filterBtns}
      </div>

      <!-- Timeline -->
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Constitutional Timeline</h2>
          <span class="badge badge-accent">${allEvents.length} event(s)</span>
        </div>
        <div style="font-size:0.82em;color:var(--text-secondary);margin-bottom:16px">
          All package lifecycle and distribution events in chronological order.
        </div>
        <div id="timelineContainer">
          ${allEvents.length === 0
            ? '<div class="empty-state"><div class="empty-icon">⛓️</div>No events yet.<br>Create and distribute packages to build the chain.</div>'
            : timelineHtml
          }
        </div>
      </div>
    `;

    // Bind filter buttons
    container.querySelectorAll('.history-filter').forEach(btn => {
      btn.onclick = () => {
        const filter = btn.dataset.filter;
        container.querySelectorAll('.history-filter').forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
        container.querySelectorAll('.chain-entry').forEach(entry => {
          if (filter === 'ALL' || entry.dataset.action === filter) {
            entry.style.display = '';
          } else {
            entry.style.display = 'none';
          }
        });
      };
    });

    // Set "ALL" as active
    const allBtn = container.querySelector('.history-filter[data-filter="ALL"]');
    if (allBtn) allBtn.classList.add('btn-primary');
  }

  function formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return new Date(ts).toLocaleDateString();
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();
