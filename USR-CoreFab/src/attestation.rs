//! Constitutional Attestation — Cryptographic provenance of execution.
use serde::{Deserialize, Serialize};
use crate::{Result, ConstitutionalError, sha256, timestamp};

/// An attestation record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttestationRecord {
    pub component_id: String,
    pub operation: String,
    pub input_hash: String,
    pub output_hash: String,
    pub timestamp: String,
    pub result: String,
    pub signature: String,
}

impl AttestationRecord {
    /// Create the data to be signed
    fn signing_data(&self) -> String {
        format!(
            "{}:{}:{}:{}:{}:{}",
            self.component_id, self.operation, self.input_hash,
            self.output_hash, self.timestamp, self.result
        )
    }

    /// Compute the signature (SHA-256 of signing data for v0.1.0)
    /// In production, this would use Ed25519 or similar
    fn compute_signature(data: &str) -> String {
        sha256(format!("attestation:{}", data).as_bytes())
    }
}

/// Attestation engine — creates and verifies execution provenance
pub struct AttestationEngine {
    chain: Vec<AttestationRecord>,
}

impl AttestationEngine {
    pub fn new() -> Self {
        Self {
            chain: Vec::new(),
        }
    }

    /// Create an attestation for an execution
    pub fn attest(
        &mut self,
        component_id: &str,
        operation: &str,
        input: &str,
        output: &str,
        result: &str,
    ) -> Result<AttestationRecord> {
        let input_hash = sha256(input.as_bytes());
        let output_hash = sha256(output.as_bytes());
        let ts = timestamp();

        let mut record = AttestationRecord {
            component_id: component_id.to_string(),
            operation: operation.to_string(),
            input_hash,
            output_hash,
            timestamp: ts,
            result: result.to_string(),
            signature: String::new(),
        };

        // Compute signature
        let sig_data = record.signing_data();
        record.signature = AttestationRecord::compute_signature(&sig_data);

        self.chain.push(record.clone());

        Ok(record)
    }

    /// Verify an attestation record
    pub fn verify(&self, record: &AttestationRecord) -> Result<bool> {
        // Recompute signature
        let sig_data = record.signing_data();
        let expected_sig = AttestationRecord::compute_signature(&sig_data);

        if record.signature != expected_sig {
            return Err(ConstitutionalError::AttestationFailed(
                "Signature mismatch".to_string()
            ));
        }

        // Verify it's in the chain
        let in_chain = self.chain.iter().any(|r| {
            r.component_id == record.component_id &&
            r.operation == record.operation &&
            r.timestamp == record.timestamp &&
            r.signature == record.signature
        });

        Ok(in_chain)
    }

    /// Get the attestation chain for a component
    pub fn get_chain(&self, component_id: &str) -> Vec<&AttestationRecord> {
        self.chain
            .iter()
            .filter(|r| r.component_id == component_id)
            .collect()
    }

    /// Get the full chain
    pub fn full_chain(&self) -> &[AttestationRecord] {
        &self.chain
    }

    /// Verify the entire chain is consistent
    pub fn verify_chain(&self) -> Result<bool> {
        for record in &self.chain {
            self.verify(record)?;
        }
        Ok(true)
    }
}
