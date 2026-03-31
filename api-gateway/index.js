const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
// app.use(express.json());

// ── Service URLs ─────────────────────────────────────────────────────────────
const SERVICES = {
  student:  "http://localhost:3001",
  course:   "http://localhost:3002",
  lecturer: "http://localhost:3003",
  result:   "http://localhost:3004",
  payment:  "http://localhost:3005",
};

// ── Request logger middleware ─────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[Gateway] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ── Proxy routes ─────────────────────────────────────────────────────────────
app.use("/api/students",  createProxyMiddleware({ target: SERVICES.student,  changeOrigin: true, pathRewrite: { "^/api/students": "/students" } }));
app.use("/api/courses",   createProxyMiddleware({ target: SERVICES.course,   changeOrigin: true, pathRewrite: { "^/api/courses":  "/courses"  } }));
app.use("/api/lecturers", createProxyMiddleware({ target: SERVICES.lecturer, changeOrigin: true, pathRewrite: { "^/api/lecturers": "/lecturers" } }));
app.use("/api/results",   createProxyMiddleware({ target: SERVICES.result,   changeOrigin: true, pathRewrite: { "^/api/results":  "/results"  } }));
app.use("/api/payments",  createProxyMiddleware({ target: SERVICES.payment,  changeOrigin: true, pathRewrite: { "^/api/payments": "/payments" } }));

// ── Swagger config for Gateway ────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "University Management System — API Gateway",
      version: "1.0.0",
      description:
        "Central API Gateway exposing all microservices on a single port (3000). " +
        "Routes: /api/students → Student Service (3001) | /api/courses → Course Service (3002) | " +
        "/api/lecturers → Lecturer Service (3003) | /api/results → Result Service (3004)",
    },
    servers: [{ url: "http://localhost:3000", description: "API Gateway" }],
    tags: [
      { name: "Students",  description: "Student Service endpoints (proxied to :3001)" },
      { name: "Courses",   description: "Course Service endpoints (proxied to :3002)"   },
      { name: "Lecturers", description: "Lecturer Service endpoints (proxied to :3003)" },
      { name: "Results",   description: "Result Service endpoints (proxied to :3004)"   },
      { name: "Payments",  description: "Payment Service endpoints (proxied to :3005)"  },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Swagger route definitions (documentation only — actual routing via proxy) ─

/**
 * @swagger
 * /api/students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students (via gateway)
 *     responses:
 *       200:
 *         description: List of students
 *   post:
 *     tags: [Students]
 *     summary: Create a student (via gateway)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               age: { type: integer }
 *               department: { type: string }
 *     responses:
 *       201:
 *         description: Student created
 */

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get student by ID (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student found
 *   put:
 *     tags: [Students]
 *     summary: Update student (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               age: { type: integer }
 *               department: { type: string }
 *     responses:
 *       200:
 *         description: Student updated
 *   delete:
 *     tags: [Students]
 *     summary: Delete student (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student deleted
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses (via gateway)
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     tags: [Courses]
 *     summary: Create a course (via gateway)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               title: { type: string }
 *               credits: { type: integer }
 *               department: { type: string }
 *     responses:
 *       201:
 *         description: Course created
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course found
 *   put:
 *     tags: [Courses]
 *     summary: Update course (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               title: { type: string }
 *               credits: { type: integer }
 *               department: { type: string }
 *     responses:
 *       200:
 *         description: Course updated
 *   delete:
 *     tags: [Courses]
 *     summary: Delete course (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course deleted
 */

/**
 * @swagger
 * /api/lecturers:
 *   get:
 *     tags: [Lecturers]
 *     summary: Get all lecturers (via gateway)
 *     responses:
 *       200:
 *         description: List of lecturers
 *   post:
 *     tags: [Lecturers]
 *     summary: Create a lecturer (via gateway)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               specialization: { type: string }
 *               department: { type: string }
 *     responses:
 *       201:
 *         description: Lecturer created
 */

/**
 * @swagger
 * /api/lecturers/{id}:
 *   get:
 *     tags: [Lecturers]
 *     summary: Get lecturer by ID (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lecturer found
 *   put:
 *     tags: [Lecturers]
 *     summary: Update lecturer (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               specialization: { type: string }
 *               department: { type: string }
 *     responses:
 *       200:
 *         description: Lecturer updated
 *   delete:
 *     tags: [Lecturers]
 *     summary: Delete lecturer (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lecturer deleted
 */

/**
 * @swagger
 * /api/results:
 *   get:
 *     tags: [Results]
 *     summary: Get all results (via gateway)
 *     responses:
 *       200:
 *         description: List of results
 *   post:
 *     tags: [Results]
 *     summary: Create a result (via gateway)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId: { type: string }
 *               courseId: { type: string }
 *               grade: { type: string }
 *               marks: { type: integer }
 *               semester: { type: string }
 *     responses:
 *       201:
 *         description: Result created
 */

/**
 * @swagger
 * /api/results/{id}:
 *   get:
 *     tags: [Results]
 *     summary: Get result by ID (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Result found
 *   put:
 *     tags: [Results]
 *     summary: Update result (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade: { type: string }
 *               marks: { type: integer }
 *               semester: { type: string }
 *     responses:
 *       200:
 *         description: Result updated
 *   delete:
 *     tags: [Results]
 *     summary: Delete result (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Result deleted
 */

/**
 * @swagger
 * /api/results/student/{studentId}:
 *   get:
 *     tags: [Results]
 *     summary: Get all results for a student (via gateway)
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student results
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments (via gateway)
 *     responses:
 *       200:
 *         description: List of payments
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment record (via gateway)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId: { type: string }
 *               amount: { type: number }
 *               status: { type: string }
 *               semester: { type: string }
 *               paidDate: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Payment created
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment found
 *   put:
 *     tags: [Payments]
 *     summary: Update payment (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               status: { type: string }
 *               paidDate: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Payment updated
 *   delete:
 *     tags: [Payments]
 *     summary: Delete payment (via gateway)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment deleted
 */

/**
 * @swagger
 * /api/payments/student/{studentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments for a student (via gateway)
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student payments
 */

/**
 * @swagger
 * /api/payments/status/{status}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payments by status - Paid / Pending / Overdue (via gateway)
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payments filtered by status
 */

// ── Gateway info ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "University Management System — API Gateway",
    version: "1.0.0",
    routes: {
      students:  "/api/students  → http://localhost:3001",
      courses:   "/api/courses   → http://localhost:3002",
      lecturers: "/api/lecturers → http://localhost:3003",
      results:   "/api/results   → http://localhost:3004",
      payments:  "/api/payments  → http://localhost:3005",
    },
    swagger: "http://localhost:3000/api-docs",
  });
});

app.get("/health", (req, res) => {
  res.json({ service: "api-gateway", status: "UP", timestamp: new Date().toISOString() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
  console.log(`📄 Gateway Swagger:  http://localhost:${PORT}/api-docs`);
  console.log(`\n📡 Routing table:`);
  console.log(`   /api/students  → Student Service  :3001`);
  console.log(`   /api/courses   → Course Service   :3002`);
  console.log(`   /api/lecturers → Lecturer Service :3003`);
  console.log(`   /api/results   → Result Service   :3004`);
  console.log(`   /api/payments  → Payment Service  :3005`);
});
