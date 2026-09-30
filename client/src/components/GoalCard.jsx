import { useState } from "react";

function GoalCard({ goal, onAddMilestone, onEdit, onDelete }) {
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  function handleMilestoneSubmit(event) {
    event.preventDefault();

    onAddMilestone(goal.id, milestoneTitle);

    setMilestoneTitle("");
    setShowMilestoneForm(false);
  }

  function handleCancelMilestone() {
    setMilestoneTitle("");
    setShowMilestoneForm(false);
  }

  return (
    <article className="goal-card">
      <h3>{goal.title}</h3>
      <p>{goal.description}</p>

      <p>
        <strong>Target date:</strong> {goal.targetDate}
      </p>

      <div className="milestones">
        <h4>Milestones</h4>

        {(goal.milestones || []).length > 0 ? (
          <ul>
            {(goal.milestones || []).map((milestone) => (
              <li key={milestone.id}>{milestone.title}</li>
            ))}
          </ul>
        ) : (
          <p>No milestones added yet.</p>
        )}

        {showMilestoneForm ? (
          <form onSubmit={handleMilestoneSubmit}>
            <input
              type="text"
              placeholder="Enter a milestone"
              value={milestoneTitle}
              onChange={(event) => setMilestoneTitle(event.target.value)}
              required
            />

            <div className="milestone-actions">
              <button type="submit">Save milestone</button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelMilestone}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="milestone-button"
            onClick={() => setShowMilestoneForm(true)}
          >
            Add milestone
          </button>
        )}
      </div>

      <button
        type="button"
        className="edit-button"
        onClick={() => onEdit(goal)}
      >
        Edit
      </button>

      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(goal.id)}
      >
        Delete
      </button>
    </article>
  );
}

export default GoalCard;
