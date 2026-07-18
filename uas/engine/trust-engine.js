// UAS — Trust Engine v1.0.0
// Multi-factor agent trust scoring system.

window.UASTrustEngine = (() => {
  'use strict';

  function isoNow() {
    return new Date().toISOString();
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ─── Trust Score ─────────────────────────────────────────────────────

  class TrustScore {
    constructor(value) {
      this.value = Math.min(100, Math.max(0, value || 50));
      this.history = [{ value: this.value, timestamp: isoNow(), reason: 'initial' }];
      this.factors = {
        conformance: 50,    // How well agent follows constitutional rules
        attestation: 50,    // Quality and consistency of attestations
        communication: 50,  // Communication reliability and clarity
        goalCompletion: 50  // Rate of goal achievement
      };
      this.lastVerification = isoNow();
    }
  }

  // ─── Trust Engine ────────────────────────────────────────────────────

  class TrustEngine {
    constructor() {
      this.scores = new Map(); // agentId → TrustScore
    }

    calculate(agent) {
      let score = this.scores.get(agent.id);
      if (!score) {
        score = new TrustScore(agent.trustScore || 50);
        this.scores.set(agent.id, score);
      }

      // Calculate factors based on agent data
      const conformance = this._calcConformance(agent);
      const attestation = this._calcAttestation(agent);
      const communication = this._calcCommunication(agent);
      const goalCompletion = this._calcGoalCompletion(agent);

      score.factors.conformance = conformance;
      score.factors.attestation = attestation;
      score.factors.communication = communication;
      score.factors.goalCompletion = goalCompletion;

      // Weighted composite score
      const weights = {
        conformance: 0.30,
        attestation: 0.25,
        communication: 0.20,
        goalCompletion: 0.25
      };

      const newScore = Math.round(
        conformance * weights.conformance +
        attestation * weights.attestation +
        communication * weights.communication +
        goalCompletion * weights.goalCompletion
      );

      score.value = Math.min(100, Math.max(0, newScore));
      score.history.push({
        value: score.value,
        timestamp: isoNow(),
        reason: 'recalculation',
        factors: { ...score.factors }
      });

      // Keep history bounded
      if (score.history.length > 50) {
        score.history = score.history.slice(-50);
      }

      score.lastVerification = isoNow();
      return score;
    }

    verify(agent) {
      const score = this.calculate(agent);

      // Verification checks
      const checks = [];

      // Check 1: State validity
      checks.push({
        name: 'State Validity',
        passed: ['Registered', 'Active', 'Suspended', 'Terminated'].includes(agent.state),
        detail: `Current state: ${agent.state}`
      });

      // Check 2: Identity integrity
      checks.push({
        name: 'Identity Integrity',
        passed: !!(agent.identity && agent.identity.id),
        detail: agent.identity ? `Identity: ${agent.identity.id.substring(0, 16)}...` : 'No identity'
      });

      // Check 3: Attestation consistency
      const attestations = agent.getAttestations ? agent.getAttestations() : [];
      checks.push({
        name: 'Attestation Count',
        passed: attestations.length > 0,
        detail: `${attestations.length} attestation(s) recorded`
      });

      // Check 4: No constraint violations
      const violations = this._detectViolations(agent);
      checks.push({
        name: 'Constraint Compliance',
        passed: violations.length === 0,
        detail: violations.length === 0 ? 'No violations' : `${violations.length} violation(s): ${violations.join(', ')}`
      });

      // Check 5: Trust score reasonableness
      checks.push({
        name: 'Trust Score Range',
        passed: score.value >= 0 && score.value <= 100,
        detail: `Score: ${score.value}`
      });

      const passed = checks.every(c => c.passed);
      return { agentId: agent.id, passed, checks, score: score.value, verifiedAt: isoNow() };
    }

    produceReport(agentId) {
      const score = this.scores.get(agentId);
      if (!score) return null;

      const trustLevel = score.value >= 80 ? 'High' :
                         score.value >= 60 ? 'Medium' :
                         score.value >= 40 ? 'Low' :
                         score.value >= 20 ? 'Critical' : 'Untrusted';

      return {
        agentId,
        score: score.value,
        trustLevel,
        factors: { ...score.factors },
        history: score.history.slice(-10),
        lastVerification: score.lastVerification,
        generatedAt: isoNow()
      };
    }

    compare(agentA, agentB) {
      const scoreA = this.scores.get(agentA.id) || new TrustScore(agentA.trustScore || 50);
      const scoreB = this.scores.get(agentB.id) || new TrustScore(agentB.trustScore || 50);

      const factorComparison = {};
      for (const factor of Object.keys(scoreA.factors)) {
        factorComparison[factor] = {
          [agentA.name]: scoreA.factors[factor],
          [agentB.name]: scoreB.factors[factor],
          winner: scoreA.factors[factor] > scoreB.factors[factor] ? agentA.name :
                  scoreA.factors[factor] < scoreB.factors[factor] ? agentB.name : 'tie'
        };
      }

      return {
        agentA: { id: agentA.id, name: agentA.name, score: scoreA.value },
        agentB: { id: agentB.id, name: agentB.name, score: scoreB.value },
        overallWinner: scoreA.value > scoreB.value ? agentA.name :
                       scoreA.value < scoreB.value ? agentB.name : 'tie',
        factorComparison,
        comparedAt: isoNow()
      };
    }

    getAllScores() {
      const result = {};
      for (const [agentId, score] of this.scores) {
        result[agentId] = {
          value: score.value,
          factors: score.factors,
          lastVerification: score.lastVerification
        };
      }
      return result;
    }

    // ── Factor Calculations ────────────────────────────────────────

    _calcConformance(agent) {
      let score = 50;

      // Bonus for having constraints
      if (agent.constraints && agent.constraints.length > 0) {
        score += Math.min(20, agent.constraints.length * 5);
      }

      // Bonus for active state (shows governance engagement)
      if (agent.state === 'Active') score += 15;
      else if (agent.state === 'Suspended') score -= 10;
      else if (agent.state === 'Terminated') score -= 20;

      // Bonus for having identity
      if (agent.identity) score += 10;

      return Math.min(100, Math.max(0, score));
    }

    _calcAttestation(agent) {
      const attestations = agent.getAttestations ? agent.getAttestations() : [];
      let score = 30;

      // More attestations = higher score (with diminishing returns)
      score += Math.min(50, Math.log2(attestations.length + 1) * 10);

      // Recency bonus
      if (attestations.length > 0) {
        const lastAttestation = attestations[attestations.length - 1];
        const age = Date.now() - new Date(lastAttestation.timestamp).getTime();
        if (age < 3600000) score += 15; // Within 1 hour
        else if (age < 86400000) score += 10; // Within 1 day
      }

      return Math.min(100, Math.max(0, score));
    }

    _calcCommunication(agent) {
      let score = 50;

      // Has communication permissions
      if (agent.communicationPermissions) {
        if (agent.communicationPermissions.canSend) score += 10;
        if (agent.communicationPermissions.canReceive) score += 10;
      }

      // Message activity
      const messages = agent.actionLog ? agent.actionLog.filter(a => a.type === 'sendMessage') : [];
      score += Math.min(20, messages.length * 5);

      return Math.min(100, Math.max(0, score));
    }

    _calcGoalCompletion(agent) {
      if (!agent.goals || agent.goals.length === 0) return 50;

      const achieved = agent.goals.filter(g => g.status === 'achieved').length;
      const total = agent.goals.length;
      const rate = achieved / total;

      return Math.round(rate * 80 + 20); // 20-100 range based on completion rate
    }

    _detectViolations(agent) {
      const violations = [];

      // Check constraint violations
      if (agent.constraints) {
        for (const constraint of agent.constraints) {
          if (constraint.type === 'no_goals' && agent.goals && agent.goals.length > (constraint.limit || 0)) {
            violations.push(`Goal limit exceeded: ${agent.goals.length} > ${constraint.limit}`);
          }
        }
      }

      // Check communication permission violations
      if (agent.actionLog) {
        for (const action of agent.actionLog) {
          if (action.type === 'sendMessage' && !agent.communicationPermissions?.canSend) {
            violations.push('Sent message without send permission');
          }
        }
      }

      return violations;
    }
  }

  return Object.freeze({
    TrustEngine,
    TrustScore
  });
})();
