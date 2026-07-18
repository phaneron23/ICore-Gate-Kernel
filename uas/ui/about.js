// UAS — About UI v1.0.0
window.UASAbout = (() => {
  'use strict';

  function render(container, ctx) {
    const { registry, orchestrator, trustEngine } = ctx;
    const registryStats = registry.getStats();
    const orchestratorStats = orchestrator.getStats();
    const platformInfo = window.ICorePlatform || {};

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">About UAS</h2>
      </div>

      <div class="card">
        <div style="text-align: center; padding: 1rem 0;">
          <div style="font-size: 2rem; font-weight: 700; color: var(--accent); letter-spacing: 2px;">UAS</div>
          <div style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 0.3rem;">Universal Agentic System</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">v1.0.0</div>
        </div>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem;">Module Information</div>
        <table style="width: 100%; font-size: 0.82rem; border-collapse: collapse;">
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Name</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">UAS — Universal Agentic System</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Version</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">1.0.0</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Type</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">PWA — Progressive Web Application</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Originator</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--accent);">Sir Collins</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Framework</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">ICore Gate Kernel v1</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary); border-bottom: 1px solid var(--border);">Platform Version</td>
            <td style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">${platformInfo.version || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem 0; color: var(--text-secondary);">Dependencies</td>
            <td style="padding: 0.4rem 0;">None — zero external dependencies</td>
          </tr>
        </table>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem;">System Capabilities</div>
        <div class="chip-list">
          ${(platformInfo.capabilities || []).map(cap => `
            <span class="chip">${cap}</span>
          `).join('')}
          <span class="chip">agent-lifecycle</span>
          <span class="chip">multi-agent-orchestration</span>
          <span class="chip">trust-engine</span>
          <span class="chip">constitutional-constraints</span>
          <span class="chip">attestation-chain</span>
        </div>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem;">Engines</div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid var(--border);">
            <span>Agent Engine</span>
            <span class="badge badge-green">Active</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid var(--border);">
            <span>Orchestrator Engine</span>
            <span class="badge badge-green">Active</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid var(--border);">
            <span>Trust Engine</span>
            <span class="badge badge-green">Active</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>Platform Engine</span>
            <span class="badge badge-${window.CoreFab ? 'green' : 'red'}">${window.CoreFab ? 'Loaded' : 'Not Found'}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem;">Runtime Statistics</div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>Total Agents</span>
            <strong style="color: var(--text-primary);">${registryStats.total}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>Active Agents</span>
            <strong style="color: var(--green);">${registryStats.active}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>Total Sessions</span>
            <strong style="color: var(--text-primary);">${orchestratorStats.total}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>Average Trust</span>
            <strong style="color: var(--yellow);">${registryStats.avgTrust}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
            <span>EventBus Subscribers</span>
            <strong style="color: var(--text-primary);">${window.EventBus ? Object.keys(EventBus.subscribers()).length : 0}</strong>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 0.75rem;">Constitutional Framework</div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.7;">
          <p>UAS is built on the <strong>ICore Constitutional Framework</strong> — a sovereign intelligence architecture
          that enforces derivation rules, epistemic grounding, and structural consistency at every layer.</p>
          <p style="margin-top: 0.5rem;">Every agent operation is <strong>attested</strong>, every state change is <strong>governed</strong>,
          and every claim is <strong>verifiable</strong>. Trust is not assumed — it is earned and measured.</p>
          <p style="margin-top: 0.5rem;">Derived from USCP (Sovereign Core Primitives) → USC (Constitutional Rules) → Sciences → UCA (Adapter Boundary).</p>
        </div>
      </div>

      <div class="card" style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">
        <p>UAS v1.0.0 · ICore Platform ${platformInfo.version || 'v0.1.0'}</p>
        <p style="margin-top: 0.3rem;">Originated by <strong style="color: var(--accent);">Sir Collins</strong></p>
        <p style="margin-top: 0.3rem;">Zero external dependencies · Offline-first · Sovereign</p>
      </div>
    `;
  }

  return Object.freeze({ render });
})();
