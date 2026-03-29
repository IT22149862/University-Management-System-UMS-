const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────
let payments = [
  { id: "pay1", studentId: "s1", amount: 75000.00, status: "Paid",    semester: "2026/S1", paidDate: "2026-01-15", description: "Semester Fee" },
  { id: "pay2", studentId: "s2", amount: 75000.00, status: "Pending", semester: "2026/S1", paidDate: null,         description: "Semester Fee" },
];

// ── Swagger config ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payment Service API",
      version: "1.0.0",
      description: "Microservice for managing university student payments",
    },
    servers: [{ url: "http://localhost:3005", description: "Direct" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: List of all payments
 */
app.get("/payments", (req, res) => {
  res.json({ success: true, data: payments });
});

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get a payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
app.get("/payments/:id", (req, res) => {
  const payment = payments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  res.json({ success: true, data: payment });
});

/**
 * @swagger
 * /payments/student/{studentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments for a student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments for the student
 */
app.get("/payments/student/:studentId", (req, res) => {
  const studentPayments = payments.filter((p) => p.studentId === req.params.studentId);
  res.json({ success: true, data: studentPayments });
});

/**
 * @swagger
 * /payments/status/{status}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payments by status (Paid / Pending / Overdue)
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Paid, Pending, Overdue]
 *     responses:
 *       200:
 *         description: Payments filtered by status
 */
app.get("/payments/status/:status", (req, res) => {
  const filtered = payments.filter(
    (p) => p.status.toLowerCase() === req.params.status.toLowerCase()
  );
  res.json({ success: true, data: filtered });
});

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a new payment record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, amount, status, semester, description]
 *             properties:
 *               studentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Paid, Pending, Overdue]
 *               semester:
 *                 type: string
 *               paidDate:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
app.post("/payments", (req, res) => {
  const { studentId, amount, status, semester, paidDate, description } = req.body;
  if (!studentId || !amount || !status || !semester || !description)
    return res.status(400).json({ success: false, message: "All fields required" });
  const newPayment = { id: uuidv4(), studentId, amount, status, semester, paidDate: paidDate || null, description };
  payments.push(newPayment);
  res.status(201).json({ success: true, data: newPayment });
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     tags: [Payments]
 *     summary: Update a payment (e.g. mark as Paid)
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
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Paid, Pending, Overdue]
 *               paidDate:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *       404:
 *         description: Payment not found
 */
app.put("/payments/:id", (req, res) => {
  const idx = payments.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Payment not found" });
  payments[idx] = { ...payments[idx], ...req.body };
  res.json({ success: true, data: payments[idx] });
});

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     tags: [Payments]
 *     summary: Delete a payment record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted
 *       404:
 *         description: Payment not found
 */
app.delete("/payments/:id", (req, res) => {
  const idx = payments.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Payment not found" });
  payments.splice(idx, 1);
  res.json({ success: true, message: "Payment deleted successfully" });
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ service: "payment-service", status: "UP" }));

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`✅ Payment Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs:     http://localhost:${PORT}/api-docs`);
});
