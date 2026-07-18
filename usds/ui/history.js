// USDS — History UI v0.1.0
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

    const timelineHtml = allEvents.map(ev => {
      const isCreated = ev.action === 'CREATED';
      const isRevoked = ev.action === 'REVOKED';
      const iconMap = {
        'CREATED': '🆕', 'SIGNED': '🔐', 'DISTRIBUTED': '📤',
        'REVOKED': '🚫', 'ATTESTED': '✍️'
      };
      const icon = iconMap[ev.action] || '📌';
      const timeStr = new Date(ev.timestamp).toISOString();
      return `
        <div class="chain-entry ${isRevoked ? 'revoked' : ''}">
          <div class="chain-action">${icon} ${escHtml(ev.action)}</div>
          <div class="chain-detail">
            <strong>${escHtml(ev.packageName)}</strong> — ${escHtml(ev.detail)}
            <span style="color:var(--text-muted)"> by ${escHtml(ev.actor)}</span>
          </div>
          <div class="chain-time">${timeStr}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-title">⛓️ Chain of Custody</div>
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Constitutional Timeline</h2>
          <span class="badge">${allEvents.length} event(s)</span>
        </div>
        <div style="font-size:0.82em;color:var(--text-secondary);margin-bottom:16px">
          All package lifecycle and distribution events in chronological order.
        </div>
        ${allEvents.length === 0
          ? '<div class="empty-state"><div class="empty-icon">⛓️</div>No events yet.<br>Create and distribute packages to build the chain.</div>'
          : timelineHtml
        }
      </div>
    `;
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();