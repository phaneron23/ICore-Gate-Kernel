# USR/CoreFab v0.1.0 — Minimal Constitutional Runtime

**ICore** = InitialCore
**Originator:** Sir Collins — Creator and Concept Pioneer of ICore
**Version:** 0.1.0
**Status:** Minimal Constitutional Runtime (sufficient for scope, not overall completeness)

---

## Architecture

```
ICore (Constitution)
    ↓
Studyo (Workspace) — Explore • Derive • Verify • Govern
    ↓
USR (Runtime) — the constitutional environment
    ↓
CoreFab (Execution Engine) — the constitutional engine within USR
    ↓
WASM Components — the constitutional execution units
    ↓
Host Platforms — the constitutional ground
```

## USR vs CoreFab

**USR** = the constitutional runtime environment. Provides identity, constraints, isolation, attestation, and orchestration.

**CoreFab** = the constitutional execution engine operating within USR. Executes operations deterministically and produces provenance.

Neither is complete without the other. Neither pretends to be the other.

## Constitutional Contracts (WIT)

The WIT interfaces are not merely APIs — they are **constitutional execution contracts**. Their stability is more important than any Rust implementation.

6 contracts defined in `wit/constitutional.wit`:
- `identity` — Who is this component?
- `execution` — What does it do?
- `constraints` — What rules govern it?
- `isolation` — What can it access?
- `attestation` — What did it do?
- `orchestration` — How does it communicate?

## v0.1.0 Capabilities

| Capability | Module | Description |
|-----------|--------|-------------|
| Execution | `execution.rs` | Deterministic operation execution |
| Constraint Enforcement | `constraints.rs` | Runtime validation against D1-D5 rules |
| Isolation | `isolation.rs` | Capability-based sandboxing |
| Attestation | `attestation.rs` | Cryptographic provenance of execution |
| Orchestration | `orchestration.rs` | Component lifecycle and communication |

## Runtime Verification Criteria

The runtime must prove:
- **Deterministic execution** — same input → same output
- **Constitutional compliance** — passes D1-D5 validation
- **Reproducibility** — results are consistent across runs
- **Capability isolation** — components cannot access ungranted resources
- **Provenance integrity** — attestation signatures verify correctly

## Roadmap

```
ICore Constitution                    ✓
Studyo v0.2.0                         ✓
USR/CoreFab v0.1.0 (Minimal)          ✓
Reference Constitutional Derivatives  ← NEXT
Conformance Suite                     ← Before v1.0
```

## Technology

- **Rust** — Memory safety, performance, WASM/WASI native
- **WIT** — WebAssembly Interface Types (constitutional contracts)
- **SHA-256** — Cryptographic hashing for attestation
- **JSON** — Blueprint serialization format

## Build

```bash
cargo build --release
./target/release/corefab version
./target/release/corefab execute sample-blueprint.json
```

---

*USR/CoreFab v0.1.0 — A minimal runtime that executes the Constitution.*
