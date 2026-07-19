// USDS — Packages UI v0.2.0
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
      const hashShort = p.contentHash ? p.contentHash.substring(0, 12) + '…' : 'N/A';
      return `
        <div class="package-card" data-id="${p.id}">
          <div class="pkg-icon">📦</div>
          <div class="pkg-info">
            <div class="pkg-name">${escHtml(p.name)}</div>
            <div class="pkg-meta">
              v${escHtml(p.version)} · ${sizeKB}KB · ${dateStr} · ${p.chainOfCustody.length} events
            </div>
            <div class="pkg-meta mono" style="margin-top:2px">
              Hash: ${escHtml(hashShort)}
            </div>
            <div class="pkg-actions">
              ${!p.signature
                ? `<button class="btn btn-sm btn-primary" data-action="sign" data-id="${p.id}">🔐 Sign</button>`
                : ''}
              <button class="btn btn-sm" data-action="verify" data-id="${p.id}">🔍 Verify</button>
              <button class="btn btn-sm btn-danger" data-action="delete" data-id="${p.id}">🗑️ Delete</button>
            </div>
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
          <div class="grid-2col">
            <div class="input-group">
              <label>Package Name *</label>
              <input type="text" id="pkgName" placeholder="e.g. Constitutional Amendment VII">
            </div>
            <div class="input-group">
              <label>Version</label>
              <input type="text" id="pkgVersion" placeholder="1.0.0" value="1.0.0">
            </div>
          </div>
          <div class="grid-2col">
            <div class="input-group">
              <label>Author / Originator</label>
              <input type="text" id="pkgAuthor" placeholder="e.g. Sir Collins">
            </div>
            <div class="input-group">
              <label>Description</label>
              <input type="text" id="pkgDesc" placeholder="Brief description">
            </div>
          </div>
          <div class="input-group">
            <label>Content</label>
            <textarea id="pkgContent" rows="6" placeholder="Constitutional content, manifest data, or manifest text..."></textarea>
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
          ? '<div class="empty-state"><div class="empty-icon">📦</div>No constitutional packages yet.<br>Click "New Package" to create your first sovereign package.</div>'
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

    if (createBtn) createBtn.onclick = () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
      if (form.style.display === 'block') {
        document.getElementById('pkgName').focus();
      }
    };
    if (cancelBtn) cancelBtn.onclick = () => { form.style.display = 'none'; };

    if (doCreate) doCreate.onclick = async () => {
      const name = document.getElementById('pkgName').value.trim();
      const version = document.getElementById('pkgVersion').value.trim() || '1.0.0';
      const author = document.getElementById('pkgAuthor').value.trim();
      const description = document.getElementById('pkgDesc').value.trim();
      const content = document.getElementById('pkgContent').value;
      if (!name) {
        showToast('⚠️ Package name is required');
        return;
      }
      doCreate.disabled = true;
      doCreate.textContent = 'Creating…';
      try {
        await USDS_App.PackageEngine.createPackage({
          name, version, content,
          metadata: { type: 'constitutional', author, description }
        });
        USDS_App.EventBus.emit('usds:package-created', { name });
        form.style.display = 'none';
        showToast('✅ Package "' + name + '" created');
        USDS_App.navigate('packages');
      } catch (err) {
        console.error('[USDS] Create error:', err);
        showToast('❌ Failed to create package');
      } finally {
        doCreate.disabled = false;
        doCreate.textContent = 'Create Package';
      }
    };

    // Delegate actions on package cards
    document.getElementById('packageList').addEventListener('click', async e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'sign') {
        btn.disabled = true;
        btn.textContent = 'Signing…';
        try {
          await USDS_App.PackageEngine.signPackage(id, {
            signer: 'constitutional-authority'
          });
          USDS_App.EventBus.emit('usds:package-signed', { id });
          showToast('🔐 Package signed successfully');
          USDS_App.navigate('packages');
        } catch (err) {
          showToast('❌ Sign failed: ' + err.message);
          btn.disabled = false;
          btn.textContent = '🔐 Sign';
        }
      }

      if (action === 'verify') {
        USDS_App.navigate('verify');
        // Pre-select this package in the verify view
        setTimeout(() => {
          const sel = document.getElementById('verifyPackage');
          if (sel) sel.value = id;
        }, 100);
      }

      if (action === 'delete') {
        if (!confirm('Delete this package? This cannot be undone.')) return;
        try {
          await USDS_App.PackageEngine.deletePackage(id);
          showToast('🗑️ Package deleted');
          USDS_App.navigate('packages');
        } catch (err) {
          showToast('❌ Delete failed: ' + err.message);
        }
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
