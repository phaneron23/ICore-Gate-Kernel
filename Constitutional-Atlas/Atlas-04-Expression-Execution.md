# Atlas v1.0 — Expression, Execution & Implementation

*From self-reference to the world.*

---

## UCRS — Universal Constitutional Reference System

### 1. Canonical Definition
The canonical reference that represents the Constitution — the system that provides reference points and spatial orientation within constitutional space. UCRS is the Constitution's self-representation.

### 2. Constitutional Origin
Derived from UCL. UCRS is the Constitution's way of knowing where everything is within its own space.

### 3. Operational Meaning
UCRS is the constitution's GPS. Without it, constitutional entities exist but cannot be found. With it, every entity has a unique, verifiable position that any system can navigate to.

### 4. Derivation Path
```
UCL → UCRS (reference system expressed in canonical language)
```

### 5. Dependencies
- UCL (references must be expressed in the canonical language)

### 6. Constraints
- UCRS references USC itself, not external systems
- Every constitutional entity must have a unique position in UCRS
- UCRS cannot be bypassed — navigation must go through the reference system

### 7. Verification Criteria
- Every entity in the kernel has a UCRS position
- Positions are unique and non-ambiguous
- Navigation from any entity to any other is possible through UCRS

### 8. Governance Status
**Constitutional.** Changes require Part IV full pipeline. New reference types require Extension.

### 9. Reference Implementations
- URI/URL-based references (through UCA)
- JSON-LD @id fields (serialization of UCRS positions)

