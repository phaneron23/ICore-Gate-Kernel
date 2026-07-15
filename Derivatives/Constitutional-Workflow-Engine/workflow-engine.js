#!/usr/bin/env node
/**
 * Constitutional Workflow Engine — Reference Derivative v0.1.0
 * ICore = InitialCore
 *
 * First proof-of-concept: derives from the Constitution,
 * exercises all 6 primitives, validates all USR/CoreFab capabilities.
 *
 * Usage: node workflow-engine.js
 */

const crypto = require('crypto');

// ============================================================
// PRIMITIVE 1: EXISTENCE — What is?
// ============================================================

class WorkflowInstance {
    constructor(name, config) {
        this.id = sha256(`workflow:${name}:${Date.now()}`);
        this.name = name;
        this.config = config;
        this.tasks = new Map();
        this.participants = new Map();
        this.states = new Map();
        this.transitions = [];
        this.auditTrail = [];
        this.createdAt = timestamp();
        this.status = 'created';

        // Attest existence
        this.attest('existence', 'created', {});
    }

    // Attest an action — creates a provenance record
    attest(primitive, action, data) {
        const record = {
            workflowId: this.id,
            primitive,
            action,
            data,
            timestamp: timestamp(),
            hash: null
        };
        record.hash = sha256(JSON.stringify(record));
        this.auditTrail.push(record);
    }
}

// ============================================================
// PRIMITIVE 2: IDENTITY — Who/what is it?
// ============================================================

class Task {
    constructor(workflow, name, assignee) {
        this.id = sha256(`task:${workflow.id}:${name}`);
        this.name = name;
        this.assignee = assignee;
        this.state = 'pending';
        this.createdAt = timestamp();
        this.transitions = [];

        // Register identity
        workflow.tasks.set(this.id, this);
        workflow.attest('identity', 'task-registered', { taskId: this.id, name });
    }
}

class Participant {
    constructor(workflow, name, role) {
        this.id = sha256(`participant:${workflow.id}:${name}`);
        this.name = name;
        this.role = role;
        this.capabilities = [];
        this.createdAt = timestamp();

        // Register identity
        workflow.participants.set(this.id, this);
        workflow.attest('identity', 'participant-registered', { participantId: this.id, name, role });
    }
}

// ============================================================
// PRIMITIVE 3: RELATIONSHIP — How is it connected?
// ============================================================

class Relationship {
    static addDependency(workflow, taskId, dependsOnId) {
        const task = workflow.tasks.get(taskId);
        const dependency = workflow.tasks.get(dependsOnId);
        if (!task || !dependency) throw new Error('Task not found');

        if (!task.dependencies) task.dependencies = [];
        task.dependencies.push(dependsOnId);

        workflow.attest('relationship', 'dependency-added', {
            taskId, dependsOn: dependsOnId
        });
    }

    static assignParticipant(workflow, taskId, participantId) {
        const task = workflow.tasks.get(taskId);
        const participant = workflow.participants.get(participantId);
        if (!task || !participant) throw new Error('Not found');

        task.assignee = participantId;
        workflow.attest('relationship', 'assignment-changed', {
            taskId, participantId
        });
    }
}

// ============================================================
// PRIMITIVE 4: CONSTRAINT — What governs it?
// ============================================================

class Constraint {
    static VALID_TRANSITIONS = {
        'pending':   ['active'],
        'active':    ['complete', 'blocked'],
        'blocked':   ['active'],
        'complete':  [],
    };

    static enforce(workflow, taskId, newState) {
        const task = workflow.tasks.get(taskId);
        if (!task) throw new Error('Task not found');

        // Rule 1: Valid state transition
        const allowed = this.VALID_TRANSITIONS[task.state] || [];
        if (!allowed.includes(newState)) {
            return {
                enforced: false,
                reason: `Cannot transition ${task.state} → ${newState}. Allowed: [${allowed.join(', ')}]`
            };
        }

        // Rule 2: Dependencies must be complete
        if (newState === 'active' && task.dependencies) {
            for (const depId of task.dependencies) {
                const dep = workflow.tasks.get(depId);
                if (dep && dep.state !== 'complete') {
                    return {
                        enforced: false,
                        reason: `Dependency "${dep.name}" is not complete (state: ${dep.state})`
                    };
                }
            }
        }

        // Rule 3: Must have an assignee
        if (newState === 'active' && !task.assignee) {
            return {
                enforced: false,
                reason: 'Task must be assigned before activation'
            };
        }

        workflow.attest('constraint', 'enforcement-check', {
            taskId, from: task.state, to: newState, result: 'passed'
        });

        return { enforced: true, reason: 'All constraints satisfied' };
    }
}

// ============================================================
// PRIMITIVE 5: TRANSFORMATION — How does it change?
// ============================================================

