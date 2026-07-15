//! ICore Constitutional Execution Engine (CoreFab)
//! USR/CoreFab v0.1.0
//!
//! A runtime exists only to execute the Constitution.
//! Every additional capability must be constitutionally justified.

pub mod identity;
pub mod execution;
pub mod constraints;
pub mod isolation;
pub mod attestation;
pub mod orchestration;
pub mod runtime;

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Constitutional error type
#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum ConstitutionalError {
    #[error("Identity not declared: {0}")]
    IdentityNotDeclared(String),

    #[error("Constraint violation: {0}")]
    ConstraintViolation(String),

    #[error("Capability not granted: {0}")]
    CapabilityNotGranted(String),

    #[error("Attestation failed: {0}")]
    AttestationFailed(String),

    #[error("Orchestration error: {0}")]
    OrchestrationError(String),

    #[error("Execution error: {0}")]
    ExecutionError(String),

    #[error("Blueprint invalid: {0}")]
    BlueprintInvalid(String),
}

pub type Result<T> = std::result::Result<T, ConstitutionalError>;

/// The 7 constitutional layers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ConstitutionalLayer {
    Pre,         // Reality, Principles
    Uscp,        // 6 Primitives
    Usc,         // The Constitution
    Science,     // UCE, UCC, UCM, UCL
    Expression,  // UCRS, UCModels, URS, UVS
    Execution,   // USR, UCA, UCD
    Implementation, // CodeLabs, Studyo
}

impl ConstitutionalLayer {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "pre" => Some(Self::Pre),
            "uscp" => Some(Self::Uscp),
            "usc" => Some(Self::Usc),
            "science" => Some(Self::Science),
            "expression" => Some(Self::Expression),
            "execution" => Some(Self::Execution),
            "impl" | "implementation" => Some(Self::Implementation),
            _ => None,
        }
    }

    pub fn ordinal(&self) -> u8 {
        match self {
            Self::Pre => 0,
            Self::Uscp => 1,
            Self::Usc => 2,
            Self::Science => 3,
            Self::Expression => 4,
            Self::Execution => 5,
            Self::Implementation => 6,
        }
    }
}

/// The 6 USCP primitives
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Primitive {
    Existence,
    Identity,
    Relationship,
    Constraint,
    Transformation,
    Verification,
}

/// The 6 constitutional questions
pub const CONSTITUTIONAL_QUESTIONS: &[(&str, &str)] = &[
    ("exist", "What is?"),
    ("identity", "Who/what is it?"),
    ("relationship", "How is it connected?"),
    ("constraint", "What governs it?"),
    ("transformation", "How does it change?"),
    ("verification", "How do we know it is valid?"),
];

/// SHA-256 hash of data
pub fn sha256(data: &[u8]) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

/// ISO 8601 timestamp
pub fn timestamp() -> String {
    chrono::Utc::now().to_rfc3339()
}
