# USDS Formal Specification v0.1.0

*The universal formalization of sovereign distribution — how constitutional software is packaged, signed, versioned, distributed, verified, and revoked while preserving chain-of-custody integrity and sovereign control.*

---

## Preamble

This document is the **formal specification** of the Universal Sovereign Distribution System (USDS) — the constitutional distribution layer that ensures software produced by the ICore ecosystem reaches recipients with verified authenticity, integrity, and provenance. USDS answers the question every distribution system must answer before it can deliver: **How is constitutional software distributed sovereignly?**

USDS sits as a cross-cutting concern across the ICore stack. Where UWA defines *what exists* and UCN defines *how nodes communicate*, USDS defines *how constitutional artifacts flow between originators and recipients* — through any channel, across any distance, without surrendering sovereignty at any point.

The v0.1.0 specification is technology-independent. It does not specify package managers, transport protocols, or cryptographic implementations. It specifies the **formal semantics** that any conforming distribution system must satisfy.

**Classification:** Constitutional — defines the distribution model for all of ICore.

**Derivation:**
```
Originator (produces package) → USDS (distribution model) → Recipient (receives & verifies)
```

**Depends on:** Reference Systems (communication, data, and computation systems provide the substrate for distribution). Transitively, USDS depends on the entire constitutional stack — a package must answer all six constitutional questions.

**Depended on by:** Studyo (visualizes distribution channels and chain of custody), UCA (adapters bridge distribution to external package systems), ICS (canonical source for published packages).

---

## Section 1: Foundational Axioms

Every distribution capability must trace to these axioms. Nothing exists in USDS that these axioms do not authorize.

### 1.1 The Ten Distribution Axioms

| # | Axiom | Statement | Derived From |
|---|-------|-----------|-------------|
| DA01 | **Distribution preserves constitutional origin.** | Every distributed artifact carries verifiable proof of its constitutional origin. Distribution never strips, obscures, or makes ambiguous where a package came from. Origin is a constitutional property, not metadata. | Origin (USCP) |
| DA02 | **Integrity is cryptographically enforced.** | Every distributed artifact is bound to its content through cryptographic hashing. Any modification to content — however small — is detectable by any recipient. Integrity is not a policy; it is a mathematical guarantee. | Constraint (USCP) |
| DA03 | **No single authority controls distribution.** | No single entity — not the originator, not the distributor, not the recipient — can unilaterally control what is distributed, to whom, or through which channel. Distribution is a sovereign federation, not a hierarchy. | Identity (USCP) |
| DA04 | **Every distribution event is recorded.** | The chain of custody is an immutable, append-only record of every distribution event: creation, signing, transfer, receipt, and verification. The record is complete, ordered, and tamper-evident. | Transformation (USCP) |
| DA05 | **Recipients verify, never trust.** | No recipient accepts a package based on channel reputation, source relationship, or implicit trust. Every recipient independently verifies authenticity, integrity, and chain of custody before accepting. Verification is sovereign duty, not optional courtesy. | Verification (USCP) |
| DA06 | **Distribution channels are sovereign and interchangeable.** | Constitutional software may be distributed through any channel — peer-to-peer, local filesystem, content network, or future transport. No channel is privileged. The verification protocol is channel-independent. | Relationship (USCP) |
| DA07 | **Compromised packages are identifiable and excludable.** | When a package's integrity, origin, or chain of custody is violated, the system provides mechanisms to identify the compromise and exclude the affected artifact from further distribution. Revocation is immediate and propagation is required. | Constraint (USCP) |
| DA08 | **Versioning encodes constitutional compatibility.** | Package versions encode not only functional changes but constitutional compatibility: which constitutional questions the package answers, which invariants it upholds, and which prior versions it supersedes. Versioning is semantic and constitutional. | Existence (USCP) |
| DA09 | **Distribution is channel-agnostic.** | The formal properties of a distributed artifact — authenticity, integrity, provenance, version compatibility — are invariant across all distribution channels. A package verified on channel A is equally valid on channel B. Channel is incidental; property is constitutive. | Existence (USCP) |
| DA10 | **Attestation is constitutionally binding.** | When an originator signs a package, the signature constitutes a constitutional attestation: "I produced this, I stand behind its integrity, and I attest to its constitutional provenance." Attestation carries legal and constitutional weight within the ICore ecosystem. | Verification (USCP) |

### 1.2 Axiom Sufficiency

All six USCP primitives are represented across the axioms:

| Primitive | Present In | Role |
|-----------|-----------|------|
| Existence | DA08 (constitutional versioning), DA09 (channel-agnostic properties) | Packages exist as versioned, channel-independent constitutional artifacts |
| Identity | DA03 (no single authority) | Distribution authority is distributed, not centralized |
| Relationship | DA06 (sovereign channels) | Channels are voluntary, interchangeable relationships |
| Constraint | DA02 (cryptographic integrity), DA07 (revocation) | Integrity is enforced mathematically; compromises are excluded |
| Transformation | DA04 (chain of custody) | Every distribution event transforms the custody record |
| Verification | DA05 (recipient verification), DA10 (attestation) | Verification is sovereign; attestation is binding |

The foundation is complete. The six primitives are fully represented.

---

## Section 2: Definitions

| Term | Definition |
|------|-----------|
| **Package** | A constitutionally identified, versioned, signed, and self-describing unit of software distribution. A package is the atomic unit of distribution — it cannot be partially distributed or partially verified. |
| **Content** | The actual software artifacts within a package: source code, binaries, configuration, documentation, or any other data that constitutes the distributed software. |
| **Manifest** | The machine-readable metadata describing a package: its identity, version, contents, dependencies, constitutional properties, and distribution instructions. |
| **Signature** | A cryptographic proof binding an originator's identity to a specific package content and manifest. A signature proves origin, integrity, and authorship. |
| **Attestation** | A signed declaration by an originator or verifier that a package satisfies specified constitutional properties. Attestation is binding and revocable. |
| **Originator** | The constitutional entity that produces a package. The originator is the initial signer and the primary authority on the package's provenance. |
| **Recipient** | A constitutional entity that receives, verifies, and optionally installs a package. Recipients are sovereign — they verify independently and accept or reject based on their own policies. |
| **Distributor** | Any entity that facilitates the transfer of packages from originators to recipients. Distributors are untrusted intermediaries — they carry packages but cannot alter, substitute, or suppress them without detection. |
| **Chain of Custody** | The complete, ordered, immutable record of every distribution event from package creation to recipient verification. The chain of custody is the constitutional provenance of a package. |
| **Distribution Event** | An atomic record of a distribution action: creation, signing, transfer, receipt, verification, or revocation. Each event is timestamped, signed, and linked to its predecessor. |
| **Distribution Channel** | The mechanism by which a package is transferred from one entity to another. Channels may be sovereign (P2P, local), hybrid (CDN-backed), or external (bridged through UCA). |
| **Revocation** | The constitutional act of declaring a package compromised, unsafe, or withdrawn. Revocation is signed by the originator or a constitutional authority and propagates through the distribution network. |
| **Compatibility** | The constitutional relationship between two package versions: whether a newer version can replace an older one without breaking constitutional guarantees. |
| **Trust Anchor** | An originator whose signing key has been verified through an unbroken cryptographic chain to a known constitutional origin. Trust anchors are the root of distribution trust. |

