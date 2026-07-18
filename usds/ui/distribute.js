// USDS — Distribute UI v0.1.0
window.USDS_DistributeUI = (() => {
  'use strict';

  let container;
  const channels = window.USDS_DistributionEngine.CHANNELS;

  function render(packages) {
    if (!container) container = document.getElementById('screen-distribute');
    const options = packages.map(p =>
      `<option value="${p.id}">${escHtml(p.name)} v${escHtml(p.version)}</option>`
    ).join('');
    const channelOpts = Object.values(channels).map(ch =>
      `<option value="${ch.id}">${ch.icon} ${ch.name}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-title">📤 Distribute Package</div>
      <div class="card">
        <h2>New Distribution</h2>
        <div class="input-group">
          <label>Select Package</label>
          <select id="distPackage">${options || '<option value="">No packages available</option>'}</select>
        </div>
        <div class="input-group">
          <label>Distribution Channel</label>
          <select id="distChannel">${channelOpts}</select>
        </div>
        <div class="input-group">
          <label>Recipient</label>
          <input type="text" id="distRecipient" placeholder="e.g. sovereign-council-01">
        </div>
        <div class="input-group">
          <label>Distributed By</label>
          <input type="text" id="distBy" placeholder="e.g. Sir Collins" value="Sir Collins">
        </div>
        <div class="flex-row">
          <button class="btn btn-primary" id="btnDistribute">Distribute</button>
        </div>
      </div>
      <div class="card mt-2" id="distResult" style="display:none"></div>
    `;

    document.getElementById('btnDistribute').onclick = async () => {
      const pkgId = document.getElementById('distPackage').value;
      const channel = document.getElementById('distChannel').value;
      const recipient = document.getElementById('distRecipient').value.trim();
      const distBy = document.getElementById('distBy').value.trim();
      if (!pkgId || !recipient) return alert('Select a package and recipient');
      const pkg = packages.find(p => p.id === pkgId);
      const record = await USDS_App.DistributionEngine.distribute({
        packageId: pkgId,
        packageName: pkg.name,
        packageVersion: pkg.version,
        channel, recipient,
        distributedBy: distBy
      });
      const resultDiv = document.getElementById('distResult');
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <h2>✅ Distribution Successful</h2>
        <div class="signature-block">
          <div class="sig-label">Distribution ID</div>
          <div class="sig-value">${record.id}</div>
        </div>
        <div class="signature-block">
          <div class="sig-label">Distribution Hash</div>
          <div class="sig-value sig-hash">${record.distributionHash}</div>
        </div>
        <div class="chain-entry">
          <div class="chain-action">📤 DISTRIBUTED</div>
          <div class="chain-detail">To: ${escHtml(recipient)} via ${channel}</div>
          <div class="chain-time">${new Date(record.distributedAt).toISOString()}</div>
        </div>
      `;
      USDS_App.EventBus.emit('usds:package-distributed', { packageId: pkgId, channel });
    };
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();