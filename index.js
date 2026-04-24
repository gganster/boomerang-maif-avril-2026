import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../db.json");
const PORT = process.env.PORT || 3001;

// Hardcoded for pedagogical purposes — do not use in production.
const JWT_SECRET = "pedagogical-dev-secret";
const JWT_EXPIRES_IN = "7d";

const readDb = async () => {
  if (!existsSync(DB_PATH)) return { tasks: [], users: [] };
  const raw = await readFile(DB_PATH, "utf-8");
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  return { tasks: parsed.tasks ?? [], users: parsed.users ?? [] };
};

const writeDb = (db) => writeFile(DB_PATH, JSON.stringify(db, null, 2));

const publicUser = (u) => ({ id: u.id, email: u.email });

const app = express();
app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());

// --- Auth middleware ---
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// --- Auth routes ---
app.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "valid email is required" });
  }
  if (typeof password !== "string" || password.length < 4) {
    return res.status(400).json({ error: "password must be at least 4 chars" });
  }
  const db = await readDb();
  if (db.users.some(u => u.email === email)) {
    return res.status(409).json({ error: "email already registered" });
  }
  const user = { id: randomUUID(), email, password };
  db.users.push(user);
  await writeDb(db);
  const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ user: publicUser(user), token });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }
  const db = await readDb();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ user: publicUser(user), token });
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

// --- Tasks routes (unprotected) ---
app.get("/tasks", async (_req, res) => {
  const db = await readDb();
  res.json(db.tasks);
});

app.get("/tasks/:id", async (req, res) => {
  const db = await readDb();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.post("/tasks", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || text.length === 0) {
    return res.status(400).json({ error: "text is required" });
  }
  const db = await readDb();
  const task = { id: randomUUID(), text };
  db.tasks.push(task);
  await writeDb(db);
  res.status(201).json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || text.length === 0) {
    return res.status(400).json({ error: "text is required" });
  }
  const db = await readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  const updated = { ...db.tasks[index], text };
  db.tasks[index] = updated;
  await writeDb(db);
  res.json(updated);
});

app.delete("/tasks/:id", async (req, res) => {
  const db = await readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  db.tasks.splice(index, 1);
  await writeDb(db);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