---

## Section 3: The Package Model

### 3.1 Specification

A USDS package is a constitutionally complete unit of distribution. It is the intersection of four inseparable aspects: content, metadata, signature, and attestation.

| Property | Requirement |
|----------|------------|
| **Record** | `Package { manifest, content_archive, signature, attestation_chain }` |
| **Operations** | `create(manifest, content) → Package`, `verify(package) → VerificationResult`, `extract(package) → Content` |
| **Atomicity** | A package is either fully distributed and fully verifiable, or not distributed at all. Partial packages are constitutionally void. |
| **Self-description** | A package contains sufficient metadata to verify its own authenticity without external state. |

### 3.2 The Four Inseparable Aspects

```
┌──────────────────────────────────────────────────────────────┐
│                         PACKAGE                               │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Content   │  │   Manifest   │  │    Signature      │  │
│  │  (software) │  │  (metadata)  │  │ (cryptographic    │  │
│  │             │  │              │  │  proof of origin) │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Attestation Chain                        │   │
│  │  (constitutional guarantees, one or more signers)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Content Hash: SHA-256(content_archive)     │   │
│  │           Binds all four aspects together             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Package Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| PK1 | **Four aspects are inseparable** | A package without content, manifest, signature, or attestation is not a package — it is an incomplete artifact. All four must be present and valid. |
| PK2 | **Content-addressed identity** | A package's content hash uniquely identifies its content. Two packages with different content hashes are different packages, even if all metadata is identical. |
| PK3 | **Signature binds content to originator** | The package signature covers both the content hash and the manifest hash. A valid signature proves that a specific originator produced a specific content with specific metadata. |
| PK4 | **Packages are immutable** | Once created and signed, a package cannot be modified. Any modification invalidates the signature and requires re-creation as a new version. |
| PK5 | **Self-verifying** | A recipient can verify a package's authenticity and integrity using only the package itself (and trusted public keys). No external database, certificate authority, or channel state is required. |

---

## Section 4: The Signature Model

### 4.1 Specification

A USDS signature is the cryptographic binding between an originator's identity and a specific package. Signatures prove three properties simultaneously: origin (who produced it), integrity (it has not been tampered with), and authorship (the signer stands behind it).

| Property | Requirement |
|----------|------------|
| **Record** | `Signature { signer_id, public_key_ref, content_hash, manifest_hash, timestamp, signature_value, algorithm }` |
| **Operations** | `sign(signer_key, package) → Signature`, `verify(signature, package) → bool`, `verify_chain(signature_chain) → bool` |
| **Coverage** | A signature must cover both the content hash and the manifest hash. A signature covering only one is constitutionally incomplete. |
| **Algorithm** | The signature algorithm must be a well-established public-key scheme (e.g., Ed25519, ECDSA-P256, RSA-PSS). Algorithm selection is an implementation choice; the formal model is algorithm-agnostic. |

### 4.2 Signature Structure

```
Signature:
  ├── signer_id: OriginatorId          // who signed
  ├── public_key_ref: KeyReference     // which key was used (hash or identifier)
  ├── content_hash: SHA-256(content)   // integrity of the software
  ├── manifest_hash: SHA-256(manifest) // integrity of the metadata
  ├── timestamp: ISO-8601-UTC          // when it was signed
  ├── algorithm: String                // e.g., "ed25519", "ecdsa-p256"
  ├── key_created: ISO-8601-UTC        // when the signing key was created
  └── signature_value: bytes           // the cryptographic signature
```

### 4.3 Multi-Originator Signatures

A package may carry signatures from multiple originators. This supports:

- **Co-signing:** Multiple parties jointly attest to a package's provenance
- **Review signing:** A reviewer attests to having verified the package
- **Authority signing:** A constitutional authority endorses the package

```
SignatureChain:
  ├── primary: Signature               // originator's signature (required)
  ├── cosigners: [Signature]           // additional signers (optional)
  └── chain_valid: bool                // derived: all signatures verify
```

### 4.4 Signature Verification Protocol

```
┌──────────────┐                           ┌──────────────┐
│   Package    │                           │   Recipient  │
│  (received)  │                           │  (verifier)  │
└──────┬───────┘                           └──────┬───────┘
       │                                          │
       │  1. Extract manifest, content, signature │
       │─────────────────────────────────────────►│
       │                                          │
       │  2. Recompute content_hash               │
       │  3. Recompute manifest_hash              │
       │  4. Compare with signed hashes           │
       │     (mismatch = integrity violation)     │
       │                                          │
       │  5. Verify signature_value               │
       │     using signer's public_key            │
       │     (invalid = forgery)                  │
       │                                          │
       │  6. Check signer_id against              │
       │     trusted key registry                 │
       │     (unknown = untrusted origin)         │
       │                                          │
       │  7. Verify chain_of_custody              │
       │     (broken chain = custody violation)   │
       │                                          │
       │  Result: PASS | FAIL (with reason)       │
       │◄─────────────────────────────────────────│
```

### 4.5 Signature Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| SG1 | **Dual coverage** | A valid signature must cover both content_hash and manifest_hash. Signatures covering only one are constitutionally invalid. |
| SG2 | **Origin binding** | A signature cryptographically binds the signer's identity to the package. Forging a signature requires breaking the underlying cryptographic scheme. |
| SG3 | **Temporal binding** | A signature includes a timestamp. Packages signed with expired or future keys are flagged for review but not automatically rejected. |
| SG4 | **Chain integrity** | In a multi-signer package, every signature in the chain must independently verify. One invalid signature invalidates the entire chain. |
| SG5 | **Signature immutability** | A signature cannot be transferred between packages. The signed content and manifest hashes make signatures package-specific. |

---

## Section 5: Chain of Custody

### 5.1 Specification

The chain of custody is the constitutional provenance of a package. It is an immutable, append-only log of every distribution event from creation through every transfer, receipt, verification, and revocation. The chain of custody answers: "Who had this package, when, and what did they do with it?"

| Property | Requirement |
|----------|------------|
| **Record** | `ChainOfCustody { package_id, events: [DistributionEvent], chain_hash }` |
| **Operations** | `create_chain(package) → ChainOfCustody`, `append_event(chain, event) → ChainOfCustody`, `verify_chain(chain) → bool`, `audit(chain) → AuditReport` |
| **Append-only** | Events can only be appended, never removed or modified. The chain is monotonically growing. |
| **Tamper-evident** | Each event includes a hash of the previous event, forming a hash chain. Any modification to a past event invalidates all subsequent hashes. |

### 5.2 Distribution Event Types

| Event Type | Purpose | Required Fields |
|-----------|---------|-----------------|
| `Created` | Package was created and initially signed | originator_id, manifest_hash, content_hash, timestamp |
| `Signed` | An additional signature was applied | signer_id, public_key_ref, timestamp |
| `Transferred` | Package was sent from one entity to another | sender_id, recipient_id (may be unknown), channel, timestamp |
| `Received` | Recipient acknowledges receipt | recipient_id, receipt_hash, timestamp |
| `Verified` | Package was independently verified | verifier_id, verification_result, timestamp |
| `Revoked` | Package was declared compromised | revoker_id, reason, timestamp |
| `Superseded` | Package was replaced by a newer version | superseded_by_package_id, timestamp |

### 5.3 Event Structure

```
DistributionEvent:
  ├── event_id: UUID                          // unique event identifier
  ├── event_type: EventType                   // one of the seven types
  ├── package_id: PackageId                   // which package
  ├── actor_id: EntityId                      // who performed the action
  ├── timestamp: ISO-8601-UTC                 // when it occurred
  ├── previous_event_hash: SHA-256 | null     // hash of prior event (null for first)
  ├── event_hash: SHA-256(event_body)         // hash of this event (excludes this field)
  ├── metadata: Map<String, String>           // type-specific additional data
  └── signature: SignableValue                // actor's signature over event_body
