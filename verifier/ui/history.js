// ICore Verifier — History Screen v1.0.0
// List of past verifications from IndexedDB. Each entry shows claim preview,
// result badge, timestamp. Click to re-view results.

window.HistoryScreen = {
  async render() {
    let verifications = [];
    try {
      verifications = await App.db.getAll();
    } catch (e) {
      console.warn('Could not load history:', e);
    }

    const count = verifications.length;

    return `
      <div class="animate-in">
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.5rem;">📋</span>
            <div class="card-title">Verification History</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">${count} records</span>
          </div>
          <p class="card-description">
            All verification records are stored locally on your device.
            No data is sent to any server.
          </p>
        </div>

        ${count === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p class="empty-state-text">No verifications yet.</p>
            <p class="text-secondary mt-sm" style="font-size: 0.8rem;">
              Go to the Verify tab to run your first trust verification.
            </p>
          </div>
        ` : `
          <div id="history-list">
            ${verifications.map(v => {
              const badgeClass = v.trustLevel === 'verified' ? 'badge-pass' :
                                 v.trustLevel === 'partial' ? 'badge-partial' : 'badge-fail';
              return `
                <div class="history-item" data-id="${v.id}">
                  <div class="history-claim">${this.escapeHtml(v.text)}</div>
                  <div class="history-meta">
                    <span class="badge ${badgeClass}" style="font-size: 0.7rem;">
                      ${v.trustLabel} (${v.trustScore}%)
                    </span>
                    <span>${this.formatDate(v.timestamp)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <button class="btn btn-secondary mt-md" onclick="HistoryScreen.clearAll()">
            🗑️ Clear History
          </button>
        `}

        <!-- Detail Modal -->
        <div id="history-detail" style="display:none;"></div>
      </div>
    `;
  },

  bind() {
    // Attach click handlers to history items
    document.querySelectorAll('.history-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        this.showDetail(item.dataset.id);
      });
    });
  },

  async showDetail(id) {
    const record = await App.db.get(id);
    if (!record) return;

    const badgeClass = record.trustLevel === 'verified' ? 'badge-pass' :
                       record.trustLevel === 'partial' ? 'badge-partial' : 'badge-fail';

    const detail = document.getElementById('history-detail');
    detail.innerHTML = `
      <div class="card animate-in" style="
        position: fixed; top: 60px; left: 0; right: 0; bottom: 70px;
        overflow-y: auto; z-index: 200; margin: 0; border-radius: 0;
        border: none; border-top: 1px solid var(--border);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <div class="card-title">Verification Detail</div>
          <button id="history-detail-close" style="
            background: none; border: none; color: var(--text-secondary);
            font-size: 1.2rem; cursor: pointer; padding: 8px;
          ">✕</button>
        </div>

        <div class="input-label">Claim</div>
        <p style="margin-bottom: var(--space-md); font-size: 0.9rem;">${this.escapeHtml(record.text)}</p>

        <div class="input-label">Result</div>
        <div class="text-center" style="margin: var(--space-md) 0;">
          <span class="badge ${badgeClass}" style="font-size: 0.85rem; padding: 6px 16px; margin-bottom: var(--space-sm); display: inline-flex;">
            ${record.trustLabel}
          </span>
          <div class="trust-level ${record.trustLevel}" style="font-size: 2.5rem;">
            ${record.trustScore}%
          </div>
        </div>

        <div class="stats-grid" style="margin: var(--space-md) 0;">
          <div class="stats-grid-item">
            <div class="stats-grid-label">USCP</div>
            <div class="stats-grid-value">${record.uscpScore}/6</div>
          </div>
          <div class="stats-grid-item">
            <div class="stats-grid-label">USC</div>
            <div class="stats-grid-value">${record.uscScore}/10</div>
          </div>
          <div class="stats-grid-item">
            <div class="stats-grid-label">ICS</div>
            <div class="stats-grid-value">${record.icsPassed}/${record.icsTotal}</div>
          </div>
        </div>

        <div class="input-label">Timestamp</div>
        <p style="margin-bottom: var(--space-md); font-size: 0.85rem; color: var(--text-secondary);">
          ${new Date(record.timestamp).toLocaleString()}
        </p>

        <div class="input-label">Record ID</div>
        <p style="margin-bottom: var(--space-md); font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
          ${record.id}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-top: var(--space-md);">
          <button class="btn btn-primary btn-sm" onclick="HistoryScreen.reVerify('${record.id}')">
            🔄 Re-View Results
          </button>
          <button class="btn btn-secondary btn-sm" onclick="HistoryScreen.deleteRecord('${record.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
    detail.style.display = 'block';

    // Close button
    document.getElementById('history-detail-close').addEventListener('click', () => {
      detail.style.display = 'none';
    });
  },

  async reVerify(id) {
    const record = await App.db.get(id);
    if (!record || !record.fullResult) return;

    // Restore the full result and navigate to results
    App.lastVerifyResult = record.fullResult;
    document.getElementById('history-detail').style.display = 'none';
    App.navigate('results');
  },

  async deleteRecord(id) {
    await App.db.remove(id);
    document.getElementById('history-detail').style.display = 'none';
    App.navigate('history');
  },

  async clearAll() {
    if (!confirm('Clear all verification history? This cannot be undone.')) return;
    await App.db.clear();
    App.navigate('history');
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    return date.toLocaleDateString();
  }
};
