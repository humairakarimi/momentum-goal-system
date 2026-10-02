import { useState } from "react";

function MilestoneItem({
  goalId,
  milestone,
  onToggleMilestone,
  onAddAction,
  onToggleAction,
  onDeleteAction,
}) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionTitle, setActionTitle] = useState("");

  const actions = milestone.actions || [];

  function handleActionSubmit(event) {
    event.preventDefault();

    onAddAction(goalId, milestone.id, actionTitle);

    setActionTitle("");
    setShowActionForm(false);
  }

  function handleCancelAction() {
    setActionTitle("");
    setShowActionForm(false);
  }

  return (
    <li
      className={
        milestone.completed
          ? "milestone-item milestone-completed"
          : "milestone-item"
      }
    >
      <label className="milestone-label">
        <input
          type="checkbox"
          checked={milestone.completed}
          onChange={() => onToggleMilestone(goalId, milestone.id)}
        />

        <span>{milestone.title}</span>
      </label>

      <div className="actions">
        <h5>Actions</h5>

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

                <button
                  type="button"
                  className="delete-action-button"
                  onClick={() =>
                    onDeleteAction(goalId, milestone.id, action.id)
                  }
                >
                  Delete
                </button>
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
              placeholder="Enter a daily action"
              value={actionTitle}
              onChange={(event) => setActionTitle(event.target.value)}
              required
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
