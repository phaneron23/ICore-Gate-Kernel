// UAS — Agent Builder UI v1.0.0
window.UASBuilder = (() => {
  'use strict';

  let goals = [];
  let constraints = [];

  function render(container, ctx) {
    goals = [];
    constraints = [];

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Agent Builder</h2>
        <button class="btn" onclick="window.UASUtils.navigate('agents')">← Back to Agents</button>
      </div>

      <div class="card">
        <div style="font-weight: 600; margin-bottom: 1rem; font-size: 0.9rem;">Create New Sovereign Agent</div>

        <!-- Basic Info -->
        <div class="grid-2col">
          <div class="input-group">
            <label>Agent Name *</label>
            <input type="text" id="agentName" placeholder="e.g. Research Agent Alpha" maxlength="64">
          </div>
          <div class="input-group">
            <label>Description</label>
            <input type="text" id="agentDescription" placeholder="Brief purpose of this agent">
          </div>
        </div>

        <!-- Goals Section -->
        <div style="margin-top: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Goals</label>
            <button class="btn btn-sm" id="addGoalBtn">+ Add Goal</button>
          </div>
          <div id="goalsList"></div>
        </div>

        <!-- Constraints Section -->
        <div style="margin-top: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Constraints</label>
            <button class="btn btn-sm" id="addConstraintBtn">+ Add Constraint</button>
          </div>
          <div id="constraintsList"></div>
        </div>

        <!-- Communication Permissions -->
        <div style="margin-top: 0.75rem;">
          <label style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">Communication Permissions</label>
          <div style="display: flex; gap: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="permCanSend" checked> Can Send
            </label>
            <label style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="permCanReceive" checked> Can Receive
            </label>
          </div>
        </div>

        <!-- Create Button -->
        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
          <button class="btn btn-primary" id="createAgentBtn" style="flex: 1;">
            Register Agent
          </button>
          <button class="btn" onclick="window.UASUtils.navigate('agents')">Cancel</button>
        </div>
      </div>
    `;

    // Wire up event handlers
    document.getElementById('addGoalBtn').onclick = () => addGoalField();
    document.getElementById('addConstraintBtn').onclick = () => addConstraintField();
    document.getElementById('createAgentBtn').onclick = () => handleCreate(ctx);

    // Add one empty goal and one constraint to start
    addGoalField();
    addConstraintField();
  }

  function addGoalField() {
    const id = 'goal-' + Date.now();
    goals.push({ id, title: '', description: '' });
    renderGoalsList();
  }

  function removeGoalField(goalId) {
    goals = goals.filter(g => g.id !== goalId);
    renderGoalsList();
  }

  function renderGoalsList() {
    const list = document.getElementById('goalsList');
    if (!list) return;

    if (goals.length === 0) {
      list.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem;">No goals defined</div>';
      return;
    }

    list.innerHTML = goals.map((goal, index) => `
      <div class="goal-card" style="flex-wrap: wrap; gap: 0.5rem;">
        <span class="goal-text" style="min-width: 20px; font-weight: 600; color: var(--text-muted);">${index + 1}.</span>
        <input type="text" placeholder="Goal title" value="${escapeAttr(goal.title)}"
               style="flex: 1; min-width: 150px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.3rem 0.5rem; color: var(--text-primary); font-size: 0.82rem;"
               onchange="updateGoal('${goal.id}', 'title', this.value)">
        <span class="goal-remove" onclick="removeGoalField('${goal.id}')">×</span>
      </div>
    `).join('');
  }

  function addConstraintField() {
    const id = 'constraint-' + Date.now();
    constraints.push({ id, name: '', type: 'custom', value: '' });
    renderConstraintsList();
  }

  function removeConstraintField(constraintId) {
    constraints = constraints.filter(c => c.id !== constraintId);
    renderConstraintsList();
  }

  function renderConstraintsList() {
    const list = document.getElementById('constraintsList');
    if (!list) return;

    if (constraints.length === 0) {
      list.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem;">No constraints defined</div>';
      return;
    }

    list.innerHTML = constraints.map((constraint, index) => `
      <div class="goal-card" style="flex-wrap: wrap; gap: 0.5rem;">
        <span class="goal-text" style="min-width: 20px; font-weight: 600; color: var(--text-muted);">${index + 1}.</span>
        <input type="text" placeholder="Constraint name" value="${escapeAttr(constraint.name)}"
               style="flex: 1; min-width: 120px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.3rem 0.5rem; color: var(--text-primary); font-size: 0.82rem;"
               onchange="updateConstraint('${constraint.id}', 'name', this.value)">
        <select style="background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.3rem 0.5rem; color: var(--text-primary); font-size: 0.8rem;"
                onchange="updateConstraint('${constraint.id}', 'type', this.value)">
          <option value="custom" ${constraint.type === 'custom' ? 'selected' : ''}>Custom</option>
          <option value="blocked_actions" ${constraint.type === 'blocked_actions' ? 'selected' : ''}>Blocked Actions</option>
          <option value="no_goals" ${constraint.type === 'no_goals' ? 'selected' : ''}>Goal Limit</option>
        </select>
        <span class="goal-remove" onclick="removeConstraintField('${constraint.id}')">×</span>
      </div>
    `).join('');
  }

  // Global form helpers
  window.updateGoal = function(goalId, field, value) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) goal[field] = value;
  };

  window.updateConstraint = function(constraintId, field, value) {
    const constraint = constraints.find(c => c.id === constraintId);
    if (constraint) constraint[field] = value;
  };

  window.removeGoalField = removeGoalField;
  window.removeConstraintField = removeConstraintField;

  async function handleCreate(ctx) {
    const { registry } = ctx;

    const name = document.getElementById('agentName').value.trim();
    const description = document.getElementById('agentDescription').value.trim();
    const canSend = document.getElementById('permCanSend').checked;
    const canReceive = document.getElementById('permCanReceive').checked;

    // Validation
    if (!name) {
      window.UASUtils.showToast('Agent name is required', 'error');
      document.getElementById('agentName').focus();
      return;
    }

    if (name.length < 2) {
      window.UASUtils.showToast('Agent name must be at least 2 characters', 'error');
      return;
    }

    // Build agent config
    const agentConfig = {
      name,
      description,
      constraints: constraints
        .filter(c => c.name)
        .map(c => ({
          name: c.name,
          type: c.type,
          actions: c.type === 'blocked_actions' ? c.value.split(',').map(s => s.trim()) : undefined,
          limit: c.type === 'no_goals' ? parseInt(c.value) || 5 : undefined
        })),
      communicationPermissions: {
        canSend,
        canReceive,
        allowedRecipients: 'all'
      }
    };

    try {
      // Create agent
      const agent = await registry.create(agentConfig);

      // Add goals
      for (const goal of goals) {
        if (goal.title) {
          await agent.addGoal({ title: goal.title, description: goal.description });
        }
      }

      // Activate agent
      await agent.activate();

      // Save to IndexedDB
      await window.UASUtils.dbPut('agents', agent.toJSON());

      // Log
      await window.UASUtils.addLog('agent', `Agent '${name}' created and activated`, { agentId: agent.id });

      window.UASUtils.showToast(`Agent '${name}' created successfully`, 'success');
      window.UASUtils.navigate('agents');

    } catch (err) {
      window.UASUtils.showToast(`Error: ${err.message}`, 'error');
    }
  }

  function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return Object.freeze({ render });
})();
