import { useState } from "react";

function MilestoneItem({
  goalId,
  milestone,
  onAddAction,
  onDeleteMilestone,
  onToggleAction,
  onDeleteAction,
  onToggleToday,
}) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionTitle, setActionTitle] = useState("");

  const actions = milestone.actions || [];
  const completedActions = actions.filter(
    (action) => action.completed,
  ).length;

  const actionProgress = actions.length
    ? Math.round((completedActions / actions.length) * 100)
    : 0;

  async function handleActionSubmit(event) {
    event.preventDefault();

    const title = actionTitle.trim();
    if (!title) return;

    await onAddAction(goalId, milestone.id, title);

    setActionTitle("");
    setShowActionForm(false);
  }

  function handleCancelAction() {
    setActionTitle("");
    setShowActionForm(false);
  }

  return (
    <li className="milestone-item milestone-style-one">
      <div className="milestone-heading">
        <div className="milestone-title-group">
          <p className="milestone-eyebrow">Milestone</p>
          <h5 className="milestone-title">{milestone.title}</h5>
        </div>

        <div className="milestone-header-controls">
          <span
            className={`milestone-status ${
              milestone.completed ? "is-complete" : ""
            }`}
          >
            {milestone.completed ? "Completed" : "In progress"}
          </span>

          <button
            type="button"
            className="delete-milestone-button"
            onClick={() => onDeleteMilestone(goalId, milestone.id)}
            aria-label={`Delete milestone: ${milestone.title}`}
          >
            <span aria-hidden="true">🗑</span>
          </button>
        </div>
      </div>

      <div className="actions">
        <h6 className="actions-heading">Actions</h6>

        {actions.length > 0 && (
          <div className="action-progress">
            <p>
              {completedActions} of {actions.length} completed —{" "}
              {actionProgress}%
            </p>

            <div
              className="action-progress-track"
              role="progressbar"
              aria-valuenow={actionProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Action progress"
            >
              <div
                className="action-progress-fill"
                style={{ width: `${actionProgress}%` }}
              />
            </div>
          </div>
        )}

        {actions.length > 0 ? (
          <ul className="actions-list">
            {actions.map((action) => (
              <li
                key={action.id}
                className={action.completed ? "action-completed" : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={action.completed}
                    onChange={() =>
                      onToggleAction(goalId, milestone.id, action.id)
                    }
                  />
                  <span>{action.title}</span>
                </label>

                <div className="action-buttons">
                  <button
                    type="button"
                    className={`today-button ${
                      action.isToday ? "selected" : ""
                    }`}
                    aria-pressed={Boolean(action.isToday)}
                    aria-label={`${
                      action.isToday ? "Remove from" : "Add to"
                    } Today: ${action.title}`}
                    title={
                      action.isToday
                        ? "Remove from Today"
                        : "Add to Today"
                    }
                    onClick={() =>
                      onToggleToday(goalId, milestone.id, action.id)
                    }
                  >
                    <span aria-hidden="true">
                      {action.isToday ? "✓" : "+"}
                    </span>
                    Today
                  </button>

                  <button
                    type="button"
                    className="delete-action-button"
                    onClick={() =>
                      onDeleteAction(goalId, milestone.id, action.id)
                    }
                    aria-label={`Delete action: ${action.title}`}
                  >
                    <span aria-hidden="true">🗑</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No actions added yet.</p>
        )}

        {showActionForm ? (
          <form onSubmit={handleActionSubmit}>
            <input
              type="text"
              aria-label="New action title"
              placeholder="Enter a daily action"
              value={actionTitle}
              onChange={(event) => setActionTitle(event.target.value)}
              required
              autoFocus
            />

            <div className="action-form-buttons">
              <button type="submit">Save action</button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelAction}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="action-button"
            onClick={() => setShowActionForm(true)}
          >
            Add action
          </button>
        )}
      </div>
    </li>
  );
}

export default MilestoneItem;