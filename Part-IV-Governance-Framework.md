# ICore.Gate — Minimal Constitutional Kernel v1.0

## Part IV — Constitutional Governance Framework

Minimal governance. Maximum accountability. Zero bureaucracy.

---

### The Governance Pipeline

Every constitutional change follows one path:

```
Proposal → Review → Verification → Ratification → Publication → Derivation
```

| Stage | Action | Gate |
|-------|--------|------|
| **Proposal** | Author states the change, classifies it (Constitutional / Architectural / Implementation), and declares its derivation source. | Self-audit (Part III) completed. |
| **Review** | Second party validates derivation, checks Part III tests, and challenges assumptions. | No unresolved objections. |
| **Verification** | Independent replication of Part III audit. Evidence recorded. | 10/10 test pass or conditional fix committed. |
| **Ratification** | Constitutional authority approves entry. One signature. | Authority confirms derivation integrity. |
| **Publication** | Change enters the canonical constitutional record with timestamp, author, derivation chain, and test results. | Record is immutable once published. |
| **Derivation** | Downstream layers update to reflect the change. Each affected layer re-validates its own derivation. | No broken derivation chains. |

**ICore.Gate is the proving ground.** Proposals enter Gate at Proposal stage. Only after passing through all six stages does knowledge graduate into ICore.

---

### Authority Model

| Role | Scope | Limit |
|------|-------|-------|
| **Proposer** | Any participant may propose. | Cannot self-ratify. |
| **Reviewer** | Any participant may review. | Cannot ratify their own review. |
| **Verifier** | Any participant may verify. | Must be independent of proposer and reviewer. |
| **Ratifier** | One designated constitutional authority. | Cannot propose or review in the same cycle. |

**Four-role separation.** No single person holds more than one role in any given proposal cycle. This prevents both authoritarian capture and committee paralysis.

---

### Amendment Types

| Type | Scope | Speed | Example |
|------|-------|-------|---------|
| **Clarification** | Rephrases existing text without changing meaning. | Fast-track: Proposal → Verification → Publication (skip Review and Ratification if no objections within 48h). | Fixing ambiguous language in a UCL definition. |
| **Extension** | Adds a new element to an existing layer. | Standard pipeline (all 6 stages). | Adding a new UCA adapter specification. |
| **Modification** | Changes the meaning or behavior of an existing element. | Standard pipeline + mandatory impact analysis on all dependent layers. | Redefining what UCE classifies as "knowable." |
| **Deprecation** | Marks an element for eventual removal. | Standard pipeline. Element enters dormancy (no new derivations, existing derivations continue). | Retiring a UCD derivative that has been superseded. |
| **Removal** | Deletes an element from the kernel. | Standard pipeline + proof that no active derivation depends on it. | Removing a redundant UCRS reference type. |

---

### Conflict Resolution

When two constitutional principles appear to conflict:

**Step 1 — Derivation check.** Trace both claims to their lowest common ancestor in the derivation graph (Part II). The claim rooted closer to USCP prevails.

**Step 2 — If rooted at the same layer**, apply the Constitutional Doctrine priority order from the bootstrap prompt:

```
Reality > Constitution > Meaning > Verification > Provenance > Sovereignty > Simplicity > Capability > Optimization > Necessity
```

The higher-priority principle wins. If both rank equally, the more specific claim prevails over the more general.

**Step 3 — If still unresolved**, the conflict is elevated to the Ratifier with a written analysis of both positions. The Ratifier decides, and the decision enters the constitutional record with full reasoning.

---

### Graduation: ICore.Gate → ICore

An element graduates from Gate to ICore when it satisfies all five criteria:

1. **Validated.** Passed all 10 Part III tests in at least one full verification cycle.
2. **Stable.** No modification or deprecation proposals in the last 90 days.
3. **Depended on.** At least one downstream element (UCD, implementation, or Studio component) derives from it.
4. **Reviewed.** Independently reviewed by at least two parties uninvolved in its creation.
5. **Ratified.** Formally approved by the constitutional authority.

**Graduation is permanent.** Once in ICore, an element can only be modified through the full governance pipeline. There is no fast-track removal.

---

### Emergency Provisions

**Constitutional suspension.** If a published element is discovered to be fundamentally broken (contradicts Reality, introduces a sovereignty violation, or causes cascade failures), the Ratifier may issue a **constitutional suspension** — immediate removal from active derivation pending a full review within 30 days.

Suspension is the only action that bypasses the standard pipeline. It requires written justification and is recorded as a permanent constitutional artifact.

---

*Governance is the immune system of the constitution. It must be strong enough to prevent infection, fast enough to respond to threats, and minimal enough to never become the disease itself.*
