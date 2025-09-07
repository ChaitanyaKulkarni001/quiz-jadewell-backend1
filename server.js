// server.js
// Full server with changes to persist email + answers from TCM quiz into SQLite.
// Also adds appointment endpoints to create & fetch an appointment and return a generated appointment letter.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Databases (existing)
const db = new sqlite3.Database('./tcm.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error('Error opening tcm.db:', err.message);
  else console.log('Opened tcm.db');
});
const tcmDb = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error('Error opening tcm_quiz.db:', err.message);
  else console.log('Opened tcm_quiz.db');
});

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Ensure submissions table exists for TCM quiz
tcmDb.serialize(() => {
  tcmDb.run(
    `CREATE TABLE IF NOT EXISTS tcm_submissions (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT NOT NULL,
       answers_json TEXT NOT NULL,
       body_type TEXT,
       created_at TEXT NOT NULL
     );`,
    (err) => {
      if (err) {
        console.error('Failed to create tcm_submissions table:', err.message);
      } else {
        console.log('tcm_submissions table ready');
      }
    }
  );

  // ---------------------------
// Create Users & Formulas Tables
// ---------------------------

// Users table
tcmDb.run(
  `CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     created_at TEXT NOT NULL
   );`,
  (err) => {
    if (err) console.error("Failed to create users table:", err.message);
    else console.log("users table ready");
  }
);

// Herbal Formulas table
tcmDb.run(
  `CREATE TABLE IF NOT EXISTS herbal_formulas (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL,
     formula_name TEXT NOT NULL,
     description TEXT,
     ingredients_json TEXT NOT NULL, -- store array of ingredients
     created_at TEXT NOT NULL,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );`,
  (err) => {
    if (err) console.error("Failed to create herbal_formulas table:", err.message);
    else console.log("herbal_formulas table ready");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS patients (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TEXT NOT NULL
   );`,
  (err) => {
    if (err) console.error("Failed to create patients table:", err.message);
    else console.log("patients table ready");
  }
);

  // Create appointments table for appointment flow
  tcmDb.run(
    `CREATE TABLE IF NOT EXISTS tcm_appointments (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       email TEXT NOT NULL,
       phone TEXT,
       start_datetime TEXT NOT NULL,  -- ISO string
       duration_minutes INTEGER NOT NULL,
       notes TEXT,
       created_at TEXT NOT NULL
     );`,
    (err) => {
      if (err) {
        console.error('Failed to create tcm_appointments table:', err.message);
      } else {
        console.log('tcm_appointments table ready');
      }
    }
  );
});

// ---------------------------
// Existing quiz routes (unchanged)
// ---------------------------

// 1. Get 10 random questions (legacy)
app.get('/api/quiz', (req, res) => {
  db.all("SELECT * FROM questions ORDER BY RANDOM() LIMIT 10", [], (err, rows) => {
    if (err) {
      console.error('Error GET /api/quiz:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. Submit answers and calculate result (legacy)
app.post('/api/tcm/quiz/submit', (req, res) => {
  try {
    const { answers, email } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers (non-empty array) required" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    const bodyTypeCounts = {};
    answers.forEach(answer => {
      if (answer && answer.body_type) {
        bodyTypeCounts[answer.body_type] = (bodyTypeCounts[answer.body_type] || 0) + 1;
      }
    });

    const dominantBodyType = Object.keys(bodyTypeCounts).length
      ? Object.keys(bodyTypeCounts).reduce((a, b) =>
          bodyTypeCounts[a] > bodyTypeCounts[b] ? a : b
        )
      : "unsure";

    const bodyTypeMapping = {
      yin: "yin_deficient",
      yang: "yang_deficient",
      qi: "qi_deficient",
      blood: "blood_deficient",
      unsure: "balanced"
    };

    const mappedBodyType = bodyTypeMapping[dominantBodyType] || dominantBodyType;

    tcmDb.get(
      "SELECT * FROM tcm_results WHERE body_type = ?",
      [mappedBodyType],
      (err, row) => {
        if (err) {
          console.error('Error fetching tcm_results row:', err.message);
          return res.status(500).json({ error: err.message });
        }

        const parseMaybeJson = (val) => {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {}
          return [];
        };

        const resultPayload = {
          body_type: mappedBodyType,
          title: (row && row.title) ? row.title : "Personalized Result",
          description: (row && row.description) ? row.description : "We created a tailored result for you.",
          recommendations: row ? parseMaybeJson(row.recommendations) : [],
          foods_to_eat: row ? parseMaybeJson(row.foods_to_eat) : [],
          foods_to_avoid: row ? parseMaybeJson(row.foods_to_avoid) : [],
          lifestyle_tips: row ? parseMaybeJson(row.lifestyle_tips) : [],
          // body_type_counts
        };

        const answersJson = JSON.stringify(answers);
        const createdAt = new Date().toISOString();
        const insertSql = `INSERT INTO tcm_submissions (email, answers_json, body_type, created_at) VALUES (?, ?, ?, ?)`;

        tcmDb.run(insertSql, [email, answersJson, mappedBodyType, createdAt], function(insertErr) {
          if (insertErr) {
            console.error('Failed to insert submission:', insertErr.message);
            resultPayload.saved = false;
            resultPayload.savedEmail = null;
            return res.status(500).json({ error: "Failed to save submission" });
          }

          resultPayload.saved = true;
          resultPayload.savedEmail = email;
          resultPayload.submissionId = this.lastID;

          return res.json(resultPayload);
        });
      }
    );
  } catch (ex) {
    console.error('Unhandled error in /api/tcm/quiz/submit:', ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});




// ---------------------------
// TCM Quiz API endpoints (unchanged)
// ---------------------------

// Get all TCM questions with options
app.get('/api/tcm/quiz', (req, res) => {
  const query = `
    SELECT 
      q.id,
      q.question_text,
      q.question_order,
      json_group_array(
        json_object(
          'id', o.id,
          'letter', o.option_letter,
          'text', o.option_text,
          'body_type', o.body_type
        )
      ) as options
    FROM tcm_questions q
    LEFT JOIN tcm_options o ON q.id = o.question_id
    GROUP BY q.id
    ORDER BY q.question_order
  `;

  tcmDb.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error GET /api/tcm/quiz:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const questions = rows.map(row => {
      let opts = [];
      try {
        opts = row.options ? JSON.parse(row.options) : [];
      } catch (e) {
        console.warn('Failed to parse options JSON for question', row.id);
        opts = [];
      }
      opts = opts.filter(opt => opt && opt.id !== null);
      return {
        id: row.id,
        question_text: row.question_text,
        question_description: row.question_description,
        question_order: row.question_order,
        options: opts
      };
    });

    res.json(questions);
  });
});

// Submit TCM quiz answers and get result (updated to store email)
app.post('/api/tcm/quiz/submit', (req, res) => {
  try {
    const { answers, email } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers (non-empty array) required" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    const bodyTypeCounts = {};
    answers.forEach(answer => {
      if (answer && answer.body_type) {
        bodyTypeCounts[answer.body_type] = (bodyTypeCounts[answer.body_type] || 0) + 1;
      }
    });

    const dominantBodyType = Object.keys(bodyTypeCounts).length
      ? Object.keys(bodyTypeCounts).reduce((a, b) =>
          bodyTypeCounts[a] > bodyTypeCounts[b] ? a : b
        )
      : "unsure";

    tcmDb.get(
      "SELECT * FROM tcm_results WHERE body_type = ?",
      [dominantBodyType],
      (err, row) => {
        if (err) {
          console.error('Error fetching tcm_results row:', err.message);
          return res.status(500).json({ error: err.message });
        }

        const parseMaybeJson = (val) => {
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
};


        const resultPayload = {
          body_type: dominantBodyType,
          title: (row && row.title) ? row.title : "Personalized Result",
          description: (row && row.description) ? row.description : "We created a tailored result for you.",
          recommendations: row ? parseMaybeJson(row.recommendations) : [],
          foods_to_eat: row ? parseMaybeJson(row.foods_to_eat) : [],
          foods_to_avoid: row ? parseMaybeJson(row.foods_to_avoid) : [],
          lifestyle_tips: row ? parseMaybeJson(row.lifestyle_tips) : [],
          // body_type_counts: bodyTypeCounts
        };

        const answersJson = JSON.stringify(answers);
        const createdAt = new Date().toISOString();
        const insertSql = `INSERT INTO tcm_submissions (email, answers_json, body_type, created_at) VALUES (?, ?, ?, ?)`;

        tcmDb.run(insertSql, [email, answersJson, dominantBodyType, createdAt], function(insertErr) {
          if (insertErr) {
            console.error('Failed to insert submission:', insertErr.message);
            resultPayload.saved = false;
            resultPayload.savedEmail = null;
            return res.status(500).json({ error: "Failed to save submission" });
          }

          resultPayload.saved = true;
          resultPayload.savedEmail = email;
          resultPayload.submissionId = this.lastID;
          // resultPayload.body_type_counts = bodyTypeCounts;
          return res.json(resultPayload);
        });
      }
    );
  } catch (ex) {
    console.error('Unhandled error in /api/tcm/quiz/submit:', ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------
// Appointment endpoints (NEW)
// ---------------------------

// POST /api/appointment/create
// body: { name, email, phone, startDatetime (ISO string), durationMinutes (int), notes }
app.post('/api/appointment/create', (req, res) => {
  try {
    const { name, email, phone, startDatetime, durationMinutes, notes } = req.body;

    if (!name || !email || !startDatetime || !durationMinutes) {
      return res.status(400).json({ error: "name, email, startDatetime, durationMinutes required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    const createdAt = new Date().toISOString();
    const insertSql = `INSERT INTO tcm_appointments (name, email, phone, start_datetime, duration_minutes, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    tcmDb.run(insertSql, [name, email, phone || '', startDatetime, durationMinutes, notes || '', createdAt], function(err) {
      if (err) {
        console.error('Failed to insert appointment:', err.message);
        return res.status(500).json({ error: 'Failed to save appointment' });
      }

      const appointmentId = this.lastID;
      // Build simple appointment object
      const appointment = {
        id: appointmentId,
        name, email, phone: phone || '', startDatetime, durationMinutes, notes: notes || '', createdAt
      };

      // Generate an appointment letter (HTML snippet)
      const letterHtml = generateAppointmentLetterHtml(appointment);

      return res.json({ success: true, appointmentId, appointment, letterHtml });
    });
  } catch (ex) {
    console.error('Unhandled error in /api/appointment/create:', ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/appointment/:id - returns JSON appointment
app.get('/api/appointment/:id', (req, res) => {
  const id = req.params.id;
  tcmDb.get("SELECT * FROM tcm_appointments WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error fetching appointment:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: "not found" });
    return res.json(row);
  });
});

app.get('/api/appointment/all', (req, res) => {
  const sql = `SELECT *  
               FROM tcm_appointments 
               ORDER BY created_at DESC`;
  tcmDb.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching appointments:', err.message);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.json(rows || []); // return empty array if none
  });
});

// GET /api/appointment/:id/letter - returns generated HTML letter (content-type text/html)
app.get('/api/appointment/:id/letter', (req, res) => {
  const id = req.params.id;
  tcmDb.get("SELECT * FROM tcm_appointments WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error fetching appointment for letter:', err.message);
      return res.status(500).send('Server error');
    }
    if (!row) return res.status(404).send('Not found');
    const appt = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      startDatetime: row.start_datetime,
      durationMinutes: row.duration_minutes,
      notes: row.notes,
      createdAt: row.created_at
    };
    const html = generateAppointmentLetterHtml(appt);
    res.set('Content-Type', 'text/html');
    return res.send(html);
  });
});

