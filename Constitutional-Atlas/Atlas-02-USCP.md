# Atlas v1.0 — USCP: The Six Constitutional Primitives

*The smallest complete constitutional foundation. Nothing can be removed; nothing needs to be added.*

---

## Existence

### 1. Canonical Definition
The constitutional primitive that answers "What is?" — the declaration that something exists within the constitutional boundary.

### 2. Constitutional Origin
Derived from Principles. Existence is the first constitutional translation of Reality — the moment raw being becomes a constitutional fact.

### 3. Operational Meaning
Existence defines the constitutional boundary — what is inside the system and what is outside. Everything inside the boundary is subject to the constitution. Everything outside is external. When ICore boots, it first asserts: "I exist. Here is my boundary."

### 4. Derivation Path
```
Reality → Principles → Existence (USCP primitive #1)
```

### 5. Dependencies
- Principles (grounded in the philosophical foundations)

### 6. Constraints
- Existence cannot be further decomposed — it is irreducible
- Existence requires a boundary — something must be inside and outside
- Existence presupposes nothing within the constitution (it is the first primitive)

### 7. Verification Criteria
- The system can declare its boundary
- The boundary is operationally enforced (inside vs. outside)
- No constitutional claim exists without a defined subject

### 8. Governance Status
**Constitutional.** Changes require Part IV full pipeline (6 stages). Removal requires proof that no derivation depends on it (impossible — all other primitives depend on Existence).

### 9. Reference Implementations
- Kernel initialization (boundary assertion)
- UCA adapter configuration (defining external vs. internal)

