# Studyo v0.1.0 — The Unified Constitutional Workspace

**Scope Definition**
**Date:** July 14, 2026
**Authority:** Sir Collins — Creator and Concept Pioneer of ICore
**Status:** PLANNED — Ready for implementation

---

## Constitutional Role

From the Kernel (Part I):
> "Studyo enables exploration, verification, and governance."
> "Studyo is the first living embodiment of ICore, transforming the constitutional science from a static body of knowledge into an interactive, verifiable, and executable constitutional engineering environment."

---

## Versioning Philosophy

- **v0.1.0** reflects implementation maturity, not conceptual maturity
- Every release maximizes constitutional value within its scope
- New versions expand capability, not fix incomplete vision
- v0.1.0 should feel complete for its defined purpose

---

## Scope Decision: Constitutional Necessity Test

Applying Part III Test 3 (Constitutional Necessity) to each desired capability:

### Included in v0.1.0 (Constitutionally Necessary)

| # | Capability | Why It's Necessary |
|---|-----------|-------------------|
| 1 | **Atlas Explorer** | Without accessible Atlas, the reference system is inert |
| 2 | **Verification Dashboard** | Without verification, claims remain unproven |
| 3 | **Governance View** | Without visible governance, changes are opaque |
| 4 | **Concept Search** | Without search, the Atlas is not navigable at scale |

### Deferred to v0.2.0+ (Valuable but Not Blocking)

| # | Capability | Why Deferred |
|---|-----------|-------------|
| 5 | Derive new concepts | Requires runtime (USR/CoreFab) for derivation engine |
| 6 | Visualize derivation graphs | Can be static in v0.1.0, interactive in v0.2.0 |
| 7 | Generate blueprints | Requires UCD (derivatives layer) to be operational |

### Rationale

v0.1.0 focuses on **making existing truth accessible and verifiable**. Derivation and generation require the runtime (USR/CoreFab) which comes after Studyo. The progression is:

```
v0.1.0: Explore + Verify + Govern (make truth accessible)
v0.2.0: Visualize + Navigate (make truth interactive)
v0.3.0: Derive + Generate (make truth productive)
```

---

## v0.1.0 Capabilities (Detailed)

### Capability 1: Atlas Explorer

**Purpose:** Browse the complete Constitutional Atlas with all 10 fields per entry.

**Features:**
- Render all 5 Atlas pages with full 10-field format
- Navigation sidebar with derivation order
- Cross-reference links between entries
- Search across all 10 fields
- Mobile-responsive (Android-first)

**Data Source:** `Constitutional-Atlas/*.md` files

### Capability 2: Verification Dashboard

**Purpose:** Run the 10 verification tests against any constitutional component.

**Features:**
- Select a component (USCP, USC, UCE, etc.)
- Display the 10 tests with pass/fail status
- Show the self-verification results (20/20 PASS)
- Allow manual verification of new proposals
- Export verification reports

**Data Source:** `Part-III-Verification-Framework.md`, `CONSTITUTIONAL-SELF-VERIFICATION.md`

### Capability 3: Governance View

**Purpose:** Make constitutional governance transparent and accessible.

**Features:**
- Display the 6-stage pipeline
- Show amendment types (Clarification, Extension, Modification, Deprecation, Removal)
- Display four-role model (Proposer, Reviewer, Verifier, Ratifier)
- Show governance status of each component
- Track pending amendments (if any)

**Data Source:** `Part-IV-Governance-Framework.md`

### Capability 4: Concept Search

**Purpose:** Find any constitutional concept across Kernel + Atlas.

**Features:**
- Full-text search across all markdown files
- Search by component name, definition, or cross-reference
- Filter by layer (Pre-Constitutional, Constitutional, Implementation)
- Show results with context and derivation path

**Data Source:** All `*.md` files in the repository

---

## Architecture

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| UI Framework | TypeScript + HTML/CSS | Browser-first, Android-compatible |
| Local Server | TypeScript (Deno or Node) | Offline-first, no cloud dependency |
| Content | Markdown files (read directly) | No database, no transformation loss |
| Search | Client-side full-text index | Offline-capable, no external service |

### Why NOT WIT/WASM for v0.1.0

The WIT/WASM constitutional ABI is designed for the **runtime** (USR/CoreFab), not the workspace. Studyo v0.1.0 is a **reference system interface** — it reads and presents constitutional truth, it does not execute it. The runtime stack is introduced when we build USR/CoreFab.

### Deployment Model

```
Local server (offline-first)
  ├── Serves TypeScript UI
  ├── Reads markdown files directly
  ├── Builds client-side search index
  └── Accessible via browser (Android or desktop)
```

- Zero cloud dependency
- Runs on constrained hardware
- No build step required for content updates
- Markdown files are the single source of truth

---

## Success Criteria

v0.1.0 is complete when:

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | All Atlas pages render with 10-field format | Visual inspection |
| 2 | All cross-references are clickable and correct | Link validation |
| 3 | Verification dashboard shows 20/20 PASS | Dashboard display |
| 4 | Governance pipeline is fully visible | Pipeline display |
| 5 | Search returns accurate results across all files | Search test |
| 6 | Runs offline on Android device | Device test |
| 7 | No cloud dependency exists | Network audit |
| 8 | All content sourced from markdown files | Code review |
| 9 | Mobile-responsive layout | Visual inspection |
| 10 | v0.1.0 feels complete for its defined scope | User acceptance |

---

## Files to Create

```
Studyo/
├── index.html              (main entry point)
├── styles.css              (responsive styling)
├── src/
│   ├── app.ts              (application shell)
│   ├── atlas-explorer.ts   (Capability 1)
│   ├── verification.ts     (Capability 2)
│   ├── governance.ts       (Capability 3)
│   ├── search.ts           (Capability 4)
│   └── markdown-parser.ts  (markdown → HTML)
├── content/                (symlink to Kernel + Atlas .md files)
└── README.md               (Studyo documentation)
```

---

## What v0.1.0 Does NOT Do

| Exclusion | Why | When |
|-----------|-----|------|
| Execute constitutional operations | Requires USR/CoreFab | v0.2.0+ |
| Derive new concepts automatically | Requires derivation engine | v0.2.0+ |
| Interactive graph visualization | Requires graph library | v0.2.0+ |
| Generate implementation blueprints | Requires UCD layer | v0.3.0+ |
| WASM runtime | Requires WIT/WASM stack | USR/CoreFab |
| Multi-user collaboration | Requires network layer | Future version |

---

## Progression After v0.1.0

```
v0.1.0 — Explore, Verify, Govern (current)
v0.2.0 — Visualize, Navigate (interactive graphs)
v0.3.0 — Derive, Generate (productive)
v0.4.0 — Integrate USR/CoreFab (runtime)
v1.0.0 — Full Constitutional Workspace (all capabilities)
```

---

## Constitutional Compliance

This scope definition is derived from:
- Part I of the Kernel (Studyo's constitutional role)
- Part III of the Kernel (verification requirements)
- Part IV of the Kernel (governance requirements)
- The Atlas v1.0 (the content Studyo presents)
- The Constitutional Freeze (what is frozen, what is not)

No new foundational theory is introduced. Studyo v0.1.0 is a constitutional derivative, not a constitutional invention.

---

*Every release maximizes constitutional value within its scope. v0.1.0 makes truth accessible. v0.2.0 makes truth interactive. v0.3.0 makes truth productive. This is constitutional derivation in practice.*
