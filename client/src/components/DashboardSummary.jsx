function DashboardSummary({
  userName,
  totalGoals,
  totalMilestones,
  completedMilestones,
  todayCount,
}) {
  return (
    <section className="dashboard-summary">
      <div className="dashboard-welcome">
        <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
        <h2>Welcome back, {userName}</h2>
        <p>Keep taking small steps toward the goals that matter to you.</p>
      </div>

      <div className="summary-cards">
        <article className="summary-card">
          <span className="summary-icon summary-icon-purple">◎</span>

          <div>
            <strong>{totalGoals}</strong>
            <p>Active goals</p>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon summary-icon-green">✓</span>

          <div>
            <strong>
              {completedMilestones}/{totalMilestones}
            </strong>
            <p>Milestones done</p>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon summary-icon-orange">☀</span>

          <div>
            <strong>{todayCount}</strong>
            <p>Actions for today</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardSummary;