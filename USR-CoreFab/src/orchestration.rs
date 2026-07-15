//! Constitutional Orchestration — Lifecycle and communication between components.
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::{Result, ConstitutionalError, timestamp};

/// Component lifecycle state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LifecycleState {
    Registered,
    Initialized,
    Running,
    Paused,
    Stopped,
    Error,
}

/// A message between components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub from: String,
    pub to: String,
    pub payload: String,
    pub timestamp: String,
}

/// Component state tracking
#[derive(Debug, Clone)]
struct ComponentState {
    state: LifecycleState,
    registered_at: String,
    last_transition: String,
}

/// The orchestration engine — manages component lifecycle and communication
pub struct OrchestrationEngine {
    components: HashMap<String, ComponentState>,
    messages: Vec<Message>,
}

impl OrchestrationEngine {
    pub fn new() -> Self {
        Self {
            components: HashMap::new(),
            messages: Vec::new(),
        }
    }

    /// Register a component with the runtime
    pub fn register(&mut self, component_id: &str) -> Result<()> {
        if self.components.contains_key(component_id) {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Component {} already registered", component_id)
            ));
        }

        self.components.insert(component_id.to_string(), ComponentState {
            state: LifecycleState::Registered,
            registered_at: timestamp(),
            last_transition: timestamp(),
        });

        Ok(())
    }

    /// Initialize a registered component
    pub fn initialize(&mut self, component_id: &str) -> Result<()> {
        let state = self.components.get_mut(component_id)
            .ok_or_else(|| ConstitutionalError::OrchestrationError(
                format!("Component {} not found", component_id)
            ))?;

        if state.state != LifecycleState::Registered {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Component {} cannot initialize from state {:?}", component_id, state.state)
            ));
        }

        state.state = LifecycleState::Initialized;
        state.last_transition = timestamp();
        Ok(())
    }

    /// Start an initialized component
    pub fn start(&mut self, component_id: &str) -> Result<()> {
        let state = self.components.get_mut(component_id)
            .ok_or_else(|| ConstitutionalError::OrchestrationError(
                format!("Component {} not found", component_id)
            ))?;

        if state.state != LifecycleState::Initialized {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Component {} cannot start from state {:?}", component_id, state.state)
            ));
        }

        state.state = LifecycleState::Running;
        state.last_transition = timestamp();
        Ok(())
    }

    /// Pause a running component
    pub fn pause(&mut self, component_id: &str) -> Result<()> {
        let state = self.components.get_mut(component_id)
            .ok_or_else(|| ConstitutionalError::OrchestrationError(
                format!("Component {} not found", component_id)
            ))?;

        if state.state != LifecycleState::Running {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Component {} cannot pause from state {:?}", component_id, state.state)
            ));
        }

        state.state = LifecycleState::Paused;
        state.last_transition = timestamp();
        Ok(())
    }

    /// Stop a component
    pub fn stop(&mut self, component_id: &str) -> Result<()> {
        let state = self.components.get_mut(component_id)
            .ok_or_else(|| ConstitutionalError::OrchestrationError(
                format!("Component {} not found", component_id)
            ))?;

        if state.state == LifecycleState::Stopped {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Component {} already stopped", component_id)
            ));
        }

        state.state = LifecycleState::Stopped;
        state.last_transition = timestamp();
        Ok(())
    }

    /// Get the current state of a component
    pub fn get_state(&self, component_id: &str) -> Result<LifecycleState> {
        self.components.get(component_id)
            .map(|s| s.state.clone())
            .ok_or_else(|| ConstitutionalError::OrchestrationError(
                format!("Component {} not found", component_id)
            ))
    }

    /// Send a message between components
    pub fn send_message(&mut self, from: &str, to: &str, payload: &str) -> Result<()> {
        // Verify both components exist and are running
        let from_state = self.get_state(from)?;
        let to_state = self.get_state(to)?;

        if from_state != LifecycleState::Running {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Sender {} is not running (state: {:?})", from, from_state)
            ));
        }

        if to_state != LifecycleState::Running {
            return Err(ConstitutionalError::OrchestrationError(
                format!("Recipient {} is not running (state: {:?})", to, to_state)
            ));
        }

        self.messages.push(Message {
            from: from.to_string(),
            to: to.to_string(),
            payload: payload.to_string(),
            timestamp: timestamp(),
        });

        Ok(())
    }

    /// Get all messages for a component
    pub fn get_messages(&self, component_id: &str) -> Vec<&Message> {
        self.messages
            .iter()
            .filter(|m| m.to == component_id || m.from == component_id)
            .collect()
    }

    /// Get the dependency graph as JSON
    pub fn get_dependency_graph(&self) -> String {
        let graph: Vec<serde_json::Value> = self.components.iter().map(|(id, state)| {
            serde_json::json!({
                "id": id,
                "state": format!("{:?}", state.state),
                "registered_at": state.registered_at,
                "last_transition": state.last_transition,
            })
        }).collect();

        serde_json::to_string_pretty(&graph).unwrap_or_default()
    }

    /// Verify all components are in valid states
    pub fn verify_all(&self) -> Result<bool> {
        for (id, state) in &self.components {
            match state.state {
                LifecycleState::Registered | LifecycleState::Initialized |
                LifecycleState::Running | LifecycleState::Paused | LifecycleState::Stopped => {
                    // Valid states
                }
                LifecycleState::Error => {
                    return Err(ConstitutionalError::OrchestrationError(
                        format!("Component {} is in error state", id)
                    ));
                }
            }
        }
        Ok(true)
    }
}
