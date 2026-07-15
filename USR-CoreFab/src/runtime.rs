//! Constitutional Runtime — The unified USR/CoreFab interface.
use crate::{Result, ConstitutionalError, sha256, timestamp};
use crate::identity::{ComponentId, IdentityRegistry};
use crate::execution::ExecutionEngine;
use crate::constraints::ConstraintEngine;
use crate::isolation::IsolationEngine;
use crate::attestation::AttestationEngine;
use crate::orchestration::OrchestrationEngine;

/// USR/CoreFab Runtime Version
pub const RUNTIME_VERSION: &str = "0.1.0";

/// The USR Constitutional Runtime
pub struct UsrRuntime {
    pub identity: IdentityRegistry,
    pub execution: ExecutionEngine,
    pub constraints: ConstraintEngine,
    pub isolation: IsolationEngine,
    pub attestation: AttestationEngine,
    pub orchestration: OrchestrationEngine,
}

impl UsrRuntime {
    /// Create a new USR runtime
    pub fn new() -> Self {
        let mut execution = ExecutionEngine::new();
        execution.register_operation("validate-identity");
        execution.register_operation("check-derivation");
        execution.register_operation("enforce-constraint");
        execution.register_operation("compute-hash");

        Self {
            identity: IdentityRegistry::new(),
            execution,
            constraints: ConstraintEngine::new(),
            isolation: IsolationEngine::new(),
            attestation: AttestationEngine::new(),
            orchestration: OrchestrationEngine::new(),
        }
    }

    /// Get the runtime version
    pub fn version(&self) -> &str {
        RUNTIME_VERSION
    }

    /// Get the runtime capabilities
    pub fn capabilities(&self) -> Vec<&str> {
        vec![
            "execution",
            "constraint-enforcement",
            "isolation",
            "attestation",
            "orchestration",
        ]
    }

    /// Execute a constitutional blueprint
    pub fn execute_blueprint(&mut self, blueprint: &str) -> Result<String> {
        // Validate the blueprint first
        self.validate_blueprint(blueprint)?;

        // Parse the blueprint
        let parsed: serde_json::Value = serde_json::from_str(blueprint)
            .map_err(|e| ConstitutionalError::BlueprintInvalid(format!("Invalid JSON: {}", e)))?;

        let component_name = parsed.get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown");

        let component_id = parsed.get("id")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        let layer = parsed.get("layer")
            .and_then(|v| v.as_str())
            .unwrap_or("impl");

        // Execute the blueprint
        let mut result = serde_json::json!({
            "status": "executing",
            "component": component_name,
            "timestamp": timestamp(),
        });

        // 1. Register the component
        let cid = ComponentId::declare(
            component_name,
            crate::ConstitutionalLayer::from_str(layer).unwrap_or(crate::ConstitutionalLayer::Implementation),
            "0.1.0",
            Vec::new(),
            &format!("Constitutional component: {}", component_name),
        );

        self.identity.register(cid.clone())?;

        // 2. Register with orchestration
        self.orchestration.register(&cid.id)?;

        // 3. Request capabilities
        self.isolation.request_capability(
            &cid.id,
            "execution",
            &["execute".to_string(), "attest".to_string()],
        )?;

        // 4. Initialize
        self.orchestration.initialize(&cid.id)?;

        // 5. Start
        self.orchestration.start(&cid.id)?;

        // 6. Execute the operation if specified
        if let Some(operation) = parsed.get("operation").and_then(|v| v.as_str()) {
            let input = parsed.get("input")
                .and_then(|v| v.to_string())
                .unwrap_or_else(|| "{}".to_string());

            let op = crate::execution::Operation {
                name: operation.to_string(),
                input,
                component_id: cid.id.clone(),
            };

            let exec_result = self.execution.execute(&op)?;

            // 7. Attest the execution
            let attestation = self.attestation.attest(
                &cid.id,
                operation,
                &exec_result.input_hash,
                &exec_result.output,
                if exec_result.success { "success" } else { "failure" },
            )?;

            result = serde_json::json!({
                "status": if exec_result.success { "completed" } else { "failed" },
                "component": component_name,
                "component_id": cid.id,
                "operation": operation,
                "result": exec_result.output,
                "attestation": {
                    "signature": attestation.signature,
                    "timestamp": attestation.timestamp,
                },
                "timestamp": timestamp(),
            });
        } else {
            result = serde_json::json!({
                "status": "registered",
                "component": component_name,
                "component_id": cid.id,
                "timestamp": timestamp(),
            });
        }

        Ok(serde_json::to_string_pretty(&result).unwrap_or_default())
    }

    /// Validate a blueprint before execution
    pub fn validate_blueprint(&self, blueprint: &str) -> Result<bool> {
        let parsed: serde_json::Value = serde_json::from_str(blueprint)
            .map_err(|e| ConstitutionalError::BlueprintInvalid(format!("Invalid JSON: {}", e)))?;

        // Must have a name
        if parsed.get("name").and_then(|v| v.as_str()).is_none() {
            return Err(ConstitutionalError::BlueprintInvalid(
                "Blueprint must have a 'name' field".to_string()
            ));
        }

        // Must have a layer
        if parsed.get("layer").and_then(|v| v.as_str()).is_none() {
            return Err(ConstitutionalError::BlueprintInvalid(
                "Blueprint must have a 'layer' field".to_string()
            ));
        }

        // Layer must be valid
        let layer = parsed.get("layer").and_then(|v| v.as_str()).unwrap();
        if crate::ConstitutionalLayer::from_str(layer).is_none() {
            return Err(ConstitutionalError::BlueprintInvalid(
                format!("Invalid layer: {}", layer)
            ));
        }

        Ok(true)
    }

    /// Verify the entire runtime is constitutionally consistent
    pub fn verify(&self) -> Result<bool> {
        self.identity.verify_all()?;
        self.isolation.verify_all()?;
        self.attestation.verify_chain()?;
        self.orchestration.verify_all()?;
        Ok(true)
    }
}

impl Default for UsrRuntime {
    fn default() -> Self {
        Self::new()
    }
}
