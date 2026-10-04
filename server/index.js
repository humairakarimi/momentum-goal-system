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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});