//! Constitutional Execution — Deterministic operation execution.
use serde::{Deserialize, Serialize};
use crate::{Result, ConstitutionalError, sha256, timestamp};

/// A constitutional operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub name: String,
    pub input: String,
    pub component_id: String,
}

/// Execution result with provenance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub operation: String,
    pub input_hash: String,
    pub output: String,
    pub output_hash: String,
    pub timestamp: String,
    pub success: bool,
    pub error: Option<String>,
}

/// The execution engine — runs operations deterministically
pub struct ExecutionEngine {
    registered_operations: Vec<String>,
}

impl ExecutionEngine {
    pub fn new() -> Self {
        Self {
            registered_operations: Vec::new(),
        }
    }

    /// Register an operation that this engine can execute
    pub fn register_operation(&mut self, operation: &str) {
        if !self.registered_operations.contains(&operation.to_string()) {
            self.registered_operations.push(operation.to_string());
        }
    }

    /// Execute an operation deterministically
    pub fn execute(&self, op: &Operation) -> Result<ExecutionResult> {
        // Verify the operation is registered
        if !self.registered_operations.contains(&op.name) {
            return Err(ConstitutionalError::ExecutionError(
                format!("Operation '{}' is not registered", op.name)
            ));
        }

        let input_hash = sha256(op.input.as_bytes());

        // Deterministic execution: same input → same output
        // For v0.1.0, we support basic constitutional operations
        let (output, success, error) = match op.name.as_str() {
            "validate-identity" => self.execute_validate_identity(&op.input),
            "check-derivation" => self.execute_check_derivation(&op.input),
            "enforce-constraint" => self.execute_enforce_constraint(&op.input),
            "compute-hash" => self.execute_compute_hash(&op.input),
            _ => (String::new(), false, Some(format!("Unknown operation: {}", op.name))),
        };

        let output_hash = sha256(output.as_bytes());

        Ok(ExecutionResult {
            operation: op.name.clone(),
            input_hash,
            output,
            output_hash,
            timestamp: timestamp(),
            success,
            error,
        })
    }

    /// Execute: validate a component's identity
    fn execute_validate_identity(&self, input: &str) -> (String, bool, Option<String>) {
        // Parse the input as JSON
        match serde_json::from_str::<serde_json::Value>(input) {
            Ok(val) => {
                let name = val.get("name").and_then(|v| v.as_str()).unwrap_or("");
                let layer = val.get("layer").and_then(|v| v.as_str()).unwrap_or("");
                let question = val.get("question").and_then(|v| v.as_str()).unwrap_or("");

                let mut issues = Vec::new();
                if name.is_empty() { issues.push("missing name"); }
                if layer.is_empty() { issues.push("missing layer"); }
                if question.is_empty() { issues.push("missing question"); }

                if issues.is_empty() {
                    (serde_json::json!({"valid": true, "issues": []}).to_string(), true, None)
                } else {
                    (serde_json::json!({"valid": false, "issues": issues}).to_string(), false, None)
                }
            }
            Err(e) => (String::new(), false, Some(format!("Invalid JSON: {}", e))),
        }
    }

    /// Execute: check if a derivation follows D1-D5
    fn execute_check_derivation(&self, input: &str) -> (String, bool, Option<String>) {
        match serde_json::from_str::<serde_json::Value>(input) {
            Ok(val) => {
                let parent_layer = val.get("parent_layer").and_then(|v| v.as_u64()).unwrap_or(0);
                let child_layer = val.get("child_layer").and_then(|v| v.as_u64()).unwrap_or(0);

                // D1: child layer must be >= parent layer
                let d1_pass = child_layer >= parent_layer;

                let result = serde_json::json!({
                    "d1_downward_only": d1_pass,
                    "parent_layer": parent_layer,
                    "child_layer": child_layer,
                });

                (result.to_string(), d1_pass, if d1_pass { None } else {
                    Some(format!("D1 violation: child layer {} not below parent layer {}", child_layer, parent_layer))
                })
            }
            Err(e) => (String::new(), false, Some(format!("Invalid JSON: {}", e))),
        }
    }

    /// Execute: enforce a constitutional constraint
    fn execute_enforce_constraint(&self, input: &str) -> (String, bool, Option<String>) {
        match serde_json::from_str::<serde_json::Value>(input) {
            Ok(val) => {
                let constraint_type = val.get("type").and_then(|v| v.as_str()).unwrap_or("");

                match constraint_type {
                    "d1_no_skip" => {
                        let parent = val.get("parent_layer").and_then(|v| v.as_u64()).unwrap_or(0);
                        let child = val.get("child_layer").and_then(|v| v.as_u64()).unwrap_or(0);
                        let pass = child >= parent;
                        (serde_json::json!({"enforced": pass, "rule": "D1"}).to_string(), pass, None)
                    }
                    "d4_boundary" => {
                        let layer = val.get("layer").and_then(|v| v.as_u64()).unwrap_or(0);
                        let pass = layer <= 5; // Execution layer is the boundary
                        (serde_json::json!({"enforced": pass, "rule": "D4"}).to_string(), pass, None)
                    }
                    _ => (String::new(), false, Some(format!("Unknown constraint type: {}", constraint_type))),
                }
            }
            Err(e) => (String::new(), false, Some(format!("Invalid JSON: {}", e))),
        }
    }

    /// Execute: compute SHA-256 hash
    fn execute_compute_hash(&self, input: &str) -> (String, bool, Option<String>) {
        let hash = sha256(input.as_bytes());
        (serde_json::json!({"hash": hash}).to_string(), true, None)
    }

    /// List all registered operations
    pub fn list_operations(&self) -> &[String] {
        &self.registered_operations
    }
}
