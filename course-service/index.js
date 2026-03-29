const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────
let courses = [
  { id: "c1", code: "IT4020", title: "Modern Topics in IT", credits: 3, department: "IT" },
  { id: "c2", code: "CS3010", title: "Data Structures",     credits: 4, department: "CS" },
];

// ── Swagger config ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Course Service API",
      version: "1.0.0",
      description: "Microservice for managing university courses",
    },
    servers: [{ url: "http://localhost:3002", description: "Direct" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     responses:
 *       200:
 *         description: List of all courses
 */
app.get("/courses", (req, res) => {
  res.json({ success: true, data: courses });
});

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get a course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
app.get("/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, data: course });
});

/**
 * @swagger
 * /courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, title, credits, department]
 *             properties:
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               credits:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 */
app.post("/courses", (req, res) => {
  const { code, title, credits, department } = req.body;
  if (!code || !title || !credits || !department)
    return res.status(400).json({ success: false, message: "All fields required" });
  const newCourse = { id: uuidv4(), code, title, credits, department };
  courses.push(newCourse);
  res.status(201).json({ success: true, data: newCourse });
});

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Update a course
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
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               credits:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 */
app.put("/courses/:id", (req, res) => {
  const idx = courses.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Course not found" });
  courses[idx] = { ...courses[idx], ...req.body };
  res.json({ success: true, data: courses[idx] });
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       404:
 *         description: Course not found
 */
app.delete("/courses/:id", (req, res) => {
  const idx = courses.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Course not found" });
  courses.splice(idx, 1);
  res.json({ success: true, message: "Course deleted successfully" });
});

app.get("/health", (req, res) => res.json({ service: "course-service", status: "UP" }));

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Course Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs:     http://localhost:${PORT}/api-docs`);
});
