# USR/CoreFab v0.1.0 — The Constitutional Runtime

**ICore** = InitialCore
**Originator:** Sir Collins — Creator and Concept Pioneer of ICore
**Version:** 0.1.0
**Status:** First constitutional runtime release

---

## Architecture

```
USR (Runtime) — the constitutional environment
    ↓
CoreFab (Execution Engine) — the constitutional engine
    ↓
WASM Components — the constitutional execution units
    ↓
Host Platforms — the constitutional ground
```

## v0.1.0 Capabilities

| Capability | Module | Description |
|-----------|--------|-------------|
| Execution | `execution.rs` | Deterministic operation execution |
| Constraint Enforcement | `constraints.rs` | Runtime validation against D1-D5 rules |
| Isolation | `isolation.rs` | Capability-based sandboxing |
| Attestation | `attestation.rs` | Cryptographic provenance of execution |
| Orchestration | `orchestration.rs` | Component lifecycle and communication |

## Constitutional ABI (WIT)

The stable interface between CoreFab and WASM components:
- `identity` — Component identity and verification
- `execution` — Deterministic operation execution
- `constraints` — Constitutional constraint enforcement
- `isolation` — Capability-based access control
- `attestation` — Cryptographic execution provenance
- `orchestration` — Lifecycle and message passing

## Usage

```bash
# Build
cargo build --release

# Show version
./target/release/corefab version

# List capabilities
./target/release/corefab capabilities

# Validate a blueprint
./target/release/corefab validate sample-blueprint.json

# Execute a blueprint
./target/release/corefab execute sample-blueprint.json

# Verify runtime consistency
./target/release/corefab verify
```

## Technology

- **Rust** — Memory safety, performance, WASM/WASI native
- **WIT** — WebAssembly Interface Types for the constitutional ABI
- **SHA-256** — Cryptographic hashing for attestation
- **JSON** — Blueprint serialization format

---

*USR/CoreFab v0.1.0 — A runtime exists only to execute the Constitution.*
