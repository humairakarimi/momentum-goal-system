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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});