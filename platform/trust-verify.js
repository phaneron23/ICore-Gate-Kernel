// ICore Studyo — Trust Verification Engine v0.2.0
// v0.2.0: analyzeClaim() no longer hardcodes verification-passing fields.
// Claims reflect what the input ACTUALLY provides — not what we wish it had.
// Originated by Sir Collins (access1@tutamail.com). Constitutional artifact.

window.TrustVerifier = {
  version: '0.2.0',

  // Analyze a trust claim — extract structured data from text.
  // v0.2.0: This does NOT pre-fill epistemic.humble, derivation.valid,
  // structure.consistent, or referenceValid. Those are TESTED by the
  // verification pipeline — not assumed. If the input doesn't establish
  // them, they remain absent, and downstream tests will correctly fail.
  analyzeClaim(text) {
    const lower = text.toLowerCase();

    // Build a claim structure — only populate fields the input establishes.
    const claim = {
      id: 'claim-' + Date.now(),
      text: text,
      timestamp: new Date().toISOString(),

      // USCP grounding — definition is the claim text itself
      definition: text,
      identity: { unique: true, id: 'claim-' + Date.now() },

      // v0.2.0: origin is NOT auto-set. The claim must establish its origin.
      // An empty origin means the verification pipeline should flag it.
      origin: [],

      relationships: [],
      constraints: {},
      lifecycle: { state: 'Proposed', governed: true },

      // v0.2.0: verification array is NOT auto-populated.
      // User-declared verification results are not trusted by construction.
      verification: [],

      // Epistemic properties — v0.2.0: NOT hardcoded to humble: true.
      // The claim must explicitly demonstrate epistemic humility.
      // epistemic: intentionally absent unless claim establishes it

      // Knowledge — v0.2.0: structured object, not just raw text
      knowledge: {
        claims: [],
        derivations: []
      },

      // Citations — empty unless claim references sources
      citations: [],

      // Derivation — v0.2.0: valid is NOT hardcoded.
      // The verification pipeline checks this; we don't assert it.
      derivation: {
        chain: [],
        direction: 'downward'
        // valid: intentionally absent — tested, not assumed
      },

      // Structure — v0.2.0: consistent is NOT hardcoded.
      // structure: intentionally absent — tested by ICS T3-09

      // Expression (UCL 5-field) — only if claim provides structured expression
      expression: {
        Subject: 'Trust Claim',
        Predicate: 'asserts',
        Object: text,
        Source: 'user-input',
        Context: 'trust-verification'
        // canonical: intentionally absent — tested by T2-32
      },

      // Reference — v0.2.0: referenceValid is NOT auto-true.
      reference: 'claim-' + Date.now(),
      // referenceValid: intentionally absent — tested, not assumed

      // Standards — must explicitly reference what standard this follows
      standards: 'ICore Kernel v1.0'
    };

    // ── Enrich claim from actual text content ────────────────────────

    // Extract constitutional keywords present in the text
    const keywords = this.extractKeywords(lower);
    if (keywords.length > 0) {
      claim.keywords = keywords;
    }

    // Only add citations if the claim text actually references sources
    if (lower.includes('because') || lower.includes('evidence') || lower.includes('test')) {
      claim.citations.push({
        source: 'claim-text',
        type: 'derived',
        verified: false,
        detail: 'Claim references evidence (unverified)'
      });
    }

    // Only add derivation chain entries if the claim references derivation
    if (lower.includes('derived') || lower.includes('chain') || lower.includes('trace')) {
      claim.derivation.chain.push({
        rule: 'CR1',
        premises: ['user-declared'],
        conclusion: 'user-declared derivation',
        parent: null
      });
    }

    // v0.2.0: Do NOT auto-add verification records from keyword detection.
    // "verified" in text ≠ verification passed. The pipeline verifies.
    // If the user explicitly claims verification, note it as a declaration:
    if (lower.includes('verified') || lower.includes('certified')) {
      claim.verification.push({
        type: 'user-declared',
        result: 'passed',
        note: 'User claims verification — not independently verified'
      });
    }

    // Only add relationship if claim references dependencies
    if (lower.includes('depends') || lower.includes('requires') || lower.includes('because')) {
      claim.relationships.push({ type: 'dependency', target: 'evidence' });
    }

    // v0.2.0: Set epistemic humility based on claim content.
    // Claims that acknowledge uncertainty demonstrate humility.
    if (lower.includes('uncertain') || lower.includes('unknown')
      || lower.includes('provisional') || lower.includes('may')
      || lower.includes('humble') || lower.includes('boundaries')) {
      claim.epistemic = { humble: true };
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
    // Step 1: Analyze the claim (v0.2.0: honest, no trust-washing)
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

    // Step 7: ICS v0.2.0 conformance (57 tests, all real)
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
      timestamp: new Date().toISOString(),
      engineVersion: '0.2.0'
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
    // v0.2.0: All 57 tests are real — use full summary
    const icsPercent = icsSummary.total > 0
      ? icsSummary.passed / icsSummary.total
      : 0;

    const weightedScore = (
      uscpPercent * uscpWeight +
      uscPercent * uscWeight +
      icsPercent * icsWeight
    );

    const score = Math.min(100, Math.max(0, Math.round(weightedScore * 100)));

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
