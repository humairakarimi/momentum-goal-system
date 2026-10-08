require("dotenv").config();
const cors = require("cors");

const { Pool } = require("pg");
const express = require("express");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
});

const app = express();
const PORT = 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

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

app.post("/api/goals/:goalId/milestones", async (request, response) => {
  try {
    const goalId = request.params.goalId;
    const { title } = request.body;

    const result = await pool.query(
      `
        INSERT INTO milestones (goal_id, title)
        VALUES ($1, $2)
        RETURNING
          id,
          goal_id AS "goalId",
          title,
          completed,
          created_at AS "createdAt"
      `,
      [goalId, title],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not create milestone",
    });
  }
});

app.get("/api/goals/:goalId/milestones", async (request, response) => {
  try {
    const goalId = request.params.goalId;

    const result = await pool.query(
      `
        SELECT
          id,
          goal_id AS "goalId",
          title,
          completed,
          created_at AS "createdAt"
        FROM milestones
        WHERE goal_id = $1
        ORDER BY created_at ASC
      `,
      [goalId],
    );

    response.json(result.rows);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not retrieve milestones",
    });
  }
});

app.patch("/api/milestones/:id", async (request, response) => {
  try {
    const milestoneId = request.params.id;
    const { completed } = request.body;

    const result = await pool.query(
      `
        UPDATE milestones
        SET completed = $1
        WHERE id = $2
        RETURNING
          id,
          goal_id AS "goalId",
          title,
          completed,
          created_at AS "createdAt"
      `,
      [completed, milestoneId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Milestone not found",
      });
    }

    response.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not update milestone",
    });
  }
});

app.delete("/api/milestones/:id", async (request, response) => {
  try {
    const milestoneId = request.params.id;

    const result = await pool.query(
      `
        DELETE FROM milestones
        WHERE id = $1
        RETURNING
          id,
          goal_id AS "goalId",
          title,
          completed,
          created_at AS "createdAt"
      `,
      [milestoneId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Milestone not found",
      });
    }

    response.json({
      message: "Milestone deleted successfully",
      milestone: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not delete milestone",
    });
  }
});

app.post("/api/milestones/:milestoneId/actions", async (request, response) => {
  try {
    const milestoneId = request.params.milestoneId;
    const { title } = request.body;

    const result = await pool.query(
      `
        INSERT INTO actions (milestone_id, title)
        VALUES ($1, $2)
        RETURNING
          id,
          milestone_id AS "milestoneId",
          title,
          completed,
          is_today AS "isToday",
          created_at AS "createdAt"
      `,
      [milestoneId, title],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not create action",
    });
  }
});

app.get("/api/milestones/:milestoneId/actions", async (request, response) => {
  try {
    const milestoneId = request.params.milestoneId;

    const result = await pool.query(
      `
        SELECT
          id,
          milestone_id AS "milestoneId",
          title,
          completed,
          is_today AS "isToday",
          created_at AS "createdAt"
        FROM actions
        WHERE milestone_id = $1
        ORDER BY created_at ASC
      `,
      [milestoneId],
    );

    response.json(result.rows);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not retrieve actions",
    });
  }
});
app.patch("/api/actions/:id", async (request, response) => {
  try {
    const actionId = request.params.id;
    const { completed, isToday } = request.body;

    const result = await pool.query(
      `
        UPDATE actions
        SET
          completed = COALESCE($1, completed),
          is_today = COALESCE($2, is_today)
        WHERE id = $3
        RETURNING
          id,
          milestone_id AS "milestoneId",
          title,
          completed,
          is_today AS "isToday",
          created_at AS "createdAt"
      `,
      [completed, isToday, actionId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Action not found",
      });
    }

    response.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not update action",
    });
  }
});

app.delete("/api/actions/:id", async (request, response) => {
  try {
    const actionId = request.params.id;

    const result = await pool.query(
      `
        DELETE FROM actions
        WHERE id = $1
        RETURNING
          id,
          milestone_id AS "milestoneId",
          title,
          completed,
          is_today AS "isToday",
          created_at AS "createdAt"
      `,
      [actionId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Action not found",
      });
    }

    response.json({
      message: "Action deleted successfully",
      action: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not delete action",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