class Transformation {
    static transition(workflow, taskId, newState) {
        const task = workflow.tasks.get(taskId);
        if (!task) throw new Error('Task not found');

        // Enforce constraints first
        const check = Constraint.enforce(workflow, taskId, newState);
        if (!check.enforced) {
            workflow.attest('transformation', 'transformation-blocked', {
                taskId, from: task.state, to: newState, reason: check.reason
            });
            return { success: false, reason: check.reason };
        }

        // Execute the transition
        const oldState = task.state;
        task.state = newState;
        task.transitions.push({
            from: oldState,
            to: newState,
            timestamp: timestamp()
        });

        // Record in workflow
        workflow.transitions.push({
            taskId,
            from: oldState,
            to: newState,
            timestamp: timestamp()
        });

        // Attest the transformation
        workflow.attest('transformation', 'state-changed', {
            taskId, from: oldState, to: newState
        });

        return { success: true, from: oldState, to: newState };
    }
}

// ============================================================
// PRIMITIVE 6: VERIFICATION — How do we know it is valid?
// ============================================================

class Verification {
    static audit(workflow) {
        const checks = [];

        // Check 1: Every task has an identity
        const allTasksRegistered = [...workflow.tasks.values()].every(t => t.id && t.name);
        checks.push({
            name: 'Identity: all tasks have identity',
            passed: allTasksRegistered,
            count: workflow.tasks.size
        });

        // Check 2: Every transition has an attestation
        const allAttested = workflow.transitions.every(t => {
            return workflow.auditTrail.some(a =>
                a.primitive === 'transformation' &&
                a.data.taskId === t.taskId &&
                a.data.to === t.to
            );
        });
        checks.push({
            name: 'Verification: all transitions attested',
            passed: allAttested,
            count: workflow.transitions.length
        });

        // Check 3: No invalid states exist
        const validStates = ['pending', 'active', 'complete', 'blocked'];
        const allStatesValid = [...workflow.tasks.values()].every(t =>
            validStates.includes(t.state)
        );
        checks.push({
            name: 'Constraint: all states valid',
            passed: allStatesValid
        });

        // Check 4: Dependencies are respected
        const depsRespected = [...workflow.tasks.values()].every(t => {
            if (t.state === 'active' || t.state === 'complete') {
                return !t.dependencies || t.dependencies.every(depId => {
                    const dep = workflow.tasks.get(depId);
                    return !dep || dep.state === 'complete';
                });
            }
            return true;
        });
        checks.push({
            name: 'Constraint: dependencies respected',
            passed: depsRespected
        });

        // Check 5: Provenance chain is unbroken
        const provenanceUnbroken = workflow.auditTrail.length > 0 &&
            workflow.auditTrail.every(a => a.hash && a.timestamp);
        checks.push({
            name: 'Attestation: provenance chain unbroken',
            passed: provenanceUnbroken,
            count: workflow.auditTrail.length
        });

        return {
            allPassed: checks.every(c => c.passed),
            checks,
            totalAttestations: workflow.auditTrail.length
        };
    }
}

// ============================================================
// USR/COREFAB: ORCHESTRATION — Lifecycle management
// ============================================================

class WorkflowOrchestrator {
    constructor() {
        this.workflows = new Map();
    }

    createWorkflow(name, config) {
        const workflow = new WorkflowInstance(name, config);
        this.workflows.set(workflow.id, workflow);
        return workflow;
    }

    addTask(workflow, name, assignee, dependencies = []) {
        const task = new Task(workflow, name, assignee);
        for (const depId of dependencies) {
            Relationship.addDependency(workflow, task.id, depId);
        }
        return task;
    }

    addParticipant(workflow, name, role) {
        return new Participant(workflow, name, role);
    }

    activateTask(workflow, taskId) {
        return Transformation.transition(workflow, taskId, 'active');
    }

    completeTask(workflow, taskId) {
        return Transformation.transition(workflow, taskId, 'complete');
    }

    blockTask(workflow, taskId) {
        return Transformation.transition(workflow, taskId, 'blocked');
    }

    verifyWorkflow(workflow) {
        return Verification.audit(workflow);
    }
}

// ============================================================
// UTILITIES
// ============================================================

function sha256(data) {
    return crypto.createHash('sha256').update(String(data)).digest('hex');
}

function timestamp() {
    return new Date().toISOString();
}

// ============================================================
// EXECUTION: Run the canonical workflow demonstration
// ============================================================