```

### 5.4 Chain Verification Protocol

```
verify_chain(chain):
  1. FOR each event in chain.events (in order):
     a. Verify event.signature is valid for event.actor_id
     b. Verify event.previous_event_hash matches hash of prior event
     c. Verify event.event_hash is correctly computed
     d. Verify event.timestamp is monotonic (non-decreasing)
  2. Verify chain.chain_hash == SHA-256( concatenated event_hashes )
  3. IF any step fails → chain is INVALID
     ELSE → chain is VALID
```

### 5.5 Chain of Custody Diagram

```
Created          Transferred       Received          Verified
┌──────────┐    ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Event #1 │───►│ Event #2 │────►│ Event #3 │────►│ Event #4 │
│          │    │          │     │          │     │          │
│ hash: h1 │    │ hash: h2 │     │ hash: h3 │     │ hash: h4 │
│ prev: ∅  │    │ prev: h1 │     │ prev: h2 │     │ prev: h3 │
└──────────┘    └──────────┘     └──────────┘     └──────────┘

chain_hash = SHA-256(h1 || h2 || h3 || h4)
```

### 5.6 Chain of Custody Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| CC1 | **Append-only immutability** | Events can only be appended to the chain. No event may be removed, modified, or reordered after recording. |
| CC2 | **Hash-chain integrity** | Each event hashes its predecessor. Tampering with any event invalidates all subsequent events in the chain. |
| CC3 | **Complete recording** | Every distribution event must be recorded. A package without a complete chain of custody is constitutionally suspect. |
| CC4 | **Actor accountability** | Every event is signed by its actor. Anonymous events are constitutionally void — the chain must always answer "who did this." |
| CC5 | **Temporal ordering** | Events are ordered by timestamp. Clock skew is tolerated within configurable bounds; temporal inversions are flagged. |

---

## Section 6: Version Compatibility

### 6.1 Specification

USDS versioning extends semantic versioning with constitutional compatibility rules. A version number encodes not only functional change magnitude but constitutional compatibility: can this package safely replace a prior version without breaking constitutional guarantees?

| Property | Requirement |
|----------|------------|
| **Format** | `MAJOR.MINOR.PATCH` — three non-negative integers separated by dots |
| **Record** | `VersionInfo { major, minor, patch, constitutional_layer, compatibility_matrix }` |
| **Operations** | `bump_major(version) → Version`, `bump_minor(version) → Version`, `bump_patch(version) → Version`, `is_compatible(old, new) → bool` |

### 6.2 Semantic Rules

| Change Type | Version Impact | Constitutional Meaning |
|-------------|---------------|----------------------|
| **Patch** | PATCH + 1 | Bug fix, documentation update, non-functional change. No constitutional property changes. Safe drop-in replacement. |
| **Minor** | MINOR + 1, PATCH = 0 | New functionality added. Constitutional guarantees preserved and extended. Backward-compatible. |
| **Major** | MAJOR + 1, MINOR = 0, PATCH = 0 | Constitutional property changed, interface broken, or dependency graph altered. Not a drop-in replacement. Migration may be required. |

### 6.3 Constitutional Compatibility Rules

| Rule | Statement |
|------|-----------|
| CR1 | **Major versions are incompatible by default.** Two packages with different major versions are constitutionally incompatible unless an explicit compatibility declaration states otherwise. |
| CR2 | **Minor versions are compatible.** A higher minor version is always backward-compatible with a lower minor version of the same major version. |
| CR3 | **Patch versions are interchangeable.** Any patch version is a safe replacement for any other patch version of the same major.minor. |
| CR4 | **Cross-originator compatibility requires declaration.** When two different originators produce packages for the same constitutional question, compatibility must be explicitly declared, never assumed. |
| CR5 | **Constitutional layer compatibility.** Packages targeting different constitutional layers (e.g., L4 vs L5) are incompatible regardless of semver numbers. |

### 6.4 Version Compatibility Matrix

```
Package A (v2.1.3)          Package B
─────────────────           ─────────
  v2.1.4  ─── PATCH ────── Compatible (drop-in)
  v2.1.9  ─── PATCH ────── Compatible (drop-in)
  v2.2.0  ─── MINOR ────── Compatible (extends, preserves)
  v2.5.1  ─── MINOR ────── Compatible (extends, preserves)
  v3.0.0  ─── MAJOR ────── Incompatible (unless declared)
  v1.9.9  ─── MAJOR ────── Incompatible (unless declared)
```

### 6.5 Version Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| VR1 | **Monotonic progression** | Version numbers are monotonically increasing. A package can never regress to a lower version number. |
| VR2 | **Constitutional encoding** | Version numbers encode constitutional compatibility. The version system is not merely functional — it is constitutional. |
| VR3 | **Compatibility is explicit** | Compatibility between packages of different major versions or different originators must be declared, never inferred. |
| VR4 | **Version in signature** | The package version is covered by the signature. A signature valid for v2.1.3 does not validate v2.1.4 — they are distinct signed artifacts. |
| VR5 | **Supersession is recorded** | When a newer version supersedes an older one, the supersession is recorded in both packages' chains of custody. |

---

## Section 7: Distribution Channels

### 7.1 Specification

Constitutional software may be distributed through any channel. USDS classifies channels by their trust properties, not their technical implementation. The formal model is channel-agnostic: the same verification protocol applies regardless of how a package was delivered.

| Channel Class | Description | Trust Properties |
|--------------|-------------|-----------------|
| **Sovereign** | Direct transfer between known constitutional entities (P2P, local filesystem, USB, air-gapped) | Full provenance — sender and receiver are known, authenticated, and verifiable |
| **Hybrid** | CDN-backed, mirror networks, or repository aggregators with constitutional verification layer | Carrier-neutral — the channel carries packages but does not authenticate origin; recipients verify independently |
| **External** | Bridged to non-constitutional systems through UCA adapters (e.g., npm, PyPI, Docker Hub) | Untrusted carrier — no constitutional guarantees from the channel; full recipient verification required |

### 7.2 Channel Trust Properties

```
                    Trust Level
                    ───────────
Sovereign:          ██████████████████████  (Known parties, full provenance)
Hybrid:             ████████████░░░░░░░░░░  (Carrier-neutral, verified independently)
External:           ██████░░░░░░░░░░░░░░░░  (Untrusted carrier, full verification)

In all cases: Verification protocol is IDENTICAL
              The channel does not change the package's constitutional properties
