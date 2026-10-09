require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { Pool } = require("pg");
const express = require("express");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
});

const app = express();
const PORT = process.env.PORT || 5001;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

const goals = [];

function requireAuthentication(request, response, next) {
  const token = request.cookies.token;

  if (!token) {
    return response.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    request.userId = decodedToken.userId;
    next();
  } catch (error) {
    return response.status(401).json({
      message: "Invalid or expired login",
    });
  }
}

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

app.get("/api/goals", requireAuthentication, async (request, response) => {
  try {
    const result = await pool.query(
      `
          SELECT
            id,
            title,
            description,
            TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
            created_at AS "createdAt"
          FROM goals
          WHERE user_id = $1
          ORDER BY created_at DESC
        `,
      [request.userId],
    );

    response.json(result.rows);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not retrieve goals",
    });
  }
});

app.post("/api/goals", requireAuthentication, async (request, response) => {
  try {
    const { title, description, targetDate } = request.body;

    const result = await pool.query(
      `
          INSERT INTO goals (
            user_id,
            title,
            description,
            target_date
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            title,
            description,
            TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
            created_at AS "createdAt"
        `,
      [request.userId, title, description, targetDate],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not create goal",
    });
  }
});

app.put("/api/goals/:id", requireAuthentication, async (request, response) => {
  try {
    const goalId = request.params.id;
    const { title, description, targetDate } = request.body;

    const result = await pool.query(
      `
          UPDATE goals
          SET
            title = $1,
            description = $2,
            target_date = $3
          WHERE id = $4
            AND user_id = $5
          RETURNING
            id,
            title,
            description,
            TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
            created_at AS "createdAt"
        `,
      [title, description, targetDate, goalId, request.userId],
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

app.delete(
  "/api/goals/:id",
  requireAuthentication,
  async (request, response) => {
    try {
      const goalId = request.params.id;

      const result = await pool.query(
        `
          DELETE FROM goals
          WHERE id = $1
            AND user_id = $2
          RETURNING
            id,
            title,
            description,
            TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
            created_at AS "createdAt"
        `,
        [goalId, request.userId],
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
  },
);

app.post(
  "/api/goals/:goalId/milestones",
  requireAuthentication,
  async (request, response) => {
    try {
      const goalId = request.params.goalId;
      const { title } = request.body;

      const result = await pool.query(
        `
          INSERT INTO milestones (goal_id, title)
          SELECT id, $2
          FROM goals
          WHERE id = $1
            AND user_id = $3
          RETURNING
            id,
            goal_id AS "goalId",
            title,
            completed,
            created_at AS "createdAt"
        `,
        [goalId, title, request.userId],
      );

      if (result.rows.length === 0) {
        return response.status(404).json({
          message: "Goal not found",
        });
      }

      response.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);

      response.status(500).json({
        message: "Could not create milestone",
      });
    }
  },
);

app.get(
  "/api/goals/:goalId/milestones",
  requireAuthentication,
  async (request, response) => {
    try {
      const goalId = request.params.goalId;

      const result = await pool.query(
        `
          SELECT
            milestones.id,
            milestones.goal_id AS "goalId",
            milestones.title,
            milestones.completed,
            milestones.created_at AS "createdAt"
          FROM milestones
          INNER JOIN goals
            ON goals.id = milestones.goal_id
          WHERE milestones.goal_id = $1
            AND goals.user_id = $2
          ORDER BY milestones.created_at ASC
        `,
        [goalId, request.userId],
      );

      response.json(result.rows);
    } catch (error) {
      console.error(error);

      response.status(500).json({
        message: "Could not retrieve milestones",
      });
    }
  },
);

app.patch(
  "/api/milestones/:id",
  requireAuthentication,
  async (request, response) => {
    try {
      const milestoneId = request.params.id;
      const { completed } = request.body;

      const result = await pool.query(
        `
          UPDATE milestones
          SET completed = $1
          WHERE id = $2
            AND EXISTS (
              SELECT 1
              FROM goals
              WHERE goals.id = milestones.goal_id
                AND goals.user_id = $3
            )
          RETURNING
            id,
            goal_id AS "goalId",
            title,
            completed,
            created_at AS "createdAt"
        `,
        [completed, milestoneId, request.userId],
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
  },
);

app.delete(
  "/api/milestones/:id",
  requireAuthentication,
  async (request, response) => {
    try {
      const milestoneId = request.params.id;

      const result = await pool.query(
        `
          DELETE FROM milestones
          WHERE id = $1
            AND EXISTS (
              SELECT 1
              FROM goals
              WHERE goals.id = milestones.goal_id
                AND goals.user_id = $2
            )
          RETURNING
            id,
            goal_id AS "goalId",
            title,
            completed,
            created_at AS "createdAt"
        `,
        [milestoneId, request.userId],
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
  },
);

app.post(
  "/api/milestones/:milestoneId/actions",
  requireAuthentication,
  async (request, response) => {
    try {
      const milestoneId = request.params.milestoneId;
      const { title } = request.body;

      const result = await pool.query(
        `
          INSERT INTO actions (milestone_id, title)
          SELECT milestones.id, $2
          FROM milestones
          INNER JOIN goals
            ON goals.id = milestones.goal_id
          WHERE milestones.id = $1
            AND goals.user_id = $3
          RETURNING
            id,
            milestone_id AS "milestoneId",
            title,
            completed,
            is_today AS "isToday",
            created_at AS "createdAt"
        `,
        [milestoneId, title, request.userId],
      );

      if (result.rows.length === 0) {
        return response.status(404).json({
          message: "Milestone not found",
        });
      }

      response.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);

      response.status(500).json({
        message: "Could not create action",
      });
    }
  },
);

app.get(
  "/api/milestones/:milestoneId/actions",
  requireAuthentication,
  async (request, response) => {
    try {
      const milestoneId = request.params.milestoneId;

      const result = await pool.query(
        `
          SELECT
            actions.id,
            actions.milestone_id AS "milestoneId",
            actions.title,
            actions.completed,
            actions.is_today AS "isToday",
            actions.created_at AS "createdAt"
          FROM actions
          INNER JOIN milestones
            ON milestones.id = actions.milestone_id
          INNER JOIN goals
            ON goals.id = milestones.goal_id
          WHERE actions.milestone_id = $1
            AND goals.user_id = $2
          ORDER BY actions.created_at ASC
        `,
        [milestoneId, request.userId],
      );

      response.json(result.rows);
    } catch (error) {
      console.error(error);

      response.status(500).json({
        message: "Could not retrieve actions",
      });
    }
  },
);

app.patch(
  "/api/actions/:id",
  requireAuthentication,
  async (request, response) => {
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
            AND EXISTS (
              SELECT 1
              FROM milestones
              INNER JOIN goals
                ON goals.id = milestones.goal_id
              WHERE milestones.id = actions.milestone_id
                AND goals.user_id = $4
            )
          RETURNING
            id,
            milestone_id AS "milestoneId",
            title,
            completed,
            is_today AS "isToday",
            created_at AS "createdAt"
        `,
        [completed ?? null, isToday ?? null, actionId, request.userId],
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
  },
);

app.delete(
  "/api/actions/:id",
  requireAuthentication,
  async (request, response) => {
    try {
      const actionId = request.params.id;

      const result = await pool.query(
        `
          DELETE FROM actions
          WHERE id = $1
            AND EXISTS (
              SELECT 1
              FROM milestones
              INNER JOIN goals
                ON goals.id = milestones.goal_id
              WHERE milestones.id = actions.milestone_id
                AND goals.user_id = $2
            )
          RETURNING
            id,
            milestone_id AS "milestoneId",
            title,
            completed,
            is_today AS "isToday",
            created_at AS "createdAt"
        `,
        [actionId, request.userId],
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
  },
);

app.post("/api/auth/register", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return response.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return response.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          name,
          email,
          created_at AS "createdAt"
      `,
      [name.trim(), normalizedEmail, passwordHash],
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    response.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.status(201).json({
      user: newUser,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not create account",
    });
  }
});
app.post("/api/auth/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          created_at
        FROM users
        WHERE email = $1
      `,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return response.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordIsCorrect) {
      return response.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    response.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not log in",
    });
  }
});

app.get("/api/auth/me", requireAuthentication, async (request, response) => {
  try {
    const result = await pool.query(
      `
          SELECT
            id,
            name,
            email,
            created_at AS "createdAt"
          FROM users
          WHERE id = $1
        `,
      [request.userId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    response.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Could not retrieve user",
    });
  }
});

app.post("/api/auth/logout", (request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  response.json({
    message: "Logged out successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
