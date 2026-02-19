import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("eduassess.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('teacher', 'student'))
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    teacher_id INTEGER,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    text TEXT,
    image_url TEXT,
    options TEXT, -- JSON array
    correct_index INTEGER,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    student_id INTEGER,
    score INTEGER,
    total INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  app.use(express.json());

  // --- Auth API ---
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ id: user.id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password, role } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, password, role);
      res.json({ id: info.lastInsertRowid, username, role });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  // --- Quiz API ---
  app.get("/api/quizzes", (req, res) => {
    const quizzes = db.prepare("SELECT * FROM quizzes").all();
    res.json(quizzes);
  });

  app.get("/api/quizzes/:id", (req, res) => {
    const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    const questions = db.prepare("SELECT * FROM questions WHERE quiz_id = ?").all(req.params.id);
    res.json({ ...quiz, questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })) });
  });

  app.post("/api/quizzes", (req, res) => {
    const { title, description, teacher_id, questions } = req.body;
    const info = db.prepare("INSERT INTO quizzes (title, description, teacher_id) VALUES (?, ?, ?)").run(title, description, teacher_id);
    const quizId = info.lastInsertRowid;

    const insertQuestion = db.prepare("INSERT INTO questions (quiz_id, text, image_url, options, correct_index) VALUES (?, ?, ?, ?, ?)");
    for (const q of questions) {
      insertQuestion.run(quizId, q.text, q.image_url, JSON.stringify(q.options), q.correct_index);
    }
    
    broadcast({ type: "NEW_QUIZ", title });
    
    res.json({ id: quizId });
  });

  app.delete("/api/quizzes/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE quiz_id = ?").run(req.params.id);
    db.prepare("DELETE FROM quizzes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Results API ---
  app.post("/api/results", (req, res) => {
    const { quiz_id, student_id, score, total } = req.body;
    db.prepare("INSERT INTO results (quiz_id, student_id, score, total) VALUES (?, ?, ?, ?)").run(quiz_id, student_id, score, total);
    res.json({ success: true });
  });

  app.get("/api/results/student/:id", (req, res) => {
    const results = db.prepare(`
      SELECT r.*, q.title as quiz_title 
      FROM results r 
      JOIN quizzes q ON r.quiz_id = q.id 
      WHERE r.student_id = ?
      ORDER BY r.timestamp DESC
    `).all(req.params.id);
    res.json(results);
  });

  app.get("/api/results/quiz/:id", (req, res) => {
    const results = db.prepare(`
      SELECT r.*, u.username as student_name 
      FROM results r 
      JOIN users u ON r.student_id = u.id 
      WHERE r.quiz_id = ?
      ORDER BY r.timestamp DESC
    `).all(req.params.id);
    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