### 10. Cross-References
- [Identity](#identity) — depends on Existence
- [USC — Boundary](./Atlas-03-USC.md) — USC's expression of Existence
- [Reality](./Atlas-01-Pre-Constitutional.md) — the pre-constitutional ground of Existence

---

## Identity

### 1. Canonical Definition
The constitutional primitive that answers "Who/what is it?" — the assignment of unique, verifiable character to each entity within the constitutional boundary.

### 2. Constitutional Origin
Derived from Existence. Identity arises from the need to differentiate — to distinguish one constitutional entity from another.

### 3. Operational Meaning
Identity is the constitutional fingerprint that cannot be forged, copied, or confused. When a constitutional entity claims authority, the first question is: "Who are you, and how do we know?" Identity answers this through provenance.

### 4. Derivation Path
```
Existence → Identity (USCP primitive #2)
```

### 5. Dependencies
- Existence (entities must exist before they can be identified)

### 6. Constraints
- Two entities cannot share the same Identity
- Identity requires both Self (what it is) and Other (what it is not)
- Identity must include Provenance (where it came from)
- Identity cannot be forged or copied

### 7. Verification Criteria
- Each entity has a unique identifier
- Identity can be independently verified
- Provenance chain is traceable to a constitutional source

### 8. Governance Status
**Constitutional.** Changes require Part IV full pipeline. Identity changes affect all downstream layers.

### 9. Reference Implementations
- DID (Decentralized Identifiers) through UCA
- DNS/ENS/Handshake naming adapters
- GPG key signatures (provenance verification)

### 10. Cross-References
- [Existence](#existence) — prerequisite
- [Relationship](#relationship) — depends on Identity
- [UCRS](./Atlas-05-Expression.md) — the reference system that maps identities
- [UCA — Identity adapters](./Atlas-06-Execution.md)

---

## Relationship

### 1. Canonical Definition
The constitutional primitive that answers "How is it connected?" — the capture of connections between constitutional entities.

### 2. Constitutional Origin
Derived from Identity. Relationship arises from the fact that distinct entities do not exist in isolation — they form networks of dependency, influence, and meaning.

### 3. Operational Meaning
Relationship is the structural backbone of ICore. The derivation graph is a Relationship graph. The verification framework checks Relationship integrity. Every connection in the system is a Relationship.

### 4. Derivation Path
```
Existence → Identity → Relationship (USCP primitive #3)
```

### 5. Dependencies
- Identity (entities must be identified before they can be related)

### 6. Constraints
- Every Relationship has a source and a target (directionality)
- Four types are sufficient: Dependency, Composition, Influence, Identity
- Upward Relationships are forbidden (D2)
- Relationships must be traceable to their constitutional source

### 7. Verification Criteria
- Every Relationship has explicit source and target
- Relationship type is classified (Dependency/Composition/Influence/Identity)
- No circular Dependencies (derivation graph is acyclic)

### 8. Governance Status
**Constitutional.** New Relationship types require Part IV full pipeline. New instances of existing types can be added through governance.

### 9. Reference Implementations
- Derivation graph (Part II of Kernel)
- RDF/JSON-LD relationships (through UCA)
- Graph database models (through UCRS)

### 10. Cross-References
- [Identity](#identity) — prerequisite
- [Constraint](#constraint) — depends on Relationship
- [Part II — Derivation Graph](../Part-II-Derivation-Graph.md)
- [Derivation Rules (D1–D5)](./Atlas-08-Frameworks.md)

---

## Constraint

### 1. Canonical Definition
The constitutional primitive that answers "What governs or limits it?" — the rules that define what is permissible, valid, and trustworthy within the system.

### 2. Constitutional Origin
Derived from Relationship. Constraint arises from the constitutional need for order — rules that limit what is permissible after connections are established.

### 3. Operational Meaning
Constraint is the constitutional immune system. It prevents invalid states from ever being reached. A Constraint that cannot be checked is not a Constraint — it is a suggestion.

### 4. Derivation Path
```
Existence → Identity → Relationship → Constraint (USCP primitive #4)
```

### 5. Dependencies
- Relationship (constraints govern connections; connections must exist first)

### 6. Constraints (self-referential)
- Every Constraint must be verifiable (enforceability)
- Four types: Structural, Behavioral, Temporal, Protective
- Constraints cannot contradict each other (consistency)
- Constraints are constitutional laws — not optional, not context-dependent

### 7. Verification Criteria
- Every Constraint can be checked programmatically
- Constraint violations are detectable
- No two Constraints contradict each other

### 8. Governance Status
**Constitutional.** Constraint changes require Part IV full pipeline + mandatory impact analysis on all dependent layers.

### 9. Reference Implementations
- Part III — Verification Framework (10 tests operationalize Constraints)
- Part IV — Governance Framework (governs Constraint evolution)
- Formal validation rules (JSON Schema, OWL, etc. through UCA)

### 10. Cross-References
- [Relationship](#relationship) — prerequisite
- [Transformation](#transformation) — depends on Constraint
- [Verification Framework](./Atlas-08-Frameworks.md)
- [Governance Framework](./Atlas-08-Frameworks.md)

---

## Transformation

### 1. Canonical Definition
The constitutional primitive that answers "How does it change?" — the governed mechanism for constitutional evolution.

### 2. Constitutional Origin
Derived from Constraint. Transformation arises from the constitutional need for change — controlled, governed, verifiable change within established rules.

### 3. Operational Meaning
Transformation is what makes ICore a living constitution rather than a dead document. It provides the mechanism for growth without sacrificing stability. Every change is governed, verified, and traceable.

### 4. Derivation Path
```
Existence → Identity → Relationship → Constraint → Transformation (USCP primitive #5)
```

### 5. Dependencies
- Constraint (transformations must operate within established rules)

### 6. Constraints (self-referential)
- Every Transformation must leave a trace (traceability)
- Four types: State Change, Structural Change, Relational Change, Constitutional Change
- Constitutional Change requires the full governance pipeline
- Transformations cannot violate existing Constraints

### 7. Verification Criteria
- Every Transformation is logged with before/after state
- Transformation is reversible or its irreversibility is justified
- No Constraint is violated by the Transformation

### 8. Governance Status
**Constitutional.** State and Structural Changes follow standard governance. Constitutional Changes require the full 6-stage pipeline.

### 9. Reference Implementations
- Part IV — Governance Pipeline (operationalizes Constitutional Change)
- State machine models (through UCM)
- Version control (Git, Fossil through UCA)

### 10. Cross-References
- [Constraint](#constraint) — prerequisite
- [Verification](#verification) — depends on Transformation
- [Governance Framework](./Atlas-08-Frameworks.md)
- [Lifecycle (if implemented)](./Atlas-06-Execution.md)

---

## Verification

### 1. Canonical Definition
The constitutional primitive that answers "How do we know it is valid?" — the mechanisms by which constitutional claims are checked, validated, and confirmed.

### 2. Constitutional Origin
Derived from Transformation. Verification arises from the constitutional need for certainty — proof, not just assertion, that the system is correct.

### 3. Operational Meaning
Verification is what makes ICore trustworthy. Without it, all other primitives are assertions — claims without proof. Verification transforms claims into facts, assertions into guarantees, trust into verifiable trust.

### 4. Derivation Path
```
Existence → Identity → Relationship → Constraint → Transformation → Verification (USCP primitive #6)
```

### 5. Dependencies
- Transformation (verification checks that transformations are valid)

### 6. Constraints
- Every verification question must have a clear answer: pass or fail (decidability)
- Four types: Structural, Behavioral, Provenance, Consistency
- Verification is not optional — it is a first-class primitive
- Verification operates at every layer of the system

### 7. Verification Criteria (self-referential)
- The verification primitive verifies itself through the 10-test framework (Part III)
- Independent parties can reproduce verification using only the constitutional stack
- Verification results are permanent constitutional artifacts

### 8. Governance Status
**Constitutional.** Verification criteria changes require Part IV full pipeline. New verification methods can be added through Extension.

### 9. Reference Implementations
- Part III — Verification Framework (10 constitutional tests)
- SHA-256 hashing (provenance verification)
- Bitcoin timestamping (temporal verification)
- GPG signatures (identity verification)

### 10. Cross-References
- [Transformation](#transformation) — prerequisite
- [Verification Framework](./Atlas-08-Frameworks.md) — operationalization
- [Standards Alignment](./Atlas-08-Frameworks.md) — W3C provenance standards
- [Self-Verification Report](../CONSTITUTIONAL-SELF-VERIFICATION.md)

---

## The Six Together

| Primitive | Question | Prerequisite | Verified By |
|-----------|----------|-------------|-------------|
| Existence | What is? | Principles | Boundary assertion |
| Identity | Who/what is it? | Existence | Unique identification |
| Relationship | How is it connected? | Identity | Graph integrity |
| Constraint | What governs it? | Relationship | Rule enforcement |
| Transformation | How does it change? | Constraint | Trace logging |
| Verification | How do we know it is valid? | Transformation | 10-test framework |

**Together, they are proposed as the smallest complete constitutional foundation. Every future addition must either be constitutionally derived from them or demonstrate that the foundation is incomplete.**

---

*USCP is the irreducible core. USC — the Constitution — is derived from these six primitives. Everything above is constitutionally derived.*
