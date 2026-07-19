// USDS — Verify UI v0.2.0
window.USDS_VerifyUI = (() => {
  'use strict';

  let container;

  function render(packages) {
    if (!container) container = document.getElementById('screen-verify');
    const options = packages.map(p =>
      `<option value="${p.id}">${escHtml(p.name)} v${escHtml(p.version)}${p.signature ? ' 🔐' : ''}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-title">🔍 Verify Package</div>
      <div class="card">
        <h2>Verification Runner</h2>
        <div class="input-group">
          <label>Select Package</label>
          <select id="verifyPackage">
            ${options || '<option value="">No packages available</option>'}
          </select>
        </div>
        <div class="input-group">
          <label>Or paste Content Hash</label>
          <div class="flex-row">
            <input type="text" id="verifyHash" placeholder="Paste SHA-256 hash to look up…" style="flex:1">
            <button class="btn" id="btnHashLookup">Lookup</button>
          </div>
        </div>
        <div class="flex-row mt-1">
          <button class="btn btn-primary" id="btnFullVerify">🔍 Full Verify</button>
          <button class="btn" id="btnQuickVerify">⚡ Quick Verify</button>
          <button class="btn btn-success" id="btnProduceReport">📄 Generate Report</button>
        </div>
      </div>
      <div id="verifyResult" class="mt-2"></div>
    `;

    // Hash lookup: find package by content hash
    document.getElementById('btnHashLookup').onclick = async () => {
      const hash = document.getElementById('verifyHash').value.trim().toLowerCase();
      if (!hash) { showToast('⚠️ Enter a hash to look up'); return; }
      const match = packages.find(p => p.contentHash && p.contentHash.toLowerCase() === hash);
      if (match) {
        document.getElementById('verifyPackage').value = match.id;
        showToast('✅ Found package: ' + match.name);
      } else {
        showToast('❌ No package found with that hash');
      }
    };

    document.getElementById('btnFullVerify').onclick = async () => {
      const pkgId = document.getElementById('verifyPackage').value;
      if (!pkgId) { showToast('⚠️ Select a package'); return; }
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) { showToast('❌ Package not found'); return; }
      try {
        const { result, report } = await USDS_App.VerificationEngine.produceVerificationReport(pkg);
        renderFullReport(report, pkg);
        USDS_App.EventBus.emit('usds:package-verified', { id: pkgId, valid: report.overallStatus === 'PASS' });
      } catch (err) {
        showToast('❌ Verification error: ' + err.message);
      }
    };

    document.getElementById('btnQuickVerify').onclick = async () => {
      const pkgId = document.getElementById('verifyPackage').value;
      if (!pkgId) { showToast('⚠️ Select a package'); return; }
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) { showToast('❌ Package not found'); return; }
      try {
        const qr = await USDS_App.VerificationEngine.quickVerify(pkg);
        renderQuickResult(qr);
        USDS_App.EventBus.emit('usds:package-verified', { id: pkgId, valid: qr.valid });
      } catch (err) {
        showToast('❌ Verification error: ' + err.message);
      }
    };

    document.getElementById('btnProduceReport').onclick = async () => {
      const pkgId = document.getElementById('verifyPackage').value;
      if (!pkgId) { showToast('⚠️ Select a package'); return; }
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) { showToast('❌ Package not found'); return; }
      try {
        const { result, report } = await USDS_App.VerificationEngine.produceVerificationReport(pkg);
        renderFullReport(report, pkg);
        // Also render the chain of custody if available
        renderChainOfCustody(pkg);
      } catch (err) {
        showToast('❌ Report error: ' + err.message);
      }
    };
  }

  function renderFullReport(report, pkg) {
    const resultDiv = document.getElementById('verifyResult');
    const statusBadge = report.overallStatus === 'PASS'
      ? '<span class="badge badge-green">✅ PASS</span>'
      : '<span class="badge badge-red">❌ FAIL</span>';

    const sectionHtml = report.sections.map(s => {
      const sb = s.status === 'PASS'
        ? '<span class="badge badge-green">PASS</span>'
        : s.status === 'N/A'
        ? '<span class="badge badge-yellow">N/A</span>'
        : '<span class="badge badge-red">FAIL</span>';
      return `
        <div class="verify-section">
          <div class="vs-info">
            <div class="vs-name">${escHtml(s.name)}</div>
            <div class="vs-detail">${escHtml(s.details)}</div>
          </div>
          ${sb}
        </div>`;
    }).join('');

    // Signature details
    let sigDetails = '';
    if (pkg && pkg.signature) {
      sigDetails = `
        <div class="signature-block">
          <div class="sig-label">Algorithm</div>
          <div class="sig-value">${escHtml(pkg.signature.algorithm || 'N/A')}</div>
        </div>
        <div class="signature-block">
          <div class="sig-label">Signer</div>
          <div class="sig-value">${escHtml(pkg.signature.signer || 'Unknown')}</div>
        </div>
        <div class="signature-block">
          <div class="sig-label">Signature Hash</div>
          <div class="sig-value sig-hash">${escHtml(pkg.signature.signatureHash || 'N/A')}</div>
        </div>
        <div class="signature-block">
          <div class="sig-label">Signed At</div>
          <div class="sig-value">${pkg.signature.signedAt ? new Date(pkg.signature.signedAt).toISOString() : 'N/A'}</div>
        </div>
      `;
    }

    resultDiv.innerHTML = `
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Verification Report: ${escHtml(report.packageName)}</h2>
          ${statusBadge}
        </div>
        <div class="mono" style="font-size:0.75em;color:var(--text-muted)">
          Verified: ${report.verifiedAtStr} · Report ID: ${escHtml(report.id)}
        </div>
      </div>
      ${sectionHtml}
      ${sigDetails ? `
        <div class="card mt-1">
          <h2>🔐 Signature Details</h2>
          ${sigDetails}
        </div>
      ` : ''}
    `;
  }

  function renderChainOfCustody(pkg) {
    if (!pkg || !pkg.chainOfCustody || pkg.chainOfCustody.length === 0) return;

    const resultDiv = document.getElementById('verifyResult');
    const iconMap = {
      'CREATED': '🆕', 'SIGNED': '🔐', 'DISTRIBUTED': '📤',
      'REVOKED': '🚫', 'ATTESTED': '✍️'
    };

    const chainHtml = pkg.chainOfCustody.map(entry => {
      const isRevoked = entry.action === 'REVOKED';
      return `
        <div class="chain-entry ${isRevoked ? 'revoked' : ''}">
          <div class="chain-action">${iconMap[entry.action] || '📌'} ${escHtml(entry.action)}</div>
          <div class="chain-detail">
            Actor: <strong>${escHtml(entry.actor)}</strong><br>
            ${escHtml(entry.detail)}
          </div>
          <div class="chain-time">${new Date(entry.timestamp).toISOString()}</div>
        </div>
      `;
    }).join('');

    const chainCard = document.createElement('div');
    chainCard.className = 'card mt-1';
    chainCard.innerHTML = `
      <h2>⛓️ Chain of Custody (${pkg.chainOfCustody.length} events)</h2>
      <div style="font-size:0.82em;color:var(--text-secondary);margin-bottom:12px">
        Complete event history for this package.
      </div>
      ${chainHtml}
    `;
    resultDiv.appendChild(chainCard);
  }

  function renderQuickResult(qr) {
    const resultDiv = document.getElementById('verifyResult');
    resultDiv.innerHTML = `
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Quick Verify: ${escHtml(qr.packageName)}</h2>
          ${qr.valid
            ? '<span class="badge badge-green">✅ PASS</span>'
            : '<span class="badge badge-red">❌ FAIL</span>'}
        </div>
        <div style="font-size:0.85em">
          <div class="flex-row mb-1">
            <span>Hash Integrity:</span>
            <span class="badge ${qr.hashMatch ? 'badge-green' : 'badge-red'}">${qr.hashMatch ? '✅ MATCH' : '❌ MISMATCH'}</span>
          </div>
          <div class="flex-row mb-1">
            <span>Signature:</span>
            <span class="badge ${qr.hasSignature ? 'badge-green' : 'badge-yellow'}">${qr.hasSignature ? '🔐 PRESENT' : '⚠️ UNSIGNED'}</span>
          </div>
          <div class="flex-row">
            <span>Chain of Custody:</span>
            <span class="badge ${qr.hasChain ? 'badge-green' : 'badge-yellow'}">${qr.hasChain ? '⛓️ INTACT' : '⚠️ EMPTY'}</span>
          </div>
        </div>
      </div>
    `;
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
