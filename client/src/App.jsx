import "./App.css";
import { useState } from "react";

function App() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  return (
    <main className="app">
      <header className="header">
        <h1>Momentum</h1>
        <p>Turn your goals into action.</p>
      </header>

      {showGoalForm ? (
        <section className="goal-form">
          <h2>Create your first goal</h2>

          <form>
            <label htmlFor="goal-title">Goal title</label>
            <input
              id="goal-title"
              type="text"
              placeholder="For example: Land a software engineering internship"
            />

            <label htmlFor="goal-description">
              Why is this goal important?
            </label>
            <textarea
              id="goal-description"
              placeholder="Describe your motivation"
              rows="4"
            />

            <label htmlFor="target-date">Target date</label>
            <input id="target-date" type="date" />

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
