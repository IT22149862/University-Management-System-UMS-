const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────
let students = [
  { id: "s1", name: "Kamal Perera", email: "kamal@uni.lk", age: 22, department: "IT" },
  { id: "s2", name: "Nimal Silva",  email: "nimal@uni.lk", age: 23, department: "CS" },
];

// ── Swagger config ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Service API",
      version: "1.0.0",
      description: "Microservice for managing university students",
    },
    servers: [{ url: "http://localhost:3001", description: "Direct" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students
 *     responses:
 *       200:
 *         description: List of all students
 */
app.get("/students", (req, res) => {
  res.json({ success: true, data: students });
});

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */
app.get("/students/:id", (req, res) => {
  const student = students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });
  res.json({ success: true, data: student });
});

/**
 * @swagger
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, age, department]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 */
app.post("/students", (req, res) => {
  const { name, email, age, department } = req.body;
  if (!name || !email || !age || !department)
    return res.status(400).json({ success: false, message: "All fields required" });
  const newStudent = { id: uuidv4(), name, email, age, department };
  students.push(newStudent);
  res.status(201).json({ success: true, data: newStudent });
});

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: Update a student
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
 *               age:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated
 *       404:
 *         description: Student not found
 */
app.put("/students/:id", (req, res) => {
  const idx = students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });
  students[idx] = { ...students[idx], ...req.body };
  res.json({ success: true, data: students[idx] });
});

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     tags: [Students]
 *     summary: Delete a student
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
app.delete("/students/:id", (req, res) => {
  const idx = students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });
  students.splice(idx, 1);
  res.json({ success: true, message: "Student deleted successfully" });
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ service: "student-service", status: "UP" }));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Student Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs:     http://localhost:${PORT}/api-docs`);
});
