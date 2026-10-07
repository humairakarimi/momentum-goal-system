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
        TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
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
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
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

app.put("/api/goals/:id", async (request, response) => {
  try {
    const goalId = Number(request.params.id);
    const { title, description, targetDate } = request.body;

    const result = await pool.query(
      `
        UPDATE goals
        SET title = $1,
            description = $2,
            target_date = $3
        WHERE id = $4
        RETURNING
          id,
          title,
          description,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          created_at AS "createdAt"
      `,
      [title, description, targetDate, goalId],
    );
        if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Goal not found",
      });
    }

    response.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not update goal",
    });
  }
});





app.delete("/api/goals/:id", async (request, response) => {
  try {
   const goalId = Number(request.params.id); 

    const result = await pool.query(
      `
        DELETE FROM goals
        WHERE id = $1
        RETURNING
          id,
          title,
          description,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          created_at AS "createdAt"
      `,
      [goalId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Goal not found",
      });
    }

    response.json({
      message: "Goal deleted successfully",
      goal: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not delete goal",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
