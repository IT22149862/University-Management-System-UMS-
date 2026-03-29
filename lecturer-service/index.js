const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────
let lecturers = [
  { id: "l1", name: "Dr. Anjali Fernando", email: "anjali@uni.lk", specialization: "Cloud Computing",  department: "IT" },
  { id: "l2", name: "Prof. Ravi Bandara",  email: "ravi@uni.lk",   specialization: "Machine Learning", department: "CS" },
];

// ── Swagger config ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lecturer Service API",
      version: "1.0.0",
      description: "Microservice for managing university lecturers",
    },
    servers: [{ url: "http://localhost:3003", description: "Direct" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Lecturers
 *   description: Lecturer management endpoints
 */

/**
 * @swagger
 * /lecturers:
 *   get:
 *     tags: [Lecturers]
 *     summary: Get all lecturers
 *     responses:
 *       200:
 *         description: List of all lecturers
 */
app.get("/lecturers", (req, res) => {
  res.json({ success: true, data: lecturers });
});

/**
 * @swagger
 * /lecturers/{id}:
 *   get:
 *     tags: [Lecturers]
 *     summary: Get a lecturer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lecturer found
 *       404:
 *         description: Lecturer not found
 */
app.get("/lecturers/:id", (req, res) => {
  const lecturer = lecturers.find((l) => l.id === req.params.id);
  if (!lecturer) return res.status(404).json({ success: false, message: "Lecturer not found" });
  res.json({ success: true, data: lecturer });
});

/**
 * @swagger
 * /lecturers:
 *   post:
 *     tags: [Lecturers]
 *     summary: Create a new lecturer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, specialization, department]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialization:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lecturer created
 */
app.post("/lecturers", (req, res) => {
  const { name, email, specialization, department } = req.body;
  if (!name || !email || !specialization || !department)
    return res.status(400).json({ success: false, message: "All fields required" });
  const newLecturer = { id: uuidv4(), name, email, specialization, department };
  lecturers.push(newLecturer);
  res.status(201).json({ success: true, data: newLecturer });
});

/**
 * @swagger
 * /lecturers/{id}:
 *   put:
 *     tags: [Lecturers]
 *     summary: Update a lecturer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialization:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lecturer updated
 *       404:
 *         description: Lecturer not found
 */
app.put("/lecturers/:id", (req, res) => {
  const idx = lecturers.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Lecturer not found" });
  lecturers[idx] = { ...lecturers[idx], ...req.body };
  res.json({ success: true, data: lecturers[idx] });
});

/**
 * @swagger
 * /lecturers/{id}:
 *   delete:
 *     tags: [Lecturers]
 *     summary: Delete a lecturer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lecturer deleted
 *       404:
 *         description: Lecturer not found
 */
app.delete("/lecturers/:id", (req, res) => {
  const idx = lecturers.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Lecturer not found" });
  lecturers.splice(idx, 1);
  res.json({ success: true, message: "Lecturer deleted successfully" });
});

app.get("/health", (req, res) => res.json({ service: "lecturer-service", status: "UP" }));

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`✅ Lecturer Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs:     http://localhost:${PORT}/api-docs`);
});
