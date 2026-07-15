// ICore Studyo — History Screen

window.HistoryScreen = {
  async render() {
    let verifications = [];
    try {
      verifications = await DB.getAllVerifications();
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
            <p>No verifications yet.</p>
            <p class="text-secondary" style="font-size: 0.8rem; margin-top: var(--space-sm);">
              Go to the Verify tab to run your first trust verification.
            </p>
          </div>
        ` : `
          <div id="history-list">
            ${verifications.map(v => `
              <div class="history-item" onclick="HistoryScreen.showDetail('${v.id}')">
                <div class="history-claim">${this.escapeHtml(v.text)}</div>
                <div class="history-meta">
                  <span class="trust-level ${v.trustLevel}" style="font-size: 0.8rem; font-weight: 600;">
                    ${v.trustLabel} (${v.trustScore}%)
                  </span>
                  <span>${this.formatDate(v.timestamp)}</span>
                </div>
              </div>
            `).join('')}
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

  async showDetail(id) {
    const record = await DB.getVerification(id);
    if (!record) return;

    const detail = document.getElementById('history-detail');
    detail.innerHTML = `
      <div class="card animate-in" style="position: fixed; top: 60px; left: 0; right: 0; bottom: 70px; overflow-y: auto; z-index: 200; margin: 0; border-radius: 0; border: none; border-top: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <div class="card-title">Verification Detail</div>
          <button onclick="document.getElementById('history-detail').style.display='none'" 
                  style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; padding: 8px;">
            ✕
          </button>
        </div>

        <div class="input-label">Claim</div>
        <p style="margin-bottom: var(--space-md); font-size: 0.9rem;">${this.escapeHtml(record.text)}</p>

        <div class="input-label">Result</div>
        <div class="trust-level ${record.trustLevel}" style="font-size: 2rem;">
          ${record.trustScore}% — ${record.trustLabel}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); text-align: center; margin: var(--space-md) 0;">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">USCP</div>
            <div style="font-weight: 700;">${record.uscpScore}/6</div>
          </div>
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">USC</div>
            <div style="font-weight: 700;">${record.uscScore}/10</div>
          </div>
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">ICS</div>
            <div style="font-weight: 700;">${record.icsPassed}/${record.icsTotal}</div>
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

        <button class="btn btn-secondary" onclick="HistoryScreen.deleteRecord('${record.id}')">
          🗑️ Delete This Record
        </button>
      </div>
    `;
    detail.style.display = 'block';
  },

  async deleteRecord(id) {
    await DB.deleteVerification(id);
    document.getElementById('history-detail').style.display = 'none';
    App.navigate('history');
  },

  async clearAll() {
    if (!confirm('Clear all verification history? This cannot be undone.')) return;
    
    const verifications = await DB.getAllVerifications();
    for (const v of verifications) {
      await DB.deleteVerification(v.id);
    }
    App.navigate('history');
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
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
