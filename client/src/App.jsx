import { useState } from "react";
import "./App.css";

function App() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [savedGoal, setSavedGoal] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    const newGoal = {
      title: goalTitle,
      description: goalDescription,
      targetDate: targetDate,
    };

    setSavedGoal(newGoal);
    setShowGoalForm(false);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Momentum</h1>
        <p>Turn your goals into action.</p>
      </header>

      {savedGoal ? (
        <section className="goal-form">
          <h2>{savedGoal.title}</h2>
          <p>{savedGoal.description}</p>
          <p>
            <strong>Target date:</strong> {savedGoal.targetDate}
          </p>
        </section>
      ) : showGoalForm ? (
        <section className="goal-form">
          <h2>Create your first goal</h2>

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
              <button type="submit">Save goal</button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowGoalForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
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