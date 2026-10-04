const express = require("express");

const app = express();
const PORT = 5001;

app.use(express.json());

const goals = [];

app.get("/", (request, response) => {
  response.json({
    message: "Momentum API is running",
  });
});

app.get("/api/goals", (request, response) => {
  response.json(goals);
})

app.post("/api/goals", (request, response) =>{
  const newGoal = {
    id: Date.now(),
    title: request.body.title,
    description: request.body.description,
    targetDate: request.body.targetDate,
    milestones: [],
  };
  goals.push(newGoal);
  response.status(201).json(newGoal);
}
);

app.put("/api/goals/:id", (request, response) => {
  const goalId = Number(request.params.id);

  const goal = goals.find((goal) => goal.id === goalId);

  if(!goal) {
    return response.status(404).json({
      message: "Goal not found",
    });
  }

  goal.title = request.body.title;
  goal.description = request.body.description;
  goal.targetDate = request.body.targetDate;

  response.json(goal);
})

app.delete("/api/goals/:id", (request, response) => {
  const goalId = Number(request.params.id);

  const goalIndex = goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex === -1) {
    return response.status(404).json({
      message: "Goal not found",
    });
  }

  const deletedGoal = goals.splice(goalIndex, 1);

  response.json({
    message: "Goal deleted successfully",
    goal: deletedGoal[0],
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});