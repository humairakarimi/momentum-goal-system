import { useEffect, useState } from "react";
import "./App.css";
import GoalCard from "./components/GoalCard";
import TodayDashboard from "./components/TodayDashboard";

function App() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);

  useEffect(() => {
  async function fetchGoals() {
    try {
      const response = await fetch("http://localhost:5001/api/goals");

      if (!response.ok) {
        throw new Error("Could not retrieve goals");
      }

      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchGoals();
}, []);

  const todayActions = goals.flatMap((goal) =>
    (goal.milestones || []).flatMap((milestone) =>
      (milestone.actions || [])
        .filter((action) => action.isToday)
        .map((action) => ({
          ...action,
          goalId: goal.id,
          goalTitle: goal.title,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
        })),
    ),
  );

  async function handleSubmit(event) {
    event.preventDefault();

    try {
     if (editingGoalId !== null) {
  const response = await fetch(
    `http://localhost:5001/api/goals/${editingGoalId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: goalTitle,
        description: goalDescription,
        targetDate,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Could not update goal");
  }

  const updatedGoal = await response.json();

  setGoals((currentGoals) =>
    currentGoals.map((goal) =>
      goal.id === editingGoalId
        ? {
            ...goal,
            ...updatedGoal,
          }
        : goal,
    ),
  );

  setEditingGoalId(null);
}else {
      const response = await fetch("http://localhost:5001/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: goalTitle,
          description: goalDescription,
          targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create goal");
      }

      const savedGoal = await response.json();

      setGoals((currentGoals) => [...currentGoals, savedGoal]);
    }

    setGoalTitle("");
    setGoalDescription("");
    setTargetDate("");
    setShowGoalForm(false); 
    } catch (error){
      console.error(error);
    }

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
  async function handleDeleteGoal(goalId) {
  try {
    const response = await fetch(
      `http://localhost:5001/api/goals/${goalId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Could not delete goal");
    }

    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId),
    );
  } catch (error) {
    console.error(error);
  }
}

  function handleAddMilestone(goalId, milestoneTitle) {
    const newMilestone = {
      id: Date.now(),
      title: milestoneTitle,
      completed: false,
      actions: [],
    };

    const updatedGoals = goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            milestones: [...(goal.milestones || []), newMilestone],
          }
        : goal,
    );

    setGoals(updatedGoals);
  }
  function handleAddAction(goalId, milestoneId, actionTitle) {
    const newAction = {
      id: Date.now(),
      title: actionTitle,
      completed: false,
      isToday: false,
    };

    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).map((milestone) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              actions: [...(milestone.actions || []), newAction],
              completed: false,
            }
          : milestone,
      );

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

    setGoals(updatedGoals);
  }
  function handleToggleToday(goalId, milestoneId, actionId) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).map((milestone) => {
        if (milestone.id !== milestoneId) {
          return milestone;
        }

        const updatedActions = (milestone.actions || []).map((action) =>
          action.id === actionId
            ? { ...action, isToday: !action.isToday }
            : action,
        );

        return {
          ...milestone,
          actions: updatedActions,
        };
      });

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

    setGoals(updatedGoals);
  }

  function handleToggleAction(goalId, milestoneId, actionId) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).map((milestone) => {
        if (milestone.id !== milestoneId) {
          return milestone;
        }

        const updatedActions = (milestone.actions || []).map((action) =>
          action.id === actionId
            ? { ...action, completed: !action.completed }
            : action,
        );

        const allActionsCompleted =
          updatedActions.length > 0 &&
          updatedActions.every((action) => action.completed);

        return {
          ...milestone,
          actions: updatedActions,
          completed: allActionsCompleted,
        };
      });

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

    setGoals(updatedGoals);
  }
  function handleDeleteMilestone(goalId, milestoneId) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).filter(
        (milestone) => milestone.id !== milestoneId,
      );

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

    setGoals(updatedGoals);
  }
  function handleDeleteAction(goalId, milestoneId, actionId) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).map((milestone) => {
        if (milestone.id !== milestoneId) {
          return milestone;
        }

        const updatedActions = (milestone.actions || []).filter(
          (action) => action.id !== actionId,
        );

        return {
          ...milestone,
          actions: updatedActions,
        };
      });

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

    setGoals(updatedGoals);
  }

  function handleToggleMilestone(goalId, milestoneId) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const updatedMilestones = (goal.milestones || []).map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, completed: !milestone.completed }
          : milestone,
      );

      return {
        ...goal,
        milestones: updatedMilestones,
      };
    });

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
        <div className="dashboard-layout">
          <section className="goals-section">
            <div className="goals-heading">
              <h2>Your goals</h2>

              <button type="button" onClick={() => setShowGoalForm(true)}>
                Add another goal
              </button>
            </div>

            <div className="goals-list">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAddMilestone={handleAddMilestone}
                  onToggleMilestone={handleToggleMilestone}
                  onDeleteMilestone={handleDeleteMilestone}
                  onDeleteAction={handleDeleteAction}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onToggleToday={handleToggleToday}
                  onAddAction={handleAddAction}
                  onToggleAction={handleToggleAction}
                />
              ))}
            </div>
          </section>
          <TodayDashboard
            todayActions={todayActions}
            onToggleAction={handleToggleAction}
            onToggleToday={handleToggleToday}
          />
        </div>
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
