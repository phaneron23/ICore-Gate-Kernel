// USDS — Packages UI v0.1.0
window.USDS_PackagesUI = (() => {
  'use strict';

  let container;

  function render(packages) {
    if (!container) container = document.getElementById('screen-packages');
    const pkgCards = packages.map(p => {
      const sizeKB = (p.size / 1024).toFixed(1);
      const sigBadge = p.signature
        ? '<span class="badge badge-green">SIGNED</span>'
        : '<span class="badge badge-yellow">UNSIGNED</span>';
      const dateStr = new Date(p.createdAt).toLocaleDateString();
      return `
        <div class="package-card" data-id="${p.id}">
          <div class="pkg-icon">📦</div>
          <div class="pkg-info">
            <div class="pkg-name">${escHtml(p.name)}</div>
            <div class="pkg-meta">v${escHtml(p.version)} · ${sizeKB}KB · ${dateStr} · ${p.chainOfCustody.length} events</div>
          </div>
          <div class="pkg-status">${sigBadge}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-title flex-between">
        <span>📋 Constitutional Packages</span>
        <button class="btn btn-primary" id="btnCreatePackage">+ New Package</button>
      </div>
      <div id="createPackageForm" style="display:none">
        <div class="card">
          <h2>Create Constitutional Package</h2>
          <div class="input-group">
            <label>Package Name</label>
            <input type="text" id="pkgName" placeholder="e.g. Constitutional Amendment VII">
          </div>
          <div class="input-group">
            <label>Version</label>
            <input type="text" id="pkgVersion" placeholder="1.0.0" value="1.0.0">
          </div>
          <div class="input-group">
            <label>Author</label>
            <input type="text" id="pkgAuthor" placeholder="e.g. Sir Collins">
          </div>
          <div class="input-group">
            <label>Description</label>
            <input type="text" id="pkgDesc" placeholder="Brief description">
          </div>
          <div class="input-group">
            <label>Content</label>
            <textarea id="pkgContent" rows="6" placeholder="Constitutional content or manifest data..."></textarea>
          </div>
          <div class="flex-row">
            <button class="btn btn-primary" id="btnDoCreate">Create Package</button>
            <button class="btn" id="btnCancelCreate">Cancel</button>
          </div>
        </div>
      </div>
      <div id="packageList">
        ${pkgCards || ''}
        ${packages.length === 0
          ? '<div class="empty-state"><div class="empty-icon">📦</div>No constitutional packages yet.<br>Click "New Package" to create one.</div>'
          : ''}
      </div>
    `;
    bindEvents(packages);
  }

  function bindEvents(packages) {
    const createBtn = document.getElementById('btnCreatePackage');
    const cancelBtn = document.getElementById('btnCancelCreate');
    const doCreate = document.getElementById('btnDoCreate');
    const form = document.getElementById('createPackageForm');

    if (createBtn) createBtn.onclick = () => { form.style.display = form.style.display === 'none' ? 'block' : 'none'; };
    if (cancelBtn) cancelBtn.onclick = () => { form.style.display = 'none'; };
    if (doCreate) doCreate.onclick = async () => {
      const name = document.getElementById('pkgName').value.trim();
      const version = document.getElementById('pkgVersion').value.trim();
      const author = document.getElementById('pkgAuthor').value.trim();
      const description = document.getElementById('pkgDesc').value.trim();
      const content = document.getElementById('pkgContent').value;
      if (!name) return alert('Package name is required');
      await USDS_App.PackageEngine.createPackage({
        name, version, content,
        metadata: { type: 'constitutional', author, description }
      });
      USDS_App.EventBus.emit('usds:package-created', { name });
      form.style.display = 'none';
      USDS_App.navigate('packages');
    };
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();