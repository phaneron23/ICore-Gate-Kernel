// USDS — Verify UI v0.1.0
window.USDS_VerifyUI = (() => {
  'use strict';

  let container;

  function render(packages) {
    if (!container) container = document.getElementById('screen-verify');
    const options = packages.map(p =>
      `<option value="${p.id}">${escHtml(p.name)} v${escHtml(p.version)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-title">🔍 Verify Package</div>
      <div class="card">
        <h2>Verification Runner</h2>
        <div class="input-group">
          <label>Select Package</label>
          <select id="verifyPackage">${options || '<option value="">No packages available</option>'}</select>
        </div>
        <div class="flex-row">
          <button class="btn btn-primary" id="btnFullVerify">Full Verify</button>
          <button class="btn" id="btnQuickVerify">Quick Verify</button>
        </div>
      </div>
      <div id="verifyResult" class="mt-2"></div>
    `;

    document.getElementById('btnFullVerify').onclick = async () => {
      const pkgId = document.getElementById('verifyPackage').value;
      if (!pkgId) return alert('Select a package');
      const pkg = packages.find(p => p.id === pkgId);
      const { result, report } = await USDS_App.VerificationEngine.produceVerificationReport(pkg);
      renderFullReport(report);
    };

    document.getElementById('btnQuickVerify').onclick = async () => {
      const pkgId = document.getElementById('verifyPackage').value;
      if (!pkgId) return alert('Select a package');
      const pkg = packages.find(p => p.id === pkgId);
      const qr = await USDS_App.VerificationEngine.quickVerify(pkg);
      renderQuickResult(qr);
    };
  }

  function renderFullReport(report) {
    const resultDiv = document.getElementById('verifyResult');
    const statusBadge = report.overallStatus === 'PASS'
      ? '<span class="badge badge-green">PASS</span>'
      : '<span class="badge badge-red">FAIL</span>';

    const sectionHtml = report.sections.map(s => {
      const sb = s.status === 'PASS'
        ? '<span class="badge badge-green">PASS</span>'
        : s.status === 'N/A'
        ? '<span class="badge badge-yellow">N/A</span>'
        : '<span class="badge badge-red">FAIL</span>';
      return `
        <div class="card" style="margin-bottom:8px">
          <div class="flex-between">
            <strong>${escHtml(s.name)}</strong>
            ${sb}
          </div>
          <div style="font-size:0.82em;color:var(--text-secondary);margin-top:6px">${escHtml(s.details)}</div>
        </div>`;
    }).join('');

    resultDiv.innerHTML = `
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Verification Report: ${escHtml(report.packageName)}</h2>
          ${statusBadge}
        </div>
        <div class="mono" style="font-size:0.75em;color:var(--text-muted)">
          Verified: ${report.verifiedAtStr} · Report ID: ${report.id}
        </div>
      </div>
      ${sectionHtml}
    `;
  }

  function renderQuickResult(qr) {
    const resultDiv = document.getElementById('verifyResult');
    resultDiv.innerHTML = `
      <div class="card">
        <div class="flex-between mb-1">
          <h2>Quick Verify: ${escHtml(qr.packageName)}</h2>
          ${qr.valid
            ? '<span class="badge badge-green">PASS</span>'
            : '<span class="badge badge-red">FAIL</span>'}
        </div>
        <div style="font-size:0.85em">
          <div class="flex-row mb-1">
            <span>Hash:</span>
            <span class="badge ${qr.hashMatch ? 'badge-green' : 'badge-red'}">${qr.hashMatch ? 'MATCH' : 'MISMATCH'}</span>
          </div>
          <div class="flex-row mb-1">
            <span>Signature:</span>
            <span class="badge ${qr.hasSignature ? 'badge-green' : 'badge-yellow'}">${qr.hasSignature ? 'PRESENT' : 'NONE'}</span>
          </div>
          <div class="flex-row">
            <span>Chain:</span>
            <span class="badge ${qr.hasChain ? 'badge-green' : 'badge-yellow'}">${qr.hasChain ? 'EXISTS' : 'EMPTY'}</span>
          </div>
        </div>
      </div>
    `;
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();