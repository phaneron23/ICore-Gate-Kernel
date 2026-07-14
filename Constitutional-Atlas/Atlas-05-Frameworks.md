# Atlas v1.0 — Constitutional Frameworks

*The rules that govern the constitution itself.*

---

## Verification Framework (10 Tests)

### 1. Canonical Definition
The constitutional immune system — 10 tests that every proposal must pass before becoming constitutional. One failure = rejection. No exceptions.

### 2. Constitutional Origin
Derived from the Verification primitive (USCP #6). Operationalizes "How do we know it is valid?" into 10 concrete, checkable tests.

### 3. Operational Meaning
The verification framework is applied to every constitutional change, every new derivation, and every governance decision. It is the gatekeeper that prevents unverified, unnecessary, or destructive additions from entering the kernel.

### 4. Derivation Path
```
Verification (USCP #6) → USC → Verification Framework (Part III)
```

### 5. Dependencies
- Verification primitive (the foundation)
- Derivation Rules D1–D5 (Test 4 checks derivation compliance)

### 6. Constraints
- **One failure = rejection. No exceptions.**
- Tests are ordered by priority (Reality before abstraction)
- Test results are permanent constitutional artifacts
- The framework verifies itself (self-referential)

### 7. Verification Criteria (self-referential)
- The 10 tests are internally consistent
- Every test has a clear pass/fail criterion
- The framework can be applied to itself
- Independent parties can replicate the audit

### 8. Governance Status
**Constitutional.** Adding a test requires Part IV full pipeline + proof that existing tests are insufficient. Removing a test requires proof that no vulnerability is introduced.

### 9. Reference Implementations
- Self-Verification Report (`CONSTITUTIONAL-SELF-VERIFICATION.md`)
- Any governance proposal undergoes 10-test audit

### 10. Cross-References
- [Verification](./Atlas-02-USCP.md#verification) — the primitive this operationalizes
- [Governance Framework](#governance-framework) — verification is the gate in governance
- [Derivation Rules](#derivation-rules-d1d5) — Test 4 checks derivation compliance

### The 10 Tests

| # | Test | Question | Pass Criterion |
|---|------|----------|----------------|
| 1 | Reality | Does this correspond to something real? | References verifiable reality |
| 2 | Origin | Can its source be traced? | Every claim cites derivation source |
| 3 | Constitutional Necessity | Must this exist at the constitutional level? | Removing it breaks the kernel |
| 4 | Derivation | Is it derived from the layer below? | Follows D1–D5 |
| 5 | Consistency | Does it contradict existing knowledge? | No logical/structural/semantic conflict |
| 6 | Verification | Can its truth be independently confirmed? | Second party can reproduce |
| 7 | Simplicity | Can it be stated more simply? | Minimal expression of purpose |
| 8 | Sovereignty | Does it preserve constitutional independence? | No external dependency |
| 9 | Replaceability | Can any part be swapped without breaking? | Interface-bounded, not hardwired |
| 10 | Evolution | Can it be amended without destroying dependents? | Clean gap on removal |

---

## Governance Framework

### 1. Canonical Definition
The constitutional immune system for change — a 6-stage pipeline that regulates how the constitution evolves, with four-role separation preventing capture.

### 2. Constitutional Origin
Derived from the Transformation primitive (USCP #5) and Constraint primitive (USCP #4). Operationalizes "How does it change?" within governed boundaries.

### 3. Operational Meaning
Governance ensures that every constitutional change is deliberate, verified, and traceable. It prevents both authoritarian capture (four-role separation) and committee paralysis (clear pipeline).

### 4. Derivation Path
```
Transformation (USCP #5) + Constraint (USCP #4) → USC → Governance Framework (Part IV)
```

### 5. Dependencies
- Transformation primitive (governs change)
- Constraint primitive (governs limits on change)
- Verification Framework (verification gate in pipeline)

### 6. Constraints
- **Four-role separation:** Proposer, Reviewer, Verifier, Ratifier — no one holds more than one role per cycle
- **Constitutional supremacy:** governance governs the constitution, not implementations
- **Backward compatibility:** changes cannot break existing derivations
- **Human review:** all constitutional changes require human oversight

### 7. Verification Criteria
- Pipeline stages are enforced (no skipping)
- Role separation is maintained
- Every change has full provenance (author, date, derivation chain, test results)
- Published records are immutable

### 8. Governance Status
**Constitutional.** Governance governs itself through its own pipeline. Changes to governance require the full 6-stage process.

### 9. Reference Implementations
- Git/Fossil version control (publication and provenance)
- GPG signatures (identity verification in governance)
- Governance pipeline documentation (Part IV of Kernel)

### 10. Cross-References
- [Transformation](./Atlas-02-USCP.md#transformation) — the primitive this operationalizes
- [Constraint](./Atlas-02-USCP.md#constraint) — the primitive this operationalizes
- [Verification Framework](#verification-framework-10-tests) — the gate in the pipeline

### The 6-Stage Pipeline

```
Proposal → Review → Verification → Ratification → Publication → Derivation
```

### Amendment Types

| Type | Scope | Speed |
|------|-------|-------|
| Clarification | Rephrase without changing meaning | Fast-track |
| Extension | Add new element to existing layer | Standard |
| Modification | Change meaning or behavior | Standard + impact analysis |
| Deprecation | Mark for eventual removal | Standard |
| Removal | Delete from kernel | Standard + proof of no dependencies |

---

## Derivation Rules (D1–D5)

### 1. Canonical Definition
Five rules that govern how constitutional elements are derived from one another — the structural backbone of the derivation graph.

### 2. Constitutional Origin
Derived from the Relationship primitive (USCP #3) and Constraint primitive (USCP #4). Operationalizes how entities connect and what limits those connections.

### 3. Operational Meaning
D1–D5 are the constitutional laws of structure. They ensure that the derivation graph is acyclic, that changes flow downward, and that the constitution remains sovereign.

### 4. Derivation Path
```
Relationship (USCP #3) + Constraint (USCP #4) → USC → Derivation Rules (Part II)
```

### 5. Dependencies
- Relationship primitive (defines connections)
- Constraint primitive (defines limits on connections)

### 6. Constraints (self-referential)
- **D1: Downward only** — every new element derives from the layer below. No skipping.
- **D2: No upward mutation** — lower layers never alter upper layers.
- **D3: Merge requires justification** — convergent derivations must cite all parents.
- **D4: Adaptation is the boundary** — UCA is the last constitutional layer.
- **D5: Derivatives are composed** — UCD elements do not re-derive the kernel.

### 7. Verification Criteria
- Every derivation in the kernel follows D1–D5
- No upward mutations exist in the derivation graph
- All merges cite their parent layers
- The derivation graph is acyclic

### 8. Governance Status
**Constitutional.** Changing a derivation rule requires Part IV full pipeline + proof that the change does not introduce cycles or upward mutations.

### 9. Reference Implementations
- Part II — Derivation Graph (visual expression of D1–D5)
- Graph validation tools (through UCA)

### 10. Cross-References
- [Relationship](./Atlas-02-USCP.md#relationship) — the primitive this operationalizes
- [Constraint](./Atlas-02-USCP.md#constraint) — the primitive this operationalizes
- [Verification Framework](#verification-framework-10-tests) — Test 4 checks D1–D5 compliance
- [Part II — Derivation Graph](../Part-II-Derivation-Graph.md)

---

## Standards Alignment

### 1. Canonical Definition
The mapping between constitutional concepts and established external standards — demonstrating interoperability while preserving constitutional independence.

### 2. Constitutional Origin
Derived from UCA (adapter layer). Standards alignment is architectural, not constitutional — it is advisory, not binding.

### 3. Operational Meaning
Standards alignment shows that ICore can interoperate with existing systems (W3C, DID, VC, PROV) without depending on them. Every alignment is replaceable through UCA.

### 4. Derivation Path
```
UCA → Standards Alignment (advisory mapping)
```

### 5. Dependencies
- UCA (standards are external systems accessed through adapters)

### 6. Constraints
- **All alignments are advisory, not binding**
- No external standard is constitutionally required
- Every alignment is replaceable through UCA
- Constitutional independence is never sacrificed for alignment

### 7. Verification Criteria
- Every alignment is advisory (not binding)
- No external dependency exists in the constitutional stack
- All referenced standards are accessed through UCA

### 8. Governance Status
**Architectural.** New alignments: Extension (standard pipeline). Alignment removal: Removal (standard pipeline). No constitutional change required.

### 9. Reference Implementations
- JSON-LD 1.1 (serialization alignment)
- CBOR-LD (compact serialization alignment)
- DID Core (identity alignment)
- VC Data Model 2.0 (verifiable claims alignment)
- PROV-DM (provenance alignment)
- RDF 1.1 (semantic alignment)

### 10. Cross-References
- [UCA](./Atlas-04-Expression-Execution.md#uca--universal-constitutional-adapter) — the boundary through which standards are accessed
- [Part V — Standards Alignment](../Part-V-Standards-Alignment.md)

### W3C Alignment Map

| ICore Concept | W3C Standard | Relationship |
|---------------|-------------|--------------|
| UCL semantic precision | RDF 1.1 | Compatible, not dependent |
| JSON-LD serialization | JSON-LD 1.1 | Direct alignment |
| Provenance | PROV-DM | Maps to entities, activities, agents |
| Verifiable claims | VC Data Model 2.0 | Can be expressed as VCs |
| Decentralized identifiers | DID Core | UCA adapters can use DID resolution |

---

*The frameworks are the constitution's immune system, logic engine, and bridge to the outside world. They protect, govern, and connect — without ever surrendering sovereignty.*
