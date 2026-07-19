// USDS — Distribute UI v0.2.0
window.USDS_DistributeUI = (() => {
  'use strict';

  let container;
  const channels = window.USDS_DistributionEngine.CHANNELS;

  async function render(packages) {
    if (!container) container = document.getElementById('screen-distribute');

    // Get existing distribution records
    let distRecords = [];
    try {
      distRecords = await USDS_App.DistributionEngine.getAllRecords();
    } catch (e) { /* ignore */ }

    const options = packages.map(p =>
      `<option value="${p.id}">${escHtml(p.name)} v${escHtml(p.version)}${p.signature ? ' 🔐' : ''}</option>`
    ).join('');

    const channelOpts = Object.values(channels).map(ch =>
      `<option value="${ch.id}">${ch.icon} ${ch.name}</option>`
    ).join('');

    // Channel stats
    const stats = await USDS_App.DistributionEngine.getStats();

    // Channel cards
    const channelCards = Object.values(channels).map(ch => `
      <div class="channel-card">
        <div class="ch-icon">${ch.icon}</div>
        <div class="ch-name">${escHtml(ch.name)}</div>
        <div class="ch-count">${stats.channels[ch.id] || 0}</div>
      </div>
    `).join('');

    // Recent transfers
    const recentTransfers = distRecords
      .sort((a, b) => b.distributedAt - a.distributedAt)
      .slice(0, 10);

    const transferRows = recentTransfers.map(rec => {
      const statusBadge = rec.status === 'revoked'
        ? '<span class="badge badge-red">REVOKED</span>'
        : '<span class="badge badge-green">ACTIVE</span>';
      const ch = channels[rec.channel.toUpperCase()] || channels.SOVEREIGN;
      return `
        <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:0.85em;font-weight:500">
              ${ch.icon} ${escHtml(rec.packageName)}
            </div>
            <div style="font-size:0.75em;color:var(--text-secondary)">
              → ${escHtml(rec.recipient)} · by ${escHtml(rec.distributedBy)}
            </div>
          </div>
          <div class="flex-row">
            ${statusBadge}
            <div class="mono" style="font-size:0.7em;color:var(--text-muted)">
              ${new Date(rec.distributedAt).toLocaleDateString()}
            </div>
            ${rec.status !== 'revoked'
              ? `<button class="btn btn-sm btn-danger" data-action="revoke" data-id="${rec.id}">Revoke</button>`
              : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-title">📤 Distribution Center</div>

      <!-- Channel Overview -->
      <div class="section-title" style="font-size:0.95em">📡 Distribution Channels</div>
      <div class="grid-4col mb-2">
        ${channelCards}
      </div>

      <!-- New Distribution Form -->
      <div class="card">
        <h2>📤 New Distribution</h2>
        <div class="grid-2col">
          <div class="input-group">
            <label>Select Package</label>
            <select id="distPackage">${options || '<option value="">No packages available</option>'}</select>
          </div>
          <div class="input-group">
            <label>Distribution Channel</label>
            <select id="distChannel">${channelOpts}</select>
          </div>
        </div>
        <div class="grid-2col">
          <div class="input-group">
            <label>Recipient</label>
            <input type="text" id="distRecipient" placeholder="e.g. sovereign-council-01">
          </div>
          <div class="input-group">
            <label>Distributed By</label>
            <input type="text" id="distBy" placeholder="e.g. Sir Collins" value="Sir Collins">
          </div>
        </div>
        <div class="flex-row">
          <button class="btn btn-primary" id="btnDistribute">📤 Distribute</button>
        </div>
      </div>

      <!-- Distribution Result -->
      <div class="card mt-2" id="distResult" style="display:none"></div>

      <!-- Transfer History -->
      <div class="card mt-2">
        <div class="flex-between mb-1">
          <h2>📋 Transfer History</h2>
          <span class="badge">${distRecords.length} total</span>
        </div>
        <div style="font-size:0.82em;color:var(--text-secondary);margin-bottom:12px">
          Recent distribution events across all channels.
        </div>
        ${transferRows || '<div class="empty-state" style="padding:20px"><div class="empty-icon">📤</div>No distributions yet.</div>'}
      </div>
    `;

    // Bind distribute button
    document.getElementById('btnDistribute').onclick = async () => {
      const pkgId = document.getElementById('distPackage').value;
      const channel = document.getElementById('distChannel').value;
      const recipient = document.getElementById('distRecipient').value.trim();
      const distBy = document.getElementById('distBy').value.trim();
      if (!pkgId) { showToast('⚠️ Select a package'); return; }
      if (!recipient) { showToast('⚠️ Enter a recipient'); return; }

      const btn = document.getElementById('btnDistribute');
      btn.disabled = true;
      btn.textContent = 'Distributing…';

      try {
        const pkg = packages.find(p => p.id === pkgId);
        const record = await USDS_App.DistributionEngine.distribute({
          packageId: pkgId,
          packageName: pkg ? pkg.name : 'Unknown',
          packageVersion: pkg ? pkg.version : '',
          channel, recipient,
          distributedBy: distBy || 'system'
        });

        const ch = channels[record.channel.toUpperCase()] || channels.SOVEREIGN;
        const resultDiv = document.getElementById('distResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <h2>✅ Distribution Successful</h2>
          <div class="signature-block">
            <div class="sig-label">Distribution ID</div>
            <div class="sig-value">${escHtml(record.id)}</div>
          </div>
          <div class="signature-block">
            <div class="sig-label">Distribution Hash</div>
            <div class="sig-value sig-hash">${escHtml(record.distributionHash)}</div>
          </div>
          <div class="chain-entry">
            <div class="chain-action">📤 DISTRIBUTED</div>
            <div class="chain-detail">To: <strong>${escHtml(recipient)}</strong> via ${ch.icon} ${escHtml(ch.name)}</div>
            <div class="chain-time">${new Date(record.distributedAt).toISOString()}</div>
          </div>
        `;

        USDS_App.EventBus.emit('usds:package-distributed', { packageId: pkgId, channel });
        showToast('✅ Package distributed via ' + ch.name);

        // Refresh to show in transfer history
        setTimeout(() => USDS_App.navigate('distribute'), 500);
      } catch (err) {
        console.error('[USDS] Distribution error:', err);
        showToast('❌ Distribution failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '📤 Distribute';
      }
    };

    // Bind revoke buttons
    container.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action="revoke"]');
      if (!btn) return;
      const recordId = btn.dataset.id;
      const reason = prompt('Enter revoke reason (optional):');
      if (reason === null) return;
      try {
        await USDS_App.DistributionEngine.revokePackage(recordId, 'Sir Collins', reason || 'Revoked by authority');
        showToast('🚫 Distribution revoked');
        USDS_App.navigate('distribute');
      } catch (err) {
        showToast('❌ Revoke failed: ' + err.message);
      }
    });
  }

  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
  }

  return { render };
})();
