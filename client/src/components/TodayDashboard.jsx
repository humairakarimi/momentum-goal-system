function TodayDashboard({
  todayActions,
  onToggleAction,
  onToggleToday,
}) {
  const completedCount = todayActions.filter(
    (action) => action.completed,
  ).length;

  return (
    <section className="today-dashboard">
      <div className="today-heading">
        <div>
          <h2>Today</h2>
          <p>Focus on the actions you selected for today.</p>
        </div>

        {todayActions.length > 0 && (
          <p>
            {completedCount} of {todayActions.length} completed
          </p>
        )}
      </div>

      {todayActions.length > 0 ? (
        <ul className="today-list">
          {todayActions.map((action) => (
            <li
              key={`${action.goalId}-${action.milestoneId}-${action.id}`}
              className={
                action.completed
                  ? "today-action today-action-completed"
                  : "today-action"
              }
            >
              <label>
                <input
                  type="checkbox"
                  checked={action.completed}
                  onChange={() =>
                    onToggleAction(
                      action.goalId,
                      action.milestoneId,
                      action.id,
                    )
                  }
                />

                <span>{action.title}</span>
              </label>

              <div className="today-action-details">
                <small>
                  {action.goalTitle} · {action.milestoneTitle}
                </small>

                <button
                  type="button"
                  onClick={() =>
                    onToggleToday(
                      action.goalId,
                      action.milestoneId,
                      action.id,
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="today-empty">
          No actions selected for today. Use “Add to Today” beside an action.
        </p>
      )}
    </section>
  );
}

export default TodayDashboard;