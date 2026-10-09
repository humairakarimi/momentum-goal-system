import { useEffect, useState } from "react";
import "./App.css";
import GoalCard from "./components/GoalCard";
import TodayDashboard from "./components/TodayDashboard";
import AuthForm from "./components/AuthForm";

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState("");

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch("http://localhost:5001/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);
  useEffect(() => {
    async function fetchGoals() {
      if (!user) {
        return;
      }

      setIsLoading(true);

      try {
        const goalsResponse = await fetch("http://localhost:5001/api/goals", {
          credentials: "include",
        });

        if (!goalsResponse.ok) {
          throw new Error("Could not retrieve goals");
        }

        const goalsData = await goalsResponse.json();

        const goalsWithMilestones = await Promise.all(
          goalsData.map(async (goal) => {
            const milestonesResponse = await fetch(
              `http://localhost:5001/api/goals/${goal.id}/milestones`,
              {
                credentials: "include",
              },
            );

            if (!milestonesResponse.ok) {
              throw new Error("Could not retrieve milestones");
            }

            const milestones = await milestonesResponse.json();

            const milestonesWithActions = await Promise.all(
              milestones.map(async (milestone) => {
                const actionsResponse = await fetch(
                  `http://localhost:5001/api/milestones/${milestone.id}/actions`,
                  {
                    credentials: "include",
                  },
                );

                if (!actionsResponse.ok) {
                  throw new Error("Could not retrieve actions");
                }

                const actions = await actionsResponse.json();

                return {
                  ...milestone,
                  actions,
                };
              }),
            );

            return {
              ...goal,
              milestones: milestonesWithActions,
            };
          }),
        );

        setGoals(goalsWithMilestones);
      } catch (error) {
        handleAppError(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoals();
  }, [user]);
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
  function handleAppError(error) {
    console.error(error);
    setAppError(error.message || "Something went wrong. Please try again.");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingGoalId !== null) {
        const response = await fetch(
          `http://localhost:5001/api/goals/${editingGoalId}`,
          {
            method: "PUT",
            credentials: "include",
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
      } else {
        const response = await fetch("http://localhost:5001/api/goals", {
          method: "POST",
          credentials: "include",
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
    } catch (error) {
      handleAppError(error);
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
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this goal? Its milestones and actions will also be deleted.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/goals/${goalId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Could not delete goal");
      }

      setGoals((currentGoals) =>
        currentGoals.filter((goal) => goal.id !== goalId),
      );
    } catch (error) {
      handleAppError(error);
    }
  }

  async function handleAddMilestone(goalId, milestoneTitle) {
    try {
      const response = await fetch(
        `http://localhost:5001/api/goals/${goalId}/milestones`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: milestoneTitle,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Could not create milestone");
      }

      const savedMilestone = await response.json();

      const updatedGoals = goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: [
                ...(goal.milestones || []),
                {
                  ...savedMilestone,
                  actions: [],
                },
              ],
            }
          : goal,
      );

      setGoals(updatedGoals);
    } catch (error) {
      handleAppError(error);
    }
  }
  async function handleAddAction(goalId, milestoneId, actionTitle) {
    try {
      const response = await fetch(
        `http://localhost:5001/api/milestones/${milestoneId}/actions`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: actionTitle,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Could not create action");
      }

      const savedAction = await response.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) => {
          if (goal.id !== goalId) {
            return goal;
          }

          return {
            ...goal,
            milestones: (goal.milestones || []).map((milestone) =>
              milestone.id === milestoneId
                ? {
                    ...milestone,
                    actions: [...(milestone.actions || []), savedAction],
                  }
                : milestone,
            ),
          };
        }),
      );
    } catch (error) {
      handleAppError(error);
    }
  }
  async function handleToggleToday(goalId, milestoneId, actionId) {
    try {
      const goal = goals.find((goal) => goal.id === goalId);

      const milestone = (goal.milestones || []).find(
        (milestone) => milestone.id === milestoneId,
      );

      const action = (milestone.actions || []).find(
        (action) => action.id === actionId,
      );

      const response = await fetch(
        `http://localhost:5001/api/actions/${actionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isToday: !action.isToday,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Could not update Today status");
      }

      const updatedAction = await response.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: (goal.milestones || []).map((milestone) =>
                  milestone.id === milestoneId
                    ? {
                        ...milestone,
                        actions: (milestone.actions || []).map((action) =>
                          action.id === actionId ? updatedAction : action,
                        ),
                      }
                    : milestone,
                ),
              }
            : goal,
        ),
      );
    } catch (error) {
      handleAppError(error);
    }
  }

  async function handleToggleAction(goalId, milestoneId, actionId) {
    try {
      const goal = goals.find((goal) => goal.id === goalId);

      const milestone = (goal.milestones || []).find(
        (milestone) => milestone.id === milestoneId,
      );

      const action = (milestone.actions || []).find(
        (action) => action.id === actionId,
      );

      const actionResponse = await fetch(
        `http://localhost:5001/api/actions/${actionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !action.completed,
          }),
        },
      );

      if (!actionResponse.ok) {
        throw new Error("Could not update action");
      }

      const updatedAction = await actionResponse.json();

      const updatedActions = (milestone.actions || []).map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      const allActionsCompleted =
        updatedActions.length > 0 &&
        updatedActions.every((action) => action.completed);

      const milestoneResponse = await fetch(
        `http://localhost:5001/api/milestones/${milestoneId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: allActionsCompleted,
          }),
        },
      );

      if (!milestoneResponse.ok) {
        throw new Error("Could not update milestone");
      }

      const updatedMilestone = await milestoneResponse.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: (goal.milestones || []).map((milestone) =>
                  milestone.id === milestoneId
                    ? {
                        ...milestone,
                        ...updatedMilestone,
                        actions: updatedActions,
                      }
                    : milestone,
                ),
              }
            : goal,
        ),
      );
    } catch (error) {
      handleAppError(error);
    }
  }

  async function handleDeleteMilestone(goalId, milestoneId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this milestone? Its actions will also be deleted.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/milestones/${milestoneId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Could not delete milestone");
      }

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: (goal.milestones || []).filter(
                  (milestone) => milestone.id !== milestoneId,
                ),
              }
            : goal,
        ),
      );
    } catch (error) {
      handleAppError(error);
    }
  }

  async function handleDeleteAction(goalId, milestoneId, actionId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this action?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/actions/${actionId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Could not delete action");
      }

      const goal = goals.find((goal) => goal.id === goalId);

      const milestone = (goal.milestones || []).find(
        (milestone) => milestone.id === milestoneId,
      );

      const updatedActions = (milestone.actions || []).filter(
        (action) => action.id !== actionId,
      );

      const allActionsCompleted =
        updatedActions.length > 0 &&
        updatedActions.every((action) => action.completed);

      const milestoneResponse = await fetch(
        `http://localhost:5001/api/milestones/${milestoneId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: allActionsCompleted,
          }),
        },
      );

      if (!milestoneResponse.ok) {
        throw new Error("Could not update milestone");
      }

      const updatedMilestone = await milestoneResponse.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: (goal.milestones || []).map((milestone) =>
                  milestone.id === milestoneId
                    ? {
                        ...milestone,
                        ...updatedMilestone,
                        actions: updatedActions,
                      }
                    : milestone,
                ),
              }
            : goal,
        ),
      );
    } catch (error) {
      handleAppError(error);
    }
  }

  async function handleToggleMilestone(goalId, milestoneId) {
    try {
      const goal = goals.find((goal) => goal.id === goalId);

      const milestone = (goal.milestones || []).find(
        (milestone) => milestone.id === milestoneId,
      );

      const response = await fetch(
        `http://localhost:5001/api/milestones/${milestoneId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !milestone.completed,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Could not update milestone");
      }

      const updatedMilestone = await response.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: (goal.milestones || []).map((milestone) =>
                  milestone.id === milestoneId
                    ? {
                        ...milestone,
                        ...updatedMilestone,
                      }
                    : milestone,
                ),
              }
            : goal,
        ),
      );
    } catch (error) {
      handleAppError(error);
    }
  }
  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not log out");
      }

      setUser(null);
      setGoals([]);
      setShowGoalForm(false);
      setEditingGoalId(null);
    } catch (error) {
      handleAppError(error);
    }
  }
  if (isCheckingAuth) {
    return null;
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Momentum</h1>

        <div className="header-user">
          <span>Hi, {user.name}</span>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>
      {appError && (
        <div className="app-error" role="alert">
          <span>{appError}</span>

          <button type="button" onClick={() => setAppError("")}>
            Dismiss
          </button>
        </div>
      )}
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