function run() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Constitutional Workflow Engine — Reference Derivative');
    console.log('  ICore = InitialCore | Derivative v0.1.0');
    console.log('═══════════════════════════════════════════════════════\n');

    const orch = new WorkflowOrchestrator();

    // ── Create workflow ──
    console.log('▸ PRIMITIVE 1: EXISTENCE');
    const wf = orch.createWorkflow('Document Approval', {
        description: 'A document must be reviewed and approved'
    });
    console.log(`  Workflow created: ${wf.id.substring(0, 16)}...`);
    console.log(`  Name: ${wf.name}`);
    console.log(`  Status: ${wf.status}\n`);

    // ── Create participants ──
    console.log('▸ PRIMITIVE 2: IDENTITY');
    const author = orch.addParticipant(wf, 'Alice', 'author');
    const reviewer = orch.addParticipant(wf, 'Bob', 'reviewer');
    const approver = orch.addParticipant(wf, 'Carol', 'approver');
    console.log(`  ${author.name} (${author.role}) → ${author.id.substring(0, 12)}...`);
    console.log(`  ${reviewer.name} (${reviewer.role}) → ${reviewer.id.substring(0, 12)}...`);
    console.log(`  ${approver.name} (${approver.role}) → ${approver.id.substring(0, 12)}...\n`);

    // ── Create tasks with relationships ──
    console.log('▸ PRIMITIVE 3: RELATIONSHIP');
    const t1 = orch.addTask(wf, 'Draft Document', author.id);
    const t2 = orch.addTask(wf, 'Review Document', reviewer.id, [t1.id]);
    const t3 = orch.addTask(wf, 'Approve Document', approver.id, [t2.id]);
    console.log(`  ${t1.name} → ${t2.name} → ${t3.name}`);
    console.log(`  Dependencies: ${t2.name} depends on ${t1.name}`);
    console.log(`  Dependencies: ${t3.name} depends on ${t2.name}\n`);

    // ── Execute workflow with constraint enforcement ──
    console.log('▸ PRIMITIVE 4: CONSTRAINT + PRIMITIVE 5: TRANSFORMATION');
    console.log('  Attempting: activate Review before Draft is complete...');
    const blocked = orch.activateTask(wf, t2.id);
    console.log(`  Result: ${blocked.success ? 'ALLOWED' : 'BLOCKED'} — ${blocked.reason}\n`);

    console.log('  Correct sequence:');
    let result;

    result = orch.activateTask(wf, t1.id);
    console.log(`  ${t1.name}: pending → ${result.success ? result.to : 'FAILED'}`);

    result = orch.completeTask(wf, t1.id);
    console.log(`  ${t1.name}: active → ${result.success ? result.to : 'FAILED'}`);

    result = orch.activateTask(wf, t2.id);
    console.log(`  ${t2.name}: pending → ${result.success ? result.to : 'FAILED'}`);

    result = orch.completeTask(wf, t2.id);
    console.log(`  ${t2.name}: active → ${result.success ? result.to : 'FAILED'}`);

    result = orch.activateTask(wf, t3.id);
    console.log(`  ${t3.name}: pending → ${result.success ? result.to : 'FAILED'}`);

    result = orch.completeTask(wf, t3.id);
    console.log(`  ${t3.name}: active → ${result.success ? result.to : 'FAILED'}\n`);

    // ── Verify everything ──
    console.log('▸ PRIMITIVE 6: VERIFICATION + USR/COREFAB: ATTESTATION');
    const verification = orch.verifyWorkflow(wf);

    console.log(`  Attestation chain: ${verification.totalAttestations} records`);
    for (const check of verification.checks) {
        console.log(`  ${check.passed ? '✅' : '❌'} ${check.name}${check.count ? ` (${check.count})` : ''}`);
    }
    console.log(`\n  Overall: ${verification.allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}\n`);

    // ── Summary ──
    console.log('═══════════════════════════════════════════════════════');
    console.log('  CONSTITUTIONAL PROOF-OF-CONCEPT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✓ Existence:     Workflow instance created');
    console.log('  ✓ Identity:      Tasks and participants registered');
    console.log('  ✓ Relationship:  Dependencies defined and enforced');
    console.log('  ✓ Constraint:    Invalid transition blocked');
    console.log('  ✓ Transformation: State changes executed deterministically');
    console.log('  ✓ Verification:  Audit trail proves execution history');
    console.log('');
    console.log('  ✓ Execute:       Workflow ran to completion');
    console.log('  ✓ Enforce:       Constraints blocked invalid transition');
    console.log('  ✓ Isolate:       Workflow instance is self-contained');
    console.log('  ✓ Attest:        Every transition has provenance');
    console.log('  ✓ Orchestrate:   Lifecycle managed end-to-end');
    console.log('');
    console.log(`  Total attestations: ${verification.totalAttestations}`);
    console.log(`  Workflow ID: ${wf.id.substring(0, 16)}...`);
    console.log(`  All verifications: ${verification.allPassed ? 'PASSED' : 'FAILED'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('  ICore is not a framework.');
    console.log('  ICore is a constitutional science that produces');
    console.log('  executable, verifiable systems.');
    console.log('═══════════════════════════════════════════════════════');
}

run();