```

### 7.3 Channel Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| CH1 | **Channel independence** | A package's constitutional properties are invariant across channels. A verified package on channel A is equally valid on channel B. |
| CH2 | **No channel is privileged** | No distribution channel has constitutional authority over any other. Sovereignty is not determined by channel choice. |
| CH3 | **External channels are untrusted** | Packages received through external (bridged) channels must undergo full recipient verification. The bridge provides no constitutional guarantee. |
| CH4 | **Channel records custody** | Each channel records its distribution events in the chain of custody. The chain of custody is complete regardless of channel diversity. |
| CH5 | **Sovereign channels preferred** | While all channels are valid, sovereign channels provide the highest provenance guarantees and are preferred for constitutional distribution. |

---

## Section 8: Verification Protocol

### 8.1 Specification

Verification is the constitutional process by which a recipient determines whether to accept a package. Verification is sovereign duty — recipients verify independently, regardless of channel, source reputation, or distribution path.

| Property | Requirement |
|----------|------------|
| **Operations** | `verify_package(package, trust_store) → VerificationResult`, `verify_full(package, trust_store, custody_chain) → FullVerificationResult` |
| **Output** | `VerificationResult { authentic, integrity_valid, custody_valid, revoked, compatible, details }` |
| **Mandatory** | A recipient MUST NOT install or execute a package that has not passed full verification. This is a constitutional requirement, not a recommendation. |

### 8.2 Verification Stages

Every package must pass through the following stages in order. Failure at any stage is terminal for that verification attempt.

| Stage | Check | Failure Meaning |
|-------|-------|----------------|
| **1. Structural** | Package has all four aspects: content, manifest, signature, attestation | Incomplete or malformed package |
| **2. Integrity** | Recomputed content_hash matches signed content_hash | Content has been modified |
| **3. Integrity** | Recomputed manifest_hash matches signed manifest_hash | Metadata has been modified |
| **4. Authenticity** | Signature is cryptographically valid for declared signer | Forgery or corruption |
| **5. Trust** | Signer's identity is in recipient's trusted key registry | Untrusted origin |
| **6. Revocation** | Package is not on the recipient's revocation list | Package is compromised |
| **7. Chain of Custody** | Chain is complete, hash-linked, and all events verify | Custody breach detected |
| **8. Compatibility** | Package version is compatible with recipient's requirements | Version mismatch |
| **9. Attestation** | Attestation claims are verifiable and acceptable | Unacceptable claims |

### 8.3 Verification Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  RECIPIENT VERIFICATION                       │
│                                                               │
│  Package received via any channel                             │
│          │                                                    │
│          ▼                                                    │
│  ┌─────────────────┐   FAIL → REJECT (incomplete)           │
│  │ 1. Structural   │                                         │
│  │    Check        │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (integrity violation)  │
│  │ 2. Integrity    │                                         │
│  │    Verification │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (forgery)              │
│  │ 3. Signature    │                                         │
│  │    Verification │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (untrusted origin)     │
│  │ 4. Trust Chain  │                                         │
│  │    Verification │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (revoked)              │
│  │ 5. Revocation   │                                         │
│  │    Check        │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (custody breach)       │
│  │ 6. Chain of     │                                         │
│  │    Custody      │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (incompatible)         │
│  │ 7. Compatibility│                                         │
│  │    Check        │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│  ┌─────────────────┐   FAIL → REJECT (unacceptable claims)  │
│  │ 8. Attestation  │                                         │
│  │    Validation   │                                         │
│  └────────┬────────┘                                         │
│           │ PASS                                              │
│           ▼                                                   │
│     ✅ ACCEPTED                                               │
│     Record verification event in custody chain                │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Verification Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| VF1 | **Verification is mandatory** | No package may be accepted without passing all verification stages. Skipping any stage is a constitutional violation. |
| VF2 | **Verification is sovereign** | Each recipient verifies independently. No recipient delegates verification to another entity or to the channel. |
| VF3 | **Verification is deterministic** | The same package and the same trust store always produce the same verification result. Verification is a pure function. |
| VF4 | **Failure is terminal** | Failure at any verification stage rejects the package. Partial verification does not produce a partial acceptance. |
| VF5 | **Verification is recorded** | Every verification attempt — pass or fail — is recorded. Successful verifications are appended to the chain of custody. |

---

## Section 9: Revocation

### 9.1 Specification

Revocation is the constitutional mechanism for identifying compromised packages and excluding them from distribution. Revocation is signed, immediate, and propagating — once a package is revoked, all recipients must reject it.

| Property | Requirement |
|----------|------------|
| **Record** | `Revocation { package_id, revoker_id, reason, timestamp, signature, propagation_proof }` |
| **Operations** | `revoke(package, authority, reason) → Revocation`, `is_revoked(package_id, revocation_store) → bool`, `propagate(revocation, channel) → PropagationResult` |
| **Authority** | Only the package's originator or a designated constitutional authority may revoke a package |
| **Immediacy** | Revocation takes effect immediately upon publication. Grace periods are not permitted for security revocations. |

### 9.2 Revocation Reasons

| Reason Code | Category | Description |
|------------|----------|-------------|
| `INTEGRITY_VIOLATION` | Security | Content or manifest was modified after signing |
| `KEY_COMPROMISE` | Security | The originator's signing key was compromised |
| `SUPPLANT` | Governance | A newer version intentionally replaces this one |
| `VULNERABILITY` | Security | A known vulnerability exists in this version |
| `RECALLED` | Governance | The originator withdrew the package for non-security reasons |
| `CONSTITUTIONAL_VIOLATION` | Constitutional | The package violates a constitutional invariant |

### 9.3 Revocation Propagation

```
Originator/Authority
       │
       │  1. Sign revocation record
       │  2. Publish to revocation list
       │
       ▼
┌──────────────────┐
│ Revocation Store │ ◄── Append-only, signed revocations
│ (distributed)    │
└────────┬─────────┘
         │
    ┌────┴────┬────────┬──────────┐
    ▼         ▼        ▼          ▼
 Recipient  Recipient  CDN    External
 Alpha      Beta    Mirror    Bridge
    │         │        │          │
    ▼         ▼        ▼          ▼
 Check      Check   Check     Check
 revocation revocation revocation revocation
 before     before   before   before
 accept     accept   serve    bridge
