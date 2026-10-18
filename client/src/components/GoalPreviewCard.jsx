import { Link } from "react-router-dom";

function GoalPreviewCard({ goal }) {
  const milestones = goal.milestones || [];
  const completed = milestones.filter(
    (milestone) => milestone.completed,
  ).length;

  const progress = milestones.length
    ? Math.round((completed / milestones.length) * 100)
    : 0;

  return (
    <Link
      to={`/goals/${goal.id}`}
      className="goal-preview-card"
    >
      <div className="goal-preview-heading">
        <h3>{goal.title}</h3>
        <span className="goal-preview-arrow" aria-hidden="true">
          ↗
        </span>
      </div>

      <p className="goal-preview-description">
        {goal.description}
      </p>

      <p className="goal-preview-date">
        Target date: {goal.targetDate}
      </p>

      <div className="goal-preview-progress">
        <span>
          {completed} of {milestones.length} milestones completed
        </span>
        <strong>{progress}%</strong>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.title} milestone progress`}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="goal-preview-link">
        View goal <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default GoalPreviewCard;