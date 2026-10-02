import { useState } from "react";
import MilestoneItem from "./MilestoneItem";

function GoalCard({
  goal,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
  onAddAction,
  onToggleAction,
  onDeleteAction,
  onEdit,
  onDelete,
}) {
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const milestones = goal.milestones || [];

  const completedMilestones = milestones.filter(
    (milestone) => milestone.completed,
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
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
        {milestones.length > 0 && (
          <div className="milestone-progress">
            <p>
              {completedMilestones} of {milestones.length} completed —{" "}
              {progress}%
            </p>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Milestone progress"
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            goalId={goal.id}
            milestone={milestone}
            onToggleMilestone={onToggleMilestone}
            onDeleteMilestone={onDeleteMilestone}
            onAddAction={onAddAction}
            onToggleAction={onToggleAction}
            onDeleteAction={onDeleteAction}
          />
        ))}

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