```

### 9.4 Revocation Axioms

| # | Axiom | Statement |
|---|-------|-----------|
| RV1 | **Revocation is immediate** | A revoked package must be rejected from the moment of publication. No grace period. |
| RV2 | **Revocation is signed** | Every revocation is cryptographically signed by the revoking authority. Unsigned revocations are void. |
| RV3 | **Revocation propagates** | Every distribution channel and recipient must check the revocation list before accepting or serving a package. |
| RV4 | **Revocation is append-only** | Revocation records are never removed. A package may be un-revoked only by a signed retraction that itself becomes a new custody event. |
| RV5 | **Revocation is specific** | A revocation targets a specific package version. Revoking v2.1.3 does not automatically revoke v2.1.4 or v2.1.2. |
| RV6 | **Revocation authority is bounded** | Only the originator or a designated constitutional authority may revoke. Distributors and recipients cannot unilaterally revoke. |

---

## Section 10: Sovereignty in Distribution

### 10.1 The Sovereignty Principle

Sovereignty is the constitutional foundation of USDS. Distribution is a voluntary act between sovereign entities. No entity is compelled to distribute, to receive, to host, or to verify. The distribution system exists to serve constitutional software delivery — it does not govern, control, or coerce.

### 10.2 Sovereignty Properties

| Property | Statement |
|----------|-----------|
| **Originator Sovereignty** | The originator controls what is published, when, and under what terms. No distributor may publish a package without the originator's signed authorization. |
| **Distributor Sovereignty** | A distributor chooses which packages to carry. A distributor may refuse to carry any package without justification. A distributor is never compelled to serve. |
| **Recipient Sovereignty** | A recipient chooses which packages to accept. A recipient verifies independently, accepts or rejects based on their own policies, and is never obligated to accept. |
| **Channel Sovereignty** | Each channel operates autonomously. No channel is subordinate to another. Channels share packages voluntarily. |
| **No Central Authority** | No single entity controls the distribution network. There is no central server, no master registry, no privileged distributor. Distribution is a federation of sovereign participants. |

### 10.3 Sovereignty Constraints

| # | Constraint | Statement |
|---|-----------|-----------|
| SC1 | **No distribution mandate** | No entity can require another entity to distribute a specific package. Distribution is always voluntary. |
| SC2 | **No suppression authority** | No single entity can suppress a constitutionally valid package from all distribution channels. Distributed distribution provides resilience against suppression. |
| SC3 | **No observation monopoly** | No entity has privileged visibility into the entire distribution network. Each participant sees only what is shared with them. |
| SC4 | **No version mandate** | No entity can compel a recipient to upgrade or downgrade. Version selection is a recipient's sovereign right. |
| SC5 | **Offline capability** | A recipient must be able to verify and use previously-received packages without network connectivity. Distribution enhances capability; it is not a dependency. |

---

## Section 11: Invariants

### 11.1 The Twenty-Two Distribution Invariants

All invariants in this section are **constitutional laws** — not guidelines, not aspirations. A conforming distribution system must satisfy every invariant.

| # | Invariant | Category | Statement |
|---|-----------|----------|-----------|
| DI01 | **Content integrity** | Integrity | Every distributed package maintains a cryptographic hash binding content to signature. Modification is always detectable. |
| DI02 | **Manifest integrity** | Integrity | Every distributed package maintains a cryptographic hash binding manifest to signature. Metadata tampering is always detectable. |
| DI03 | **Signature validity** | Authenticity | Every distributed package carries a valid cryptographic signature from a recognized originator. Unsigned packages are constitutionally void. |
| DI04 | **Chain of custody completeness** | Provenance | Every package carries a complete, unbroken chain of custody from creation to current custody. Gaps are constitutionally invalid. |
| DI05 | **Append-only custody** | Provenance | Distribution events are appended to the chain of custody. No event may be removed or modified after recording. |
| DI06 | **Hash-chain integrity** | Provenance | Each custody event hashes its predecessor. Tampering with any event invalidates all subsequent events. |
| DI07 | **Originator authorization** | Sovereignty | Packages are distributed only with originator authorization. Unauthorized distribution is a constitutional violation. |
| DI08 | **Recipient verification** | Verification | Every recipient independently verifies package authenticity, integrity, and provenance before acceptance. |
| DI09 | **Channel invariance** | Channels | Package constitutional properties are invariant across distribution channels. |
| DI10 | **Revocation immediacy** | Revocation | Revoked packages are rejected from the moment of publication. No grace period applies. |
| DI11 | **Revocation propagation** | Revocation | Revocations propagate to all known distribution channels and recipients. |
| DI12 | **Revocation authorization** | Revocation | Only authorized entities (originators, constitutional authorities) may revoke packages. |
| DI13 | **Version monotonicity** | Versioning | Package version numbers are monotonically increasing. No version regression. |
| DI14 | **Version-encoded compatibility** | Versioning | Version numbers encode constitutional compatibility rules. Major/minor/patch semantics are binding. |
| DI15 | **Signature-content binding** | Authenticity | A signature is bound to a specific content hash and manifest hash. Signatures cannot be transferred between packages. |
| DI16 | **No central control** | Sovereignty | No single entity controls the distribution network. Distribution is a voluntary federation. |
| DI17 | **Offline verification** | Sovereignty | Packages can be verified without network connectivity using previously-received trust anchors and revocation lists. |
| DI18 | **Attestation binding** | Attestation | Package attestations are cryptographically signed and constitutionally binding on the attesting entity. |
| DI19 | **Verification determinism** | Verification | The same package and the same trust store always produce the same verification result. |
| DI20 | **Custody accountability** | Provenance | Every custody event is signed by its actor. Anonymous custody events are constitutionally void. |
| DI21 | **Supersession recording** | Versioning | When a version supersedes another, the supersession is recorded in both packages' chains of custody. |
| DI22 | **Package atomicity** | Integrity | A package is either fully distributed and verifiable, or not distributed at all. Partial packages are void. |

---

## Section 12: Conformance Criteria

### 12.1 USDS Conformance Tests

An implementation conforms to the USDS Formal Specification if and only if:

| # | Test | Pass Criterion | Severity |
|---|------|---------------|----------|
| USDS-01 | **Package Completeness** | Every package contains all four aspects: content, manifest, signature, and attestation. Incomplete packages are rejected. | Critical |
| USDS-02 | **Content Integrity** | Content hash recomputed from received content matches the signed content hash. Any discrepancy is detected and rejected. | Critical |
| USDS-03 | **Manifest Integrity** | Manifest hash recomputed from received manifest matches the signed manifest hash. Any metadata tampering is detected. | Critical |
| USDS-04 | **Signature Verification** | Package signatures are cryptographically verified against the declared signer's public key. Forged or corrupted signatures are rejected. | Critical |
| USDS-05 | **Chain of Custody Validity** | Chain of custody is unbroken: every event hashes its predecessor, every event is signed, and the chain hash is correct. | Critical |
| USDS-06 | **Recipient Verification** | Recipients perform all nine verification stages before accepting. No stage is skipped. Acceptance requires all stages to pass. | Critical |
| USDS-07 | **Revocation Enforcement** | Revoked packages are immediately rejected. Revocation checks occur before acceptance. Revoked packages are never served. | Critical |
| USDS-08 | **Version Semantics** | Version numbers follow MAJOR.MINOR.PATCH with constitutional compatibility semantics. Patch = drop-in, Minor = compatible extension, Major = breaking change. | Major |
| USDS-09 | **Channel Invariance** | A package verified on one channel produces identical verification results on any other channel. Channel does not affect package properties. | Critical |
| USDS-10 | **Sovereignty Preservation** | No operation compels distribution, reception, or acceptance. All participation is voluntary. No central authority controls distribution. | Critical |
| USDS-11 | **Offline Verification** | Packages can be verified without network connectivity using local trust anchors and revocation lists. | Major |
| USDS-12 | **Attestation Binding** | Package attestations are cryptographically signed by the attesting entity. Attestations are constitutionally binding and traceable. | Major |
| USDS-13 | **Append-Only Custody** | Distribution events are appended to the chain of custody. No event is removed, modified, or reordered after recording. | Critical |
| USDS-14 | **Originator Authorization** | Packages distributed only with originator's signed authorization. Unauthorized distribution is detectable and rejected. | Critical |
| USDS-15 | **Dual Signature Coverage** | Every signature covers both content hash and manifest hash. Single-coverage signatures are rejected as constitutionally incomplete. | Critical |

### 12.2 Conformance Levels

| Level | Name | Requirements | Certification |
|-------|------|-------------|--------------|
| **D0** | Non-Conformant | Fails any Critical test. | None. May not claim USDS conformance. |
| **D1** | Core Conformant | Passes all Critical tests (USDS-01 through USDS-07, USDS-09 through USDS-10, USDS-13 through USDS-15) + ≤2 Major failures. | May operate as a constitutional distribution system. |
| **D2** | Fully Conformant | Passes all 15 tests (15/15). | May enter the canonical reference. Eligible for standardization. |

### 12.3 Conformance Protocol

1. **Declare scope:** Implementation declares which distribution aspects it implements (all required for D1+).
2. **Apply tests:** Run all applicable tests (USDS-01 through USDS-15).
3. **Record evidence:** For each test, record what was checked, what was found, pass/fail.
4. **Determine level:** Count Critical and Major failures. Apply level rules.
5. **Archive:** Conformance Record stored as a constitutional artifact.

---

## Section 13: Package Manifest Format

### 13.1 JSON Specification

The package manifest is a JSON document describing the package's identity, contents, dependencies, and constitutional properties. The manifest is signed as part of the package signature.

```json
{
  "usds_manifest_version": "1.0.0",
  "package": {
    "name": "string — human-readable package name",
    "id": "string — content-addressed identifier: SHA-256(name:version:content_hash)",
    "version": {
      "major": "integer — breaking constitutional changes",
      "minor": "integer — compatible extensions",
      "patch": "integer — bug fixes, non-functional"
    },
    "description": "string — human-readable description"
  },
  "originator": {
    "id": "string — constitutional identity of the originator",
    "public_key_ref": "string — reference to the signing key",
    "attestation": "string — originator's constitutional claim"
  },
  "content": {
    "archive_hash": "string — SHA-256 of the content archive",
    "archive_format": "string — e.g., 'tar.gz', 'zip', 'directory'",
    "files": [
      {
        "path": "string — relative path within archive",
        "hash": "string — SHA-256 of individual file",
        "size_bytes": "integer — file size in bytes"
      }
    ],
    "total_size_bytes": "integer — total content size"
  },
  "constitutional": {
    "layer": "string — constitutional layer this package targets (e.g., 'L4', 'L5')",
    "question_answered": "string — which constitutional question this package addresses",
    "invariants_upheld": ["string — list of invariants this package guarantees"],
    "dependencies": [
      {
        "package_id": "string — required package identifier",
        "version_range": "string — semver range (e.g., '>=2.1.0 <3.0.0')",
        "relationship": "string — 'requires', 'enhances', 'replaces'"
      }
    ]
  },
  "distribution": {
    "channels": ["string — preferred distribution channels"],
    "max_mirror_age_hours": "integer — maximum age of mirrors before refresh",
    "revocation_list_url": "string — URL to the canonical revocation list"
  },
  "metadata": {
    "created_at": "string — ISO-8601 timestamp of package creation",
    "created_by": "string — identity of the creating entity",
    "license": "string — package license identifier",
    "tags": ["string — searchable tags"]
  }
}
```

### 13.2 Manifest Invariants

| # | Invariant | Statement |
|---|-----------|-----------|
| MF1 | **Required fields** | All fields in the manifest schema are required. Omission of any field renders the manifest constitutionally incomplete. |
| MF2 | **Deterministic hashing** | The manifest hash is computed over a canonical JSON serialization (sorted keys, no whitespace). Non-canonical serialization invalidates the hash. |
| MF3 | **Content correspondence** | Every file listed in `content.files` must exist in the content archive. Every file in the archive must be listed. No orphaned or missing files. |
| MF4 | **Hash correctness** | Every `content.files[].hash` must match the SHA-256 of the actual file content. Incorrect hashes invalidate the manifest. |

---

## Section 14: Signed Attestation Format

### 14.1 JSON Specification

A signed attestation is a cryptographic declaration by an entity that a package satisfies specific constitutional properties. Attestations are signed, timestamped, and constitutionally binding.

```json
{
  "usds_attestation_version": "1.0.0",
  "attestation": {
    "id": "string — unique attestation identifier",
    "package_id": "string — the package this attestation concerns",
    "package_version": "string — the specific version attested",
    "package_content_hash": "string — SHA-256 of the attested content"
  },
  "attester": {
    "id": "string — constitutional identity of the attester",
    "role": "string — 'originator', 'reviewer', 'authority', 'auditor'",
    "public_key_ref": "string — reference to the attesting key"
  },
  "claims": [
    {
      "claim_type": "string — e.g., 'integrity', 'origin', 'review', 'compliance'",
      "claim_text": "string — human-readable claim statement",
      "evidence": ["string — references to evidence supporting this claim"],
      "constitutional_basis": "string — which constitutional rule or invariant this claim invokes"
    }
  ],
  "timestamp": "string — ISO-8601 UTC timestamp of attestation",
  "valid_until": "string | null — ISO-8601 UTC timestamp of attestation expiry, null for permanent",
  "signature": {
    "algorithm": "string — e.g., 'ed25519', 'ecdsa-p256'",
    "public_key": "string — the attester's public key (or reference)",
    "value": "string — base64-encoded signature over attestation body"
  },
  "revocation": {
    "revoked": false,
    "revoked_at": "string | null — ISO-8601 UTC timestamp if revoked",
    "revocation_reason": "string | null — reason for revocation if applicable"
  }
}
```

### 14.2 Attestation Types

| Claim Type | Purpose | Typical Attester |
|-----------|---------|-----------------|
| `integrity` | "I have verified this package's content matches its manifest" | Reviewer, Auditor |
| `origin` | "I produced this package and stand behind its content" | Originator |
| `review` | "I have reviewed this package and found no issues" | Reviewer |
| `compliance` | "This package satisfies the specified constitutional invariants" | Authority, Auditor |
| `security` | "This package has been audited for security vulnerabilities" | Auditor |
| `dependency` | "This package's dependencies are known and trusted" | Reviewer |

### 14.3 Attestation Invariants

| # | Invariant | Statement |
|---|-----------|-----------|
| AT1 | **Signed attestation** | Every attestation must be cryptographically signed. Unsigned attestations are constitutionally void. |
| AT2 | **Specific binding** | An attestation must reference a specific package_id, version, and content_hash. Generic attestations ("all packages are fine") are void. |
| AT3 | **Role declaration** | Every attestation declares the attester's role. The role determines the weight and scope of the attestation. |
| AT4 | **Temporal scope** | Attestations carry a timestamp and optional expiry. Expired attestations must be re-verified. |
| AT5 | **Revocability** | Any attestation may be revoked by the attesting entity. Revoked attestations must not be used to justify acceptance. |
| AT6 | **Evidence requirement** | Every claim must cite evidence. Attestations without evidence are unsupported opinions, not constitutional artifacts. |

---

## Section 15: Implementation Guide

### 15.1 Building a Conforming Distribution System

This section provides guidance for implementing a distribution system that conforms to the USDS Formal Specification. The guide is organized by architectural layer.

### 15.2 Core Components

```
┌────────────────────────────────────────────────────────────────┐
│              CONFORMING DISTRIBUTION SYSTEM                     │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Package Builder  │    │ Package Verifier  │                  │
│  │                  │    │                   │                  │
│  │ • create_manifest│    │ • verify_struct   │                  │
│  │ • sign_package   │    │ • verify_integrity│                  │
│  │ • build_archive  │    │ • verify_sig      │                  │
│  │ • attest         │    │ • verify_trust    │                  │
│  └──────────────────┘    │ • verify_revoc    │                  │
│                          │ • verify_custody  │                  │
│  ┌──────────────────┐    │ • verify_compat   │                  │
│  │ Custody Manager  │    │ • verify_attest   │                  │
│  │                  │    └──────────────────┘                  │
│  │ • create_chain   │                                          │
│  │ • append_event   │    ┌──────────────────┐                  │
│  │ • verify_chain   │    │ Trust Store       │                  │
│  │ • audit          │    │                   │                  │
│  └──────────────────┘    │ • trusted_keys    │                  │
│                          │ • revocation_list │                  │
│  ┌──────────────────┐    │ • trust_anchors   │                  │
│  │ Channel Adapter  │    └──────────────────┘                  │
│  │                  │                                          │
│  │ • sovereign      │    ┌──────────────────┐                  │
│  │ • hybrid         │    │ Version Manager   │                  │
│  │ • external       │    │                   │                  │
│  └──────────────────┘    │ • resolve_version │                  │
│                          │ • check_compat    │                  │
│                          │ • supersede        │                  │
│                          └──────────────────┘                  │
└────────────────────────────────────────────────────────────────┘
```

### 15.3 Implementation Requirements

| Component | Required Functions | Conformance Tests Satisfied |
|-----------|-------------------|---------------------------|
| **Package Builder** | `create_manifest()`, `sign_package()`, `build_archive()`, `attest()` | USDS-01, USDS-04, USDS-12, USDS-14, USDS-15 |
| **Package Verifier** | `verify_structural()`, `verify_integrity()`, `verify_signature()`, `verify_trust()`, `verify_revocation()`, `verify_custody()`, `verify_compatibility()`, `verify_attestation()` | USDS-02, USDS-03, USDS-04, USDS-06, USDS-09 |
| **Custody Manager** | `create_chain()`, `append_event()`, `verify_chain()`, `audit()` | USDS-05, USDS-13 |
| **Trust Store** | `add_trusted_key()`, `check_trusted()`, `add_revocation()`, `is_revoked()` | USDS-07, USDS-11 |
| **Version Manager** | `resolve_version()`, `check_compatibility()`, `supersede()` | USDS-08 |
| **Channel Adapter** | `publish()`, `fetch()`, `mirror()` | USDS-09, USDS-10 |

### 15.4 Minimum Viable Conforming System

A minimum viable USDS-conforming distribution system requires:

1. **A signing implementation** — any public-key signature scheme (Ed25519 recommended)
2. **A hashing implementation** — SHA-256 for content, manifest, and event hashes
3. **A manifest builder** — generates the JSON manifest per Section 13
4. **A signature builder** — signs content_hash + manifest_hash
5. **A custody log** — append-only log of distribution events
6. **A verifier** — performs all nine verification stages
7. **A trust store** — local registry of trusted keys and revocation list

### 15.5 Implementation Roadmap

| Phase | Deliverable | Conformance Level |
|-------|-------------|-------------------|
| **Phase 1: Package Creation** | Manifest builder, signer, archive builder | Foundation |
| **Phase 2: Verification** | Full 9-stage verifier, trust store | D1 (Core Conformant) |
| **Phase 3: Chain of Custody** | Custody manager, event log, audit | D1 (complete) |
| **Phase 4: Distribution Channels** | Sovereign channel (P2P/local), hybrid (CDN) | D1 (complete) |
| **Phase 5: Revocation** | Revocation store, propagation, external bridges | D2 (Fully Conformant) |
| **Phase 6: Attestation** | Multi-party attestation, review workflows | D2 (complete) |

### 15.6 Technology Recommendations

| Concern | Recommended | Alternatives | Notes |
|---------|------------|-------------|-------|
| **Signature** | Ed25519 | ECDSA-P256, RSA-PSS | Ed25519 is compact, fast, and well-supported |
| **Hashing** | SHA-256 | SHA-3-256, BLAKE3 | SHA-256 is universal; alternatives must be SHA-256-compatible for interoperability |
| **Archive** | tar.gz | zip, directory | tar.gz is widely supported; directory mode for development |
| **Manifest** | JSON | JSON5, TOML | JSON for canonical serialization; JSON5 for human editing |
| **Custody Log** | Append-only file | SQLite, append-only database | Simplicity preferred; must be tamper-evident |
| **Trust Store** | Local file | SQLite, keyring | Must work offline; file-based is most portable |

---

## Section 16: Stack Integration

### 16.1 How USDS Connects to the Constitutional Stack

USDS is a cross-cutting concern that interfaces with multiple layers of the ICore stack:

```
Layer 6  │ USR/CoreFab ──── UCA ──── UCD
         │     ↑                ↑
