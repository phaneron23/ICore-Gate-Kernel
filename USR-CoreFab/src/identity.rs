//! Constitutional Identity — Every component declares who it is.
use serde::{Deserialize, Serialize};
use crate::{Result, ConstitutionalError, ConstitutionalLayer, sha256};

/// A constitutional component identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentId {
    pub id: String,
    pub name: String,
    pub layer: ConstitutionalLayer,
    pub version: String,
    pub parents: Vec<String>,
    pub question: String,
}

impl ComponentId {
    /// Create a new component identity
    pub fn declare(
        name: &str,
        layer: ConstitutionalLayer,
        version: &str,
        parents: Vec<String>,
        question: &str,
    ) -> Self {
        let metadata = format!("{}:{:?}:{}:{}", name, layer, version, parents.join(","));
        let id = sha256(metadata.as_bytes());

        Self {
            id,
            name: name.to_string(),
            layer,
            version: version.to_string(),
            parents,
            question: question.to_string(),
        }
    }

    /// Verify this identity against constitutional rules
    pub fn verify(&self) -> Result<bool> {
        // Rule 1: Must have a name
        if self.name.is_empty() {
            return Err(ConstitutionalError::IdentityNotDeclared(
                "Component has no name".to_string()
            ));
        }

        // Rule 2: Must be at a valid layer
        if self.layer == ConstitutionalLayer::Pre && !self.parents.is_empty() {
            return Err(ConstitutionalError::ConstraintViolation(
                "Pre-constitutional components cannot have parents".to_string()
            ));
        }

        // Rule 3: Non-pre components must have at least one parent
        if self.layer != ConstitutionalLayer::Pre && self.parents.is_empty() {
            return Err(ConstitutionalError::ConstraintViolation(
                "Components above pre-constitutional layer must derive from a parent".to_string()
            ));
        }

        // Rule 4: Layer ordering — parents must be at or above current layer
        // (This is a simplified check; full D1 enforcement is in constraints module)
        // For now, we trust the declaration and verify in constraints

        // Rule 5: Must answer a constitutional question
        if self.question.is_empty() {
            return Err(ConstitutionalError::IdentityNotDeclared(
                "Component does not answer a constitutional question".to_string()
            ));
        }

        Ok(true)
    }

    /// Get the WIT-compatible identity record
    pub fn to_wit_record(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_default()
    }
}

/// Registry of all declared component identities
#[derive(Debug, Default)]
pub struct IdentityRegistry {
    components: Vec<ComponentId>,
}

impl IdentityRegistry {
    pub fn new() -> Self {
        Self { components: Vec::new() }
    }

    /// Register a new component
    pub fn register(&mut self, component: ComponentId) -> Result<()> {
        component.verify()?;

        // Check for duplicate IDs
        if self.components.iter().any(|c| c.id == component.id) {
            return Err(ConstitutionalError::IdentityNotDeclared(
                format!("Component {} already registered", component.id)
            ));
        }

        self.components.push(component);
        Ok(())
    }

    /// Look up a component by ID
    pub fn lookup(&self, id: &str) -> Option<&ComponentId> {
        self.components.iter().find(|c| c.id == id)
    }

    /// Get all components at a given layer
    pub fn at_layer(&self, layer: &ConstitutionalLayer) -> Vec<&ComponentId> {
        self.components.iter().filter(|c| c.layer == *layer).collect()
    }

    /// Verify the entire registry is constitutionally consistent
    pub fn verify_all(&self) -> Result<bool> {
        for component in &self.components {
            component.verify()?;
        }

        // Verify D1: no component derives from a higher layer
        for component in &self.components {
            for parent_id in &component.parents {
                if let Some(parent) = self.lookup(parent_id) {
                    if parent.layer.ordinal() > component.layer.ordinal() {
                        return Err(ConstitutionalError::ConstraintViolation(
                            format!("{} derives from {} which is at a higher layer",
                                component.name, parent.name)
                        ));
                    }
                }
            }
        }

        Ok(true)
    }
}