### 10. Cross-References
- [UCL](./Atlas-03-USC.md#ucl--universal-constitutional-language) — parent
- [UCModels](#ucmodels--universal-canonical-models) — depends on UCRS
- [Derivation Graph](./Atlas-08-Frameworks.md) — visual expression of UCRS

---

## UCModels — Universal Canonical Models

### 1. Canonical Definition
The set of canonical models that represent constitutional entities, their relationships, and their lifecycle processes — the ontological backbone of ICore.

### 2. Constitutional Origin
Derived from UCL and UCRS. UCModels combines expression (UCL) with orientation (UCRS) to produce authoritative representations.

### 3. Operational Meaning
UCModels is the single source of truth for what constitutional entities are and how they relate. All downstream systems — representations, visualizations, runtime — consume UCModels.

### 4. Derivation Path
```
UCL ─┐
     ├→ UCModels (canonical models)
UCRS ┘
```

### 5. Dependencies
- UCL (models are expressed in the canonical language)
- UCRS (models are oriented by the reference system)

### 6. Constraints
- Models must be expressed in UCL (not in any serialization format)
- Models must be oriented by UCRS (every entity has a position)
- Models are the authoritative source — downstream systems consume, not redefine

### 7. Verification Criteria
- Every model is expressed in UCL
- Every entity in a model has a UCRS position
- Models are internally consistent
- Models are sufficient for URS (representation)

### 8. Governance Status
**Constitutional.** Changes require Part IV full pipeline + impact analysis on URS and all downstream.

### 9. Reference Implementations
- JSON-LD schemas (serialization of UCModels)
- OWL ontologies (formal model representation through UCA)

### 10. Cross-References
- [UCL](./Atlas-03-USC.md#ucl--universal-constitutional-language) — parent
- [UCRS](#ucrs--universal-constitutional-reference-system) — parent
- [URS](#urs--universal-representation-system) — depends on UCModels

---

## USR / CoreFab — Universal Constitutional Execution Engine

### 1. Canonical Definition
The constitutional runtime that executes constitutional operations with sovereignty guarantees — the engine where constitutional logic becomes constitutional action.

### 2. Constitutional Origin
Derived from UVS (and transitively the entire stack above USCP). USR consumes visual and interactive constitutional interfaces.

### 3. Operational Meaning
USR is the constitution's muscle. It takes abstract authority and makes it concrete — executing operations, processing data, producing outputs. But it does so under constitutional governance: every operation is verified, every result is traceable.

### 4. Derivation Path
```
UVS → USR/CoreFab (execution runtime)
```

### 5. Dependencies
- UVS (execution requires visual/interactive interfaces)
- Transitive: the entire stack above USCP

### 6. Constraints
- USR never executes anything not verified by the constitutional stack
- Execution must be provenance-tracked
- Execution must be sovereign (no external override)
- Execution must be minimal (Android-first, constrained hardware)

### 7. Verification Criteria
- Every execution has verified provenance
- No unverified operation reaches execution
- Sovereignty is maintained (external systems cannot override)
- Resource consumption is minimal

### 8. Governance Status
**Constitutional.** Runtime changes require Part IV full pipeline. Implementation changes through UCA.

### 9. Reference Implementations
- WASM execution (portable, sandboxed through UCA)
- Rust internals (memory-safe through UCA)
- Deno runtime (JavaScript/TypeScript through UCA)

### 10. Cross-References
- [UVS](#uvs--universal-visualization-system) — parent
- [UCA](#uca--universal-constitutional-adapter) — depends on USR
- [CodeLabs](#codelabs) — experiments execute through USR

---

## UCA — Universal Constitutional Adapter

### 1. Canonical Definition
The universal adapter that maps constitutional interfaces to external systems — the constitutional boundary between the sovereign interior and the external world.

### 2. Constitutional Origin
Derived from USR. UCA is the last constitutional layer — everything beyond UCA is external, never part of the constitution itself.

### 3. Operational Meaning
UCA is the constitution's handshake with the world. It is how ICore talks to the internet, to devices, to other systems — without ever surrendering sovereignty. The adapter is controlled by the constitution, never the reverse.

### 4. Derivation Path
```
USR → UCA (adapter boundary)
```

### 5. Dependencies
- USR (adapters bridge the runtime, not raw abstractions)

### 6. Constraints (D4)
- **D4: Adaptation is the boundary.** Everything beyond UCA is external.
- The constitution never depends on an adapter
- Adapters are replaceable without constitutional change
- New adapters can be added through Extension (fast-track)

### 7. Verification Criteria
- Every adapter is interface-bounded (not hardwired)
- No external dependency exists in the constitutional stack
- Adapters can be swapped without breaking the kernel

### 8. Governance Status
**Architectural.** New adapters: Extension (standard pipeline). Adapter removal: Removal (standard pipeline). No constitutional change required.

### 9. Reference Implementations
- DNS/ENS/Handshake (naming adapters)
- JSON-LD/CBOR-LD (serialization adapters)
- WASM/Rust/Deno (execution adapters)
- Syncthing/IPFS (storage adapters)

### 10. Cross-References
- [USR/CoreFab](#usrcorefab--universal-constitutional-execution-engine) — parent
- [UCD](#ucd--universal-constitutional-derivatives) — depends on UCA
- [Standards Alignment](./Atlas-08-Frameworks.md) — external standard mappings

---

## UCD — Universal Constitutional Derivatives

### 1. Canonical Definition
The set of constitutionally-derived building blocks, services, and subsystems that implement specific capabilities while remaining constitutionally compliant.

### 2. Constitutional Origin
Derived from UCA. UCD elements are composed from UCA capabilities, not re-derived from the kernel (D5).

### 3. Operational Meaning
UCD is the constitution's practical toolkit. It translates high constitutional theory into ready-to-use building blocks. Implementers compose these components rather than building from scratch.

### 4. Derivation Path
```
UCA → UCD (derivatives composed from adapter capabilities)
```

### 5. Dependencies
- UCA (derivatives adapt constitutional capability to specific domains)

### 6. Constraints (D5)
- **D5: Derivatives are composed, not derived.** UCD elements do not re-derive the kernel.
- UCD elements must be constitutionally compliant
- UCD elements can be composed without kernel change
- UCD elements are replaceable

### 7. Verification Criteria
- Every derivative is composed from UCA capabilities
- No derivative re-derives kernel elements
- All derivatives pass Part III tests
- Derivatives are constitutionally compliant

### 8. Governance Status
**Architectural.** New derivatives: Extension (standard pipeline). Derivative removal: Removal (standard pipeline). No constitutional change required.

### 9. Reference Implementations
- Identity verification components
- Verification check components
- Governance pipeline components
- Data model components

### 10. Cross-References
- [UCA](#uca--universal-constitutional-adapter) — parent
- [CodeLabs](#codelabs) — derivatives are tested in CodeLabs
- [Implementations](#implementations) — derivatives compose into implementations

---

## CodeLabs

### 1. Canonical Definition
The sandboxed constitutional experimentation environment where new ideas are prototyped, validated, and refined before they enter the stable kernel.

### 2. Constitutional Origin
Depends on the full constitutional stack via UCA. CodeLabs is ICore.Gate's primary function — the proving ground for constitutional innovation.

### 3. Operational Meaning
CodeLabs is the constitution's immune system for innovation. It allows exploration without risk. New ideas are tested, verified, and only promoted if they pass constitutional verification.

### 4. Derivation Path
```
Full stack → UCA → CodeLabs (experimentation environment)
```

### 5. Dependencies
- Full constitutional stack (via UCA)
- USR/CoreFab (experiments execute through the runtime)

### 6. Constraints
- Experiments cannot corrupt the kernel (sandbox)
- Experiments must be verified before promotion
- Rejected experiments are archived, not deleted
- CodeLabs runs on the full constitutional stack

### 7. Verification Criteria
- Sandbox isolation is enforced
- Verification gates are operational
- Promotion criteria are met before kernel entry
- Archive preserves rejected experiments

### 8. Governance Status
**Implementation.** CodeLabs changes do not affect the kernel. Experiments are governed by CodeLabs-specific rules.

### 9. Reference Implementations
- ICore.Gate experimentation workspace
- Sandboxed execution environments

### 10. Cross-References
- [Studyo](#studyo) — CodeLabs integrates into Studyo
- [UCD](#ucd--universal-constitutional-derivatives) — derivatives are tested here
- [USR/CoreFab](#usrcorefab--universal-constitutional-execution-engine) — execution engine

---

## Studyo

### 1. Canonical Definition
The unified constitutional workspace that integrates CodeLabs, the Constitutional Atlas, and all constitutional tools into one sovereign, accessible interface. *(Note: Named "Studyo" for unique, memorable identity.)*

### 2. Constitutional Origin
The outermost layer. Studyo depends on everything beneath it but nothing depends on Studyo.

### 3. Operational Meaning
Studyo is the constitution's public face. It is where humans meet the constitution — where they can read it, understand it, govern it, and use it. Studyo must be accessible (Android-first, offline-capable) while remaining sovereign (zero cloud lock-in).

### 4. Derivation Path
```
CodeLabs → Studyo (unified workspace)
```

### 5. Dependencies
- CodeLabs (experimentation surface)
- Full constitutional stack (everything beneath Studyo)

### 6. Constraints
- Android-first, offline-capable (accessibility constraint)
- Zero cloud lock-in (sovereignty constraint)
- Human-reviewable (transparency constraint)
- Studyo is the outermost layer — nothing in the kernel depends on it

### 7. Verification Criteria
- Accessibility requirements are met
- Sovereignty is maintained (no external dependencies)
- Integration with CodeLabs and Atlas is functional
- All constitutional tools are accessible

### 8. Governance Status
**Implementation.** Studyo changes do not affect the kernel. Interface changes are governed by Studyo-specific rules.

### 9. Reference Implementations
- studyo.initialcore.net (planned web interface)
- Android application (planned)

### 10. Cross-References
- [CodeLabs](#codelabs) — depends on CodeLabs
- [Constitutional Atlas](./README.md) — integrated into Studyo
- [UVS](#uvs--universal-visualization-system) — visualization feeds into Studyo

---

## URS & UVS (Representation & Visualization)

### URS — Universal Representation System
Maps constitutional meaning (UCModels) into representational forms — textual, structural, and visual. Depends on UCModels. Feeds into UVS.

### UVS — Universal Visualization System
Renders constitutional knowledge into human-interpretable, interactive visual forms. Depends on URS. Feeds into USR/CoreFab.

Both are **Constitutional** governance status. Both follow standard Part IV pipeline.

---

*The expression and execution layers transform constitutional meaning into action — from self-reference (UCRS) through execution (USR) to the world (UCA) and the user (Studyo).*
