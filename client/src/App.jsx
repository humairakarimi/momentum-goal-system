import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState(() => {
  const storedGoals = localStorage.getItem("momentumGoals");

  return storedGoals ? JSON.parse(storedGoals) : [];
});
  const [editingGoalId, setEditingGoalId] = useState(null);

  useEffect(() => {
  localStorage.setItem("momentumGoals", JSON.stringify(goals));
}, [goals]);

  function handleSubmit(event) {
    event.preventDefault();

    if (editingGoalId !== null) {
      const updatedGoals = goals.map((goal) =>
        goal.id === editingGoalId
          ? {
              ...goal,
              title: goalTitle,
              description: goalDescription,
              targetDate: targetDate,
            }
          : goal,
      );

      setGoals(updatedGoals);
      setEditingGoalId(null);
    } else {
      const newGoal = {
        id: Date.now(),
        title: goalTitle,
        description: goalDescription,
        targetDate: targetDate,
      };

      setGoals([...goals, newGoal]);
    }

    setGoalTitle("");
    setGoalDescription("");
    setTargetDate("");
    setShowGoalForm(false);
  }

  function handleEditGoal(goal) {
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setTargetDate(goal.targetDate);
    setEditingGoalId(goal.id);
    setShowGoalForm(true);
  }
  function handleCancelForm() {
    setGoalTitle("");
    setGoalDescription("");
    setTargetDate("");
    setEditingGoalId(null);
    setShowGoalForm(false);
  }
  function handleDeleteGoal(goalId) {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId);
    setGoals(updatedGoals);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Momentum</h1>
        <p>Turn your goals into action.</p>
      </header>

      {showGoalForm ? (
        <section className="goal-form">
          <h2>{editingGoalId !== null ? "Edit goal" : "Create a goal"}</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="goal-title">Goal title</label>
            <input
              id="goal-title"
              type="text"
              placeholder="For example: Land a software engineering internship"
              value={goalTitle}
              onChange={(event) => setGoalTitle(event.target.value)}
              required
            />

            <label htmlFor="goal-description">
              Why is this goal important?
            </label>
            <textarea
              id="goal-description"
              placeholder="Describe your motivation"
              rows="4"
              value={goalDescription}
              onChange={(event) => setGoalDescription(event.target.value)}
              required
            />

            <label htmlFor="target-date">Target date</label>
            <input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              required
            />

            <div className="form-actions">
              <button type="submit">
                {editingGoalId !== null ? "Update goal" : "Save goal"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : goals.length > 0 ? (
        <section className="goals-section">
          <div className="goals-heading">
            <h2>Your goals</h2>

            <button type="button" onClick={() => setShowGoalForm(true)}>
              Add another goal
            </button>
          </div>

          <div className="goals-list">
            {goals.map((goal) => (
              <article className="goal-card" key={goal.id}>
                <h3>{goal.title}</h3>
                <p>{goal.description}</p>

                <p>
                  <strong>Target date:</strong> {goal.targetDate}
                </p>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() => handleEditGoal(goal)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="welcome">
          <h2>Start building momentum</h2>

          <p>
            Break your long-term goals into milestones and small actions you can
            complete every day.
          </p>

          <button type="button" onClick={() => setShowGoalForm(true)}>
            Create your first goal
          </button>
        </section>
      )}
    </main>
  );
}

export default App;
