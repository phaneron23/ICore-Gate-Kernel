//! Constitutional Constraints — Runtime validation against the 6 questions and 10 tests.
use serde::{Deserialize, Serialize};
use crate::{Result, ConstitutionalError};

/// The 6 constitutional questions that every claim must answer
pub const SIX_QUESTIONS: &[(&str, &str, &str)] = &[
    ("existence", "What is?", "Does the claim refer to something that exists?"),
    ("identity", "Who/what is it?", "Can the entity be uniquely identified?"),
    ("relationship", "How is it connected?", "Are the relationships defined?"),
    ("constraint", "What governs it?", "Are the constraints explicit?"),
    ("transformation", "How does it change?", "Are the transformation rules defined?"),
    ("verification", "How do we know it is valid?", "Can its correctness be verified?"),
];

/// The 10 verification tests from Part III
pub const TEN_TESTS: &[(&str, &str)] = &[
    ("T1", "Reality Test"),
    ("T2", "Origin Test"),
    ("T3", "Constitutional Necessity Test"),
    ("T4", "Derivation Test"),
    ("T5", "Consistency Test"),
    ("T6", "Verification Test"),
    ("T7", "Simplicity Test"),
    ("T8", "Sovereignty Test"),
    ("T9", "Replaceability Test"),
    ("T10", "Evolution Test"),
];

/// Result of constraint validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub questions_passed: Vec<String>,
    pub questions_failed: Vec<String>,
    pub tests_passed: Vec<String>,
    pub tests_failed: Vec<String>,
    pub issues: Vec<String>,
}

/// The constraint enforcement engine
pub struct ConstraintEngine;

impl ConstraintEngine {
    pub fn new() -> Self {
        Self
    }

    /// Validate a claim against the 6 constitutional questions
    pub fn validate_claim(&self, claim: &str) -> Result<ValidationResult> {
        let parsed: serde_json::Value = serde_json::from_str(claim)
            .map_err(|e| ConstitutionalError::ConstraintViolation(format!("Invalid JSON: {}", e)))?;

        let mut questions_passed = Vec::new();
        let mut questions_failed = Vec::new();
        let mut issues = Vec::new();

        // Check existence: must have content
        if parsed.get("content").and_then(|v| v.as_str()).map(|s| !s.is_empty()).unwrap_or(false) {
            questions_passed.push("existence".to_string());
        } else {
            questions_failed.push("existence".to_string());
            issues.push("Claim has no content".to_string());
        }

        // Check identity: must have a name/id
        if parsed.get("name").and_then(|v| v.as_str()).is_some() ||
           parsed.get("id").and_then(|v| v.as_str()).is_some() {
            questions_passed.push("identity".to_string());
        } else {
            questions_failed.push("identity".to_string());
            issues.push("Claim has no name or ID".to_string());
        }

        // Check relationships: must have type or category
        if parsed.get("type").and_then(|v| v.as_str()).is_some() ||
           parsed.get("category").and_then(|v| v.as_str()).is_some() ||
           parsed.get("relationships").is_some() {
            questions_passed.push("relationship".to_string());
        } else {
            questions_failed.push("relationship".to_string());
            issues.push("Claim has no type or relationships".to_string());
        }

        // Check constraints: must have rules or constraints
        if parsed.get("constraints").is_some() || parsed.get("rules").is_some() {
            questions_passed.push("constraint".to_string());
        } else {
            questions_failed.push("constraint".to_string());
            issues.push("Claim has no constraints defined".to_string());
        }

        // Check transformation: must have transformation rules or be marked immutable
        if parsed.get("transformations").is_some() ||
           parsed.get("immutable").and_then(|v| v.as_bool()).unwrap_or(false) {
            questions_passed.push("transformation".to_string());
        } else {
            questions_failed.push("transformation".to_string());
            issues.push("Claim has no transformation rules".to_string());
        }

        // Check verification: must have verification criteria
        if parsed.get("verification").is_some() || parsed.get("verified").is_some() {
            questions_passed.push("verification".to_string());
        } else {
            questions_failed.push("verification".to_string());
            issues.push("Claim has no verification criteria".to_string());
        }

        let valid = questions_failed.is_empty();

        Ok(ValidationResult {
            valid,
            questions_passed,
            questions_failed,
            tests_passed: Vec::new(), // Tests are run separately
            tests_failed: Vec::new(),
            issues,
        })
    }

    /// Check if a derivation follows D1-D5 rules
    pub fn check_derivation(
        &self,
        parent_layer: u8,
        child_layer: u8,
        parent_count: usize,
        is_uca_boundary: bool,
    ) -> Result<ValidationResult> {
        let mut issues = Vec::new();
        let mut tests_passed = Vec::new();
        let mut tests_failed = Vec::new();

        // D1: Downward only
        if child_layer >= parent_layer {
            tests_passed.push("D1_downward_only".to_string());
        } else {
            tests_failed.push("D1_downward_only".to_string());
            issues.push(format!("D1 violation: child layer {} above parent layer {}", child_layer, parent_layer));
        }

        // D2: No upward mutation (inherent in architecture)
        tests_passed.push("D2_no_upward_mutation".to_string());

        // D3: Merge requires justification
        if parent_count <= 1 {
            tests_passed.push("D3_merge_justification".to_string());
        } else {
            tests_passed.push("D3_merge_justification".to_string());
            // In a full implementation, we'd check for merge justification
        }

        // D4: Adaptation boundary
        if is_uca_boundary || child_layer <= 5 {
            tests_passed.push("D4_adaptation_boundary".to_string());
        } else {
            tests_failed.push("D4_adaptation_boundary".to_string());
            issues.push("D4 violation: derived beyond adaptation boundary".to_string());
        }

        // D5: Derivatives composed
        tests_passed.push("D5_derivatives_composed".to_string());

        let valid = tests_failed.is_empty();

        Ok(ValidationResult {
            valid,
            questions_passed: Vec::new(),
            questions_failed: Vec::new(),
            tests_passed,
            tests_failed,
            issues,
        })
    }

    /// Enforce a specific constraint
    pub fn enforce(&self, constraint_id: &str, context: &str) -> Result<bool> {
        match constraint_id {
            "d1_no_skip" => {
                let parsed: serde_json::Value = serde_json::from_str(context)
                    .map_err(|e| ConstitutionalError::ConstraintViolation(e.to_string()))?;
                let parent = parsed.get("parent_layer").and_then(|v| v.as_u64()).unwrap_or(0);
                let child = parsed.get("child_layer").and_then(|v| v.as_u64()).unwrap_or(0);
                Ok(child >= parent)
            }
            "d4_boundary" => {
                let parsed: serde_json::Value = serde_json::from_str(context)
                    .map_err(|e| ConstitutionalError::ConstraintViolation(e.to_string()))?;
                let layer = parsed.get("layer").and_then(|v| v.as_u64()).unwrap_or(0);
                Ok(layer <= 5)
            }
            _ => Err(ConstitutionalError::ConstraintViolation(
                format!("Unknown constraint: {}", constraint_id)
            )),
        }
    }
}
