const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────
let results = [
  { id: "r1", studentId: "s1", courseId: "c1", grade: "A",  marks: 85, semester: "2026/S1" },
  { id: "r2", studentId: "s2", courseId: "c2", grade: "B+", marks: 76, semester: "2026/S1" },
];

// ── Swagger config ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Result Service API",
      version: "1.0.0",
      description: "Microservice for managing student exam results",
    },
    servers: [{ url: "http://localhost:3004", description: "Direct" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Result management endpoints
 */

/**
 * @swagger
 * /results:
 *   get:
 *     tags: [Results]
 *     summary: Get all results
 *     responses:
 *       200:
 *         description: List of all results
 */
app.get("/results", (req, res) => {
  res.json({ success: true, data: results });
});

/**
 * @swagger
 * /results/{id}:
 *   get:
 *     tags: [Results]
 *     summary: Get a result by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result found
 *       404:
 *         description: Result not found
 */
app.get("/results/:id", (req, res) => {
  const result = results.find((r) => r.id === req.params.id);
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });
  res.json({ success: true, data: result });
});

/**
 * @swagger
 * /results/student/{studentId}:
 *   get:
 *     tags: [Results]
 *     summary: Get all results for a student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Results for the student
 */
app.get("/results/student/:studentId", (req, res) => {
  const studentResults = results.filter((r) => r.studentId === req.params.studentId);
  res.json({ success: true, data: studentResults });
});

/**
 * @swagger
 * /results:
 *   post:
 *     tags: [Results]
 *     summary: Create a new result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, courseId, grade, marks, semester]
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               grade:
 *                 type: string
 *               marks:
 *                 type: integer
 *               semester:
 *                 type: string
 *     responses:
 *       201:
 *         description: Result created
 */
app.post("/results", (req, res) => {
  const { studentId, courseId, grade, marks, semester } = req.body;
  if (!studentId || !courseId || !grade || marks === undefined || !semester)
    return res.status(400).json({ success: false, message: "All fields required" });
  const newResult = { id: uuidv4(), studentId, courseId, grade, marks, semester };
  results.push(newResult);
  res.status(201).json({ success: true, data: newResult });
});

/**
 * @swagger
 * /results/{id}:
 *   put:
 *     tags: [Results]
 *     summary: Update a result
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
 *               grade:
 *                 type: string
 *               marks:
 *                 type: integer
 *               semester:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result updated
 *       404:
 *         description: Result not found
 */
app.put("/results/:id", (req, res) => {
  const idx = results.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Result not found" });
  results[idx] = { ...results[idx], ...req.body };
  res.json({ success: true, data: results[idx] });
});

/**
 * @swagger
 * /results/{id}:
 *   delete:
 *     tags: [Results]
 *     summary: Delete a result
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result deleted
 *       404:
 *         description: Result not found
 */
app.delete("/results/:id", (req, res) => {
  const idx = results.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Result not found" });
  results.splice(idx, 1);
  res.json({ success: true, message: "Result deleted successfully" });
});

app.get("/health", (req, res) => res.json({ service: "result-service", status: "UP" }));

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`✅ Result Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs:     http://localhost:${PORT}/api-docs`);
});
