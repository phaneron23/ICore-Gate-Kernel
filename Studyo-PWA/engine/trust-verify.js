// ICore Studyo — Trust Verification Engine v0.1.0
// The core engine that verifies trust claims against the constitutional framework.

window.TrustVerifier = {
  version: '0.1.0',

  // Analyze a trust claim — extract structured data from text
  analyzeClaim(text) {
    const lower = text.toLowerCase();
    
    // Build a structured claim from natural language
    const claim = {
      id: 'claim-' + Date.now(),
      text: text,
      timestamp: new Date().toISOString(),
      
      // USCP grounding
      definition: text,
      origin: text.length > 0 ? ['user-input'] : [],
      identity: { unique: true, id: 'claim-' + Date.now() },
      relationships: [],
      constraints: {},
      lifecycle: { state: 'Proposed', governed: true },
      verification: [],
      
      // Epistemic properties
      knowledge: text.length > 0 ? [text] : [],
      citations: [],
      epistemic: { humble: true },
      
      // Derivation
      derivation: {
        chain: [],
        direction: 'downward',
        valid: true
      },
      
      // Structure
      structure: { consistent: true },
      
      // Expression (UCL 5-field)
      expression: {
        Subject: 'Trust Claim',
        Predicate: 'asserts',
        Object: text,
        Source: 'user-input',
        Context: 'trust-verification'
      },
      
      // Reference
      reference: 'claim-' + Date.now(),
      
      // Standards
      standards: 'ICore Kernel v1.0'
    };

    // Detect keywords to enrich the claim
    const keywords = this.extractKeywords(lower);
    claim.keywords = keywords;

    // If claim mentions sources/evidence, add citations
    if (lower.includes('because') || lower.includes('evidence') || lower.includes('test')) {
      claim.citations.push({ source: 'claim-text', detail: 'Claim references evidence' });
    }

    // If claim mentions derivation/chain
    if (lower.includes('derived') || lower.includes('chain') || lower.includes('trace')) {
      claim.derivation.chain.push('user-declared-derivation');
    }

    // If claim mentions verification
    if (lower.includes('verified') || lower.includes('test') || lower.includes('pass')) {
      claim.verification.push({ type: 'user-declared', result: 'passed' });
    }

    // If claim mentions relationships
    if (lower.includes('depends') || lower.includes('requires') || lower.includes('because')) {
      claim.relationships.push({ type: 'dependency', target: 'evidence' });
    }

    return claim;
  },

  // Extract meaningful keywords from claim text
  extractKeywords(lower) {
    const constitutionalTerms = [
      'uscp', 'usc', 'kernel', 'constitution', 'primitives',
      'uce', 'epistemology', 'evidence', 'knowledge', 'citation',
      'ucc', 'calculus', 'derivation', 'reasoning', 'logic',
      'ucm', 'mathematics', 'structure', 'graph', 'category',
      'ucl', 'language', 'expression', 'vocabulary',
      'ucrs', 'reference', 'coordinate', 'address',
      'ucmodels', 'model', 'entity', 'relationship',
      'urs', 'representation',
      'uvs', 'visualization',
      'trust', 'verification', 'conformance', 'certified',
      'gpg', 'signed', 'immutable', 'provenance'
    ];

    return constitutionalTerms.filter(term => lower.includes(term));
  },

  // Full verification pipeline
  verify(text) {
    // Step 1: Analyze the claim
    const claim = this.analyzeClaim(text);

    // Step 2: USCP grounding (6 tests)
    const uscpResults = USCP.verify(claim);
    const uscpScore = USCP.groundingScore(claim);

    // Step 3: USC compliance (10 rules)
    const uscResults = USC.verify(claim);
    const uscScore = USC.complianceScore(claim);

    // Step 4: Sciences verification
    const scienceResults = Sciences.verify(claim);

    // Step 5: UCRS reference check
    const ucrsResults = UCRS.verify();

    // Step 6: UCModels model check
    const model = UCModels.buildModel(claim);
    const modelResults = UCModels.verifyModel(model);

    // Step 7: ICS conformance (57 tests)
    const icsResults = ICS.runAll(claim);
    const icsSummary = ICS.summarize(icsResults);

    // Step 8: Calculate trust level
    const trust = this.calculateTrust(uscpScore, uscScore, icsSummary);

    return {
      claim,
      results: {
        uscp: { score: uscpScore, max: 6, details: uscpResults },
        usc: { score: uscScore, max: 10, details: uscResults },
        sciences: scienceResults,
        ucrs: ucrsResults,
        model: { details: modelResults },
        ics: { summary: icsSummary, details: icsResults }
      },
      trust,
      timestamp: new Date().toISOString()
    };
  },

  // Calculate overall trust level
  calculateTrust(uscpScore, uscScore, icsSummary) {
    // Weighted scoring
    const uscpWeight = 0.25;  // 25% — foundational primitives
    const uscWeight = 0.25;   // 25% — constitutional rules
    const icsWeight = 0.50;   // 50% — conformance suite

    const uscpPercent = uscpScore / 6;
    const uscPercent = uscScore / 10;
    const icsPercent = icsSummary.passed / icsSummary.total;

    const weightedScore = (
      uscpPercent * uscpWeight +
      uscPercent * uscWeight +
      icsPercent * icsWeight
    );

    const score = Math.round(weightedScore * 100);

    let level, label;
    if (score >= 80) {
      level = 'verified';
      label = 'VERIFIED';
    } else if (score >= 50) {
      level = 'partial';
      label = 'PARTIAL';
    } else if (score >= 20) {
      level = 'unverified';
      label = 'UNVERIFIED';
    } else {
      level = 'unknown';
      label = 'UNKNOWN';
    }

    return {
      score,
      level,
      label,
      breakdown: {
        uscp: Math.round(uscpPercent * 100),
        usc: Math.round(uscPercent * 100),
        ics: Math.round(icsPercent * 100)
      }
    };
  }
};