Layer 5+ │    [UCN]    [UWA]   [USDS]   ← Cross-cutting
         │     ↑        ↑       ↑
Layer 5  │ Reference Systems (Communication, Computation, Data)
         │     ↑
Layer 4  │ UCE ──── UCM ──── UCL ──── UVS
         │     ↑
Layer 3  │ Reference Sciences
         │     ↑
Layer 2  │ USC
         │     ↑
Layer 1  │ USCP
         │     ↑
Layer 0  │ ICore
```

### 16.2 How USDS Connects to UCN

UCN (Universal Constitutional Networking) provides the network substrate through which packages may be distributed. USDS defines what a package is and how it is verified; UCN provides the authenticated channels through which packages flow.

| Aspect | UCN | USDS |
|--------|-----|------|
| **Question answered** | "How do nodes communicate?" | "How is software distributed?" |
| **Package role** | Transport layer — carries packages as authenticated events | Distribution model — defines package structure and verification |
| **Trust model** | Node-to-node trust (network) | Package authenticity trust (distribution) |
| **Revocation** | Identity revocation (nodes) | Package revocation (software) |

### 16.3 How USDS Connects to UCA

UCA (Universal Constitutional Adapters) bridges the constitutional stack to external systems. USDS packages distributed through external channels (npm, PyPI, Docker Hub) pass through UCA adapters:

```
USDS (package model)
  │
  ├── Sovereign channel: direct P2P or local (UCN governs)
  │
  └── External channel: package passes through UCA adapters
        │
        ├── npm Adapter ──► npm registry
        ├── PyPI Adapter ──► Python Package Index
        ├── Docker Adapter ──► Container registries
        └── Future Adapter ──► Any external package system