// Utility to generate a modest appointment-letter HTML string
function generateAppointmentLetterHtml(appt) {
  // Format date/time
  let start = new Date(appt.startDatetime);
  const end = new Date(start.getTime() + (appt.durationMinutes * 60000));
  const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOpts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const dateStr = start.toLocaleDateString('en-US', dateOpts);
  const startTime = start.toLocaleTimeString('en-US', timeOpts);
  const endTime = end.toLocaleTimeString('en-US', timeOpts);

  // A simple HTML that resembles a calm appointment letter; you can extend styling
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Appointment Confirmation — ${escapeHtml(appt.name)}</title>
  <style>
    body{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#0a2540; background:#f7fafc; padding:30px;}
    .card{max-width:820px;margin:20px auto;padding:32px;background:white;border-radius:10px;box-shadow:0 8px 28px rgba(10,37,64,0.06);}
    h1{margin:0 0 8px;font-size:28px}
    p.lead{color:#344a5f;margin:0 0 20px}
    .meta{display:flex;gap:20px;flex-wrap:wrap;margin-top:20px}
    .meta div{background:#f1f7ff;padding:12px 16px;border-radius:8px}
    .cta{display:inline-block;margin-top:20px;padding:12px 18px;background:#0b69ff;color:white;border-radius:8px;text-decoration:none}
    .notes{margin-top:18px;padding:12px;border-left:3px solid #e6eefc;background:#fbfdff;border-radius:6px;color:#1d3557}
    .muted{color:#6b7a89;font-size:13px;margin-top:12px}
  </style>
</head>
<body>
  <div class="card">
    <h1>You're scheduled, ${escapeHtml(appt.name)}!</h1>
    <p class="lead">Thank you — your appointment has been confirmed. A calendar invite will be sent to <strong>${escapeHtml(appt.email)}</strong>.</p>

    <div class="meta">
      <div>
        <div style="font-size:13px;color:#6b7a89">When</div>
        <div style="font-weight:600">${dateStr}<br/>${startTime} — ${endTime}</div>
      </div>

      <div>
        <div style="font-size:13px;color:#6b7a89">Duration</div>
        <div style="font-weight:600">${appt.durationMinutes} minutes</div>
      </div>

      <div>
        <div style="font-size:13px;color:#6b7a89">Phone</div>
        <div style="font-weight:600">${escapeHtml(appt.phone || '—')}</div>
      </div>
    </div>

    <div class="notes">
      <strong>Notes from attendee:</strong>
      <div style="margin-top:8px">${escapeHtml(appt.notes || 'No additional notes provided.')}</div>
    </div>

    <a class="cta" href="#">Add to Google Calendar</a>

    <div class="muted">Reference ID: ${appt.id} • Created at ${new Date(appt.createdAt).toLocaleString()}</div>
  </div>
</body>
</html>`;
}

// quick html-escape
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------
// Misc - static assets or health check
// ---------------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve a minimal message at root
app.get('/', (req, res) => {
  res.send('TCM Quiz server is running.');
});
// ---------------------------
// View stored quiz submissions
// ---------------------------

// GET /api/tcm/submissions
// Returns a list of saved quiz submissions (id, email, body_type, created_at)
app.get('/api/tcm/submissions', (req, res) => {
  const sql = `SELECT id, email, body_type, created_at FROM tcm_submissions ORDER BY created_at DESC`;
  tcmDb.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching submissions:', err.message);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
    res.json(rows);
  });
});

// GET /api/tcm/submissions/:id
// Returns a single submission, including answers_json
app.get('/api/tcm/submissions/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM tcm_submissions WHERE id = ?`;
  tcmDb.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching submission:', err.message);
      return res.status(500).json({ error: 'Failed to fetch submission' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Try to parse answers_json back into object
    let answers = [];
    try {
      answers = JSON.parse(row.answers_json);
    } catch (e) {
      answers = [];
    }

    res.json({
      id: row.id,
      email: row.email,
      body_type: row.body_type,
      created_at: row.created_at,
      answers
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key"; // ⚠️ move to .env in production

// ---------------------------
// Authentication
// ---------------------------

// POST /api/register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const sql = `INSERT INTO patients (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, hashedPassword, createdAt], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint")) {
          return res.status(400).json({ error: "Email already registered" });
        }
        console.error("Error inserting patient:", err.message);
        return res.status(500).json({ error: "Failed to register user" });
      }
      res.json({ success: true, userId: this.lastID });
    });
  } catch (ex) {
    console.error("Unhandled error in /api/register:", ex);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email, password required" });
  }

  db.get("SELECT * FROM patients WHERE email = ?", [email], async (err, row) => {
    if (err) {
      console.error("Error fetching patient:", err.message);
      return res.status(500).json({ error: "Server error" });
    }
    if (!row) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: row.id, email: row.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  });
});
// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET /api/dashboard
app.get("/api/dashboard", authenticateToken, (req, res) => {
  db.get("SELECT id, name, email, created_at FROM patients WHERE id = ?", [req.user.id], (err, row) => {
    if (err) {
      console.error("Error fetching dashboard user:", err.message);
      return res.status(500).json({ error: "Server error" });
    }
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json({ message: `Welcome back, ${row.name}!`, user: row });
  });
});
