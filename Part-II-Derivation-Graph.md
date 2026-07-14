# ICore.Gate — Minimal Constitutional Kernel v1.0

## Part II — Constitutional Derivation Graph

Everything flows downward. Nothing flows upward.

---

### The Graph

```
                    ┌─────────────┐
                    │   REALITY   │  ← Pre-constitutional
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ PRINCIPLES  │  ← Pre-constitutional
                    └──────┬──────┘
                           ↓
              ═══════════════════════════════
              ║  CONSTITUTIONAL BOUNDARY     ║
              ═══════════════════════════════
                           ↓
                    ┌─────────────┐
                    │    USCP     │  ← Primitives
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     USC     │  ← Sovereign Core
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCE     │  ← Epistemology
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCC     │  ← Calculus
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCM     │  ← Mathematics
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCL     │  ← Language (meaning/serialization split)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │    UCRS     │  ← Reference System
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │  UCModels   │  ← Canonical Models
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     URS     │  ← Representation
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UVS     │  ← Visualization
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ USR/CoreFab │  ← Execution Runtime
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCA     │  ← Adapter (constitutional boundary to outside)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     UCD     │  ← Derivatives
                    └──────┬──────┘
                           ↓
              ═══════════════════════════════
              ║  IMPLEMENTATION BOUNDARY     ║
              ═══════════════════════════════
                           ↓
              ┌──────────────────────────────┐
              │  CodeLabs → Studio → Users   │  ← Interface layer
              └──────────────────────────────┘
```

---

### Graph Properties

**Linearity.** The graph is a single directed chain — no branching, no cycles, no shortcuts. Every layer depends on exactly one layer below it (with two exceptions noted below). This enforces that nothing is invented; everything is derived.

**Two merge points.** UCModels depends on both UCL *and* UCRS — meaning and reference converge to produce canonical models. CodeLabs depends on the full stack via UCA — experimentation requires the complete foundation.

**Two constitutional boundaries.**
- **Upper boundary** (Principles → USCP): where pre-constitutional reality enters the system as formal primitives.
- **Lower boundary** (UCD → Implementations): where constitutional knowledge exits into concrete systems.

**Three zones.**
- **Pre-constitutional** (Reality, Principles): what exists before the constitution.
- **Constitutional** (USCP through UCD): the governed, verified, sovereign core.
- **Implementation** (CodeLabs, Studio, external systems): where constitution meets the world.

**Upward flow is forbidden.** An implementation cannot alter a derivative. A derivative cannot alter the adapter. A model cannot alter the language. If a lower layer needs to change, it must go through governance (Part IV), be verified (Part III), and enter as a new derivation from above — never as an upward mutation.

---

### Derivation Rules

| Rule | Meaning |
|------|---------|
| **D1: Downward only** | Every new element is derived from the layer immediately below it. No skipping. |
| **D2: No upward mutation** | Lower layers never alter upper layers. Changes propagate downward through governance. |
| **D3: Merge requires justification** | When two layers converge (as UCL + UCRS → UCModels), both parent layers must be cited. |
| **D4: Adaptation is the boundary** | UCA is the last constitutional layer. Everything beyond UCA is an external system, never part of the constitution itself. |
| **D5: Derivatives are composed, not derived** | UCD elements are composed from UCA capabilities. They do not re-derive the kernel. |

---

*This graph is the structural backbone of ICore. Every subsequent part — verification, governance, standards — operates on and through this graph.*