UCA wraps the package in external format.
USDS signature and attestation are preserved inside.
Recipients on the external side verify using USDS protocol.
```

### 16.4 How USDS Connects to Studyo

Studyo visualizes the ICore ecosystem. USDS provides Studyo with:

| Visualization | USDS Source |
|--------------|-------------|
| Package distribution graph | Chain of custody events |
| Channel health dashboard | Channel adapter status |
| Trust network | Trust store key registry |
| Revocation status | Revocation list |
| Version timeline | Version history and supersession records |

### 16.5 How USDS Connects to ICS

ICS (Intelligence Constitutional Source) is the canonical repository for published constitutional software. ICS serves as the authoritative source for:

- Verified package archives
- Canonical chain of custody records
- Trust anchor keys
- Revocation lists

---

## Section 17: Self-Verification

### 17.1 Against the 10 Constitutional Tests

USDS Formal Specification v0.1.0 verified against the Kernel's 10 constitutional tests:

| # | Test | Result | Evidence |
|---|------|--------|----------|
| 1 | Reality | ✅ PASS | The specification addresses a real need: constitutional software must reach recipients with verified authenticity and integrity. Every axiom maps to a real distribution requirement. The nine-stage verification protocol solves a concrete problem. |
| 2 | Origin | ✅ PASS | Derived from Reference Systems (L5). All ten axioms trace to USCP primitives. The package model extends UWA's component model into the distribution domain. |
| 3 | Necessity | ✅ PASS | Without USDS, constitutional software has no formal distribution model. Packages could be tampered with, origins could be forged, and recipients would have no verification protocol. The gap is real and consequential. |
| 4 | Derivation | ✅ PASS | Follows D1 (derived from Reference Systems, the layer below). No upward dependencies. USDS does not depend on USR/CoreFab, Studyo, or any layer above. |
| 5 | Consistency | ✅ PASS | No axiom contradicts another. The ten axioms (origin, integrity, sovereignty, custody, verification, channels, revocation, versioning, channel-independence, attestation) are orthogonal and jointly complete. The 22 invariants are mutually consistent. |
| 6 | Verification | ✅ PASS | Every invariant is independently checkable. The 15 conformance tests provide a concrete verification protocol. The nine-stage verification flow is deterministic and auditable. |
| 7 | Simplicity | ✅ PASS | Ten axioms, fourteen definitions, twenty-two invariants, fifteen conformance tests. No axiom can be removed without leaving a distribution domain undefined. No axiom can be added without overlapping an existing one. |
| 8 | Sovereignty | ✅ PASS | Sovereignty is foundational (DA03, DA05, DA06, DA09). Section 10 explicitly addresses sovereignty in distribution. No central authority. No compulsion. No mandate. |
| 9 | Replaceability | ✅ PASS | The specification is defined in terms of what distribution provides, not how. Any implementation satisfying the axioms, invariants, and conformance tests is valid. Algorithms, transports, and formats are implementation choices. |
| 10 | Evolution | ✅ PASS | New channels can be added. New attestation types can be registered. New originators can join. The version system accommodates growth. The specification evolves through constitutional governance. |

**Result: 10/10 PASS.** USDS Formal Specification v0.1.0 is constitutionally sound and enters the constitutional record.

---

## Appendix A: Invariant Coverage Summary

| Domain | Invariants | Coverage |
|--------|-----------|----------|
| **Integrity** | DI01, DI02, DI22, PK2, PK4, SG1 | Content and manifest integrity; package immutability |
| **Authenticity** | DI03, DI15, SG2, SG4, SG5, DA10 | Signature validity; origin binding; attestation |
| **Provenance** | DI04, DI05, DI06, DI20, CC1–CC5 | Chain of custody completeness; hash-chain; accountability |
| **Sovereignty** | DI07, DI10, DI16, DI17, SC1–SC5, DA03 | No central control; voluntary participation; offline capability |
| **Verification** | DI08, DI19, VF1–VF5 | Mandatory verification; deterministic; sovereign |
| **Revocation** | DI10, DI11, DI12, RV1–RV6 | Immediate; propagated; authorized; specific |
| **Versioning** | DI13, DI14, DI21, VR1–VR5, CR1–CR5 | Monotonic; semver; constitutional compatibility |
| **Channels** | DI09, CH1–CH5 | Channel independence; no privilege; sovereign preference |
| **Attestation** | DI18, AT1–AT6 | Signed; specific; revocable; evidence-based |
| **Manifest** | MF1–MF4 | Required fields; deterministic hashing; content correspondence |
| **Total** | **22 distribution + 5 sovereignty + 5 verification + 6 revocation + 5 versioning + 5 channel + 5 signature + 5 custody + 6 attestation + 4 manifest** | **All six USCP primitives fully covered** |

---

## Appendix B: Derived Properties

The following properties are derived from the combination of axioms and invariants:

| # | Property | Derived From | Statement |
|---|----------|-------------|-----------|
| DP1 | **Tamper-evident distribution** | DI01 + DI02 + DI06 | Any modification to a distributed package is detectable through hash verification at multiple levels. |
| DP2 | **Self-contained verification** | DA05 + PK5 + VF2 + DI17 | A recipient can verify a package using only the package and local trust anchors — no network dependency. |
| DP3 | **Distributed resilience** | DA03 + DI16 + SC2 | No single point of failure can suppress or compromise the distribution network. |
| DP4 | **Constitutional traceability** | DI04 + DI20 + DP1 | Every package can be traced from creation to current custody through an unbroken, signed, hash-linked chain. |
| DP5 | **Channel-agnostic trust** | DA06 + DI09 + DA09 | The trustworthiness of a package is determined by its content and signatures, not by how it was delivered. |
| DP6 | **Sovereign upgrade** | DI13 + VR3 + SC4 | Version upgrades are always the recipient's sovereign choice — never mandated by the distribution system. |
| DP7 | **Rapid compromise response** | RV1 + RV3 + DI11 | A compromised package can be revoked and have that revocation propagated faster than packages can be re-distributed. |

---

## Appendix C: Glossary

| Term | Definition | Section |
|------|-----------|---------|
| **Attestation** | A signed constitutional claim about a package's properties | 14 |
| **Chain of Custody** | Immutable, append-only record of distribution events | 5 |
| **Channel** | The mechanism by which a package is transferred between entities | 7 |
| **Content** | The actual software artifacts within a package | 3 |
| **Distributor** | An entity that facilitates package transfer without altering content | 2 |
| **Manifest** | Machine-readable metadata describing a package | 2, 13 |
| **Originator** | The constitutional entity that produces a package | 2 |
| **Package** | A signed, attested, versioned unit of distribution | 2, 3 |
| **Recipient** | An entity that receives and verifies packages | 2 |
| **Revocation** | Constitutional declaration that a package is compromised | 9 |
| **Signature** | Cryptographic binding between originator and package | 4 |
| **Sovereignty** | Constitutional principle: no entity compels another in distribution | 10 |
| **Supersession** | The replacement of one package version by a newer one | 6 |
| **Trust Anchor** | An originator with verified, unbroken cryptographic provenance | 2 |
| **Verification** | The nine-stage process by which recipients accept or reject packages | 8 |

---

## Originator Attribution

This USDS Formal Specification v0.1.0 is originated, created, and concept-pioneered by:

**Originator:** Sir Collins — Creator and Concept Pioneer of ICore (access1@tutamail.com)
**Date of origination:** July 18, 2026
**Scope:** All axioms, package models, signature models, chain of custody, versioning, distribution channels, verification protocols, revocation mechanisms, sovereignty principles, invariants, conformance criteria, manifest formats, attestation formats, and implementation guidance presented in this specification.

This attribution is a constitutional artifact. It establishes provenance — the lowest and most fundamental layer of trust.

---

*USDS is the Constitution's supply chain. It ensures that constitutional software reaches every recipient with verified authenticity, unbroken provenance, and sovereign choice — making distribution a constitutional right, not a trust exercise.*