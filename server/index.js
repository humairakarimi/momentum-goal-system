require("dotenv").config();

const { Pool } = require("pg");
const express = require("express");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
});

const app = express();
const PORT = 5001;

app.use(express.json());

const goals = [];

app.get("/", (request, response) => {
  response.json({
    message: "Momentum API is running",
  });
});

app.get("/api/database-test", async (request, response) => {
  try {
    const result = await pool.query("SELECT NOW()");

    response.json({
      message: "Database connected successfully",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/api/goals", async (request, response) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        target_date AS "targetDate",
        created_at AS "createdAt"
      FROM goals
      ORDER BY created_at DESC
    `);

    response.json(result.rows);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not retrieve goals",
    });
  }
});

app.post("/api/goals", async (request, response) => {
  try {
    const { title, description, targetDate } = request.body;

    const result = await pool.query(
      `
        INSERT INTO goals (title, description, target_date)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          title,
          description,
          target_date AS "targetDate",
          created_at AS "createdAt"
      `,
      [title, description, targetDate],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not create goal",
    });
  }
});

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