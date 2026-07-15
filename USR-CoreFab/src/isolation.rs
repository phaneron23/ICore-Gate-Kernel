//! Constitutional Isolation — Capability-based sandboxing of components.
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::{Result, ConstitutionalError, timestamp};

/// A capability grant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capability {
    pub resource: String,
    pub permissions: Vec<String>,
    pub expires: String,
    pub granted_to: String,
    pub granted_at: String,
}

/// Resource types that can be governed
pub const GOVERNED_RESOURCES: &[&str] = &[
    "execution",
    "attestation",
    "orchestration",
    "identity",
    "constraints",
    "storage",
    "network",
];

/// Capability-based isolation engine
pub struct IsolationEngine {
    granted: HashMap<String, Vec<Capability>>,
}

impl IsolationEngine {
    pub fn new() -> Self {
        Self {
            granted: HashMap::new(),
        }
    }

    /// Request a capability from the runtime
    pub fn request_capability(
        &mut self,
        component_id: &str,
        resource: &str,
        permissions: &[String],
    ) -> Result<Capability> {
        // Validate the resource is governable
        if !GOVERNED_RESOURCES.contains(&resource) {
            return Err(ConstitutionalError::CapabilityNotGranted(
                format!("Resource '{}' is not governed by the runtime", resource)
            ));
        }

        // For v0.1.0, all requests are granted for constitutional components
        // In a full implementation, this would check component identity and layer
        let capability = Capability {
            resource: resource.to_string(),
            permissions: permissions.to_vec(),
            expires: "permanent".to_string(),
            granted_to: component_id.to_string(),
            granted_at: timestamp(),
        };

        self.granted
            .entry(component_id.to_string())
            .or_insert_with(Vec::new)
            .push(capability.clone());

        Ok(capability)
    }

    /// Check if a capability is currently granted
    pub fn check_capability(
        &self,
        component_id: &str,
        resource: &str,
        permission: &str,
    ) -> Result<bool> {
        if let Some(capabilities) = self.granted.get(component_id) {
            for cap in capabilities {
                if cap.resource == resource && cap.permissions.contains(&permission.to_string()) {
                    // Check expiration
                    if cap.expires == "permanent" || cap.expires > timestamp() {
                        return Ok(true);
                    }
                }
            }
        }
        Ok(false)
    }

    /// Revoke a capability
    pub fn revoke_capability(
        &mut self,
        component_id: &str,
        resource: &str,
    ) -> Result<bool> {
        if let Some(capabilities) = self.granted.get_mut(component_id) {
            let before = capabilities.len();
            capabilities.retain(|c| c.resource != resource);
            return Ok(capabilities.len() < before);
        }
        Ok(false)
    }

    /// Get all capabilities for a component
    pub fn get_capabilities(&self, component_id: &str) -> Vec<&Capability> {
        self.granted
            .get(component_id)
            .map(|caps| caps.iter().collect())
            .unwrap_or_default()
    }

    /// Verify all capabilities are valid
    pub fn verify_all(&self) -> Result<bool> {
        let now = timestamp();
        for (component_id, capabilities) in &self.granted {
            for cap in capabilities {
                if cap.expires != "permanent" && cap.expires < now {
                    return Err(ConstitutionalError::CapabilityNotGranted(
                        format!("Expired capability for {} on {}", component_id, cap.resource)
                    ));
                }
            }
        }
        Ok(true)
    }
}
