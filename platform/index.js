// ICore Platform — Shared Constitutional Engine Platform v0.2.0
// Aggregates all constitutional engine modules into a single platform object.
// Load this file AFTER all individual module files have been loaded.
//
// Usage:
//   <script src="platform/corefab.js"></script>
//   <script src="platform/uca.js"></script>
//   <script src="platform/uscp.js"></script>
//   <script src="platform/usc.js"></script>
//   <script src="platform/sciences.js"></script>
//   <script src="platform/ucrs.js"></script>
//   <script src="platform/ucmodels.js"></script>
//   <script src="platform/ics.js"></script>
//   <script src="platform/trust-verify.js"></script>
//   <script src="platform/event-bus.js"></script>
//   <script src="platform/context-engine.js"></script>
//   <script src="platform/index.js"></script>

(() => {
  'use strict';

  const platform = Object.freeze({
    CoreFab:       window.CoreFab,
    UCA:           window.UCA,
    USCP:          window.USCP,
    USC:           window.USC,
    Sciences:      window.Sciences,
    UCRS:          window.UCRS,
    UCModels:      window.UCModels,
    ICS:           window.ICS,
    TrustVerify:   window.TrustVerify,
    EventBus:      window.EventBus,
    Context:       window.ICoreContext,
    version:       '0.2.0',
    name:          'ICorePlatform',
    capabilities:  [
      'corefab-runtime',
      'adapter-registry',
      'sovereign-primitives',
      'constitutional-rules',
      'constitutional-sciences',
      'reference-system',
      'canonical-models',
      'conformance-suite',
      'trust-verification',
      'event-bus',
      'jsonld-context',
    ],
  });

  window.ICorePlatform = platform;
})();
