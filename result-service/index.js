const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ── Validation helpers ───────────────────────────────────────────────────────

const VALID_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"];
const VALID_SEMESTERS = ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2"];

function calculateGradeFromMarks(marks) {
  if (marks >= 90 && marks <= 100) return "A+";
  if (marks >= 80 && marks < 90) return "A";
  if (marks >= 75 && marks < 80) return "A-";
  if (marks >= 70 && marks < 75) return "B+";
  if (marks >= 65 && marks < 70) return "B";
  if (marks >= 60 && marks < 65) return "B-";
  if (marks >= 55 && marks < 60) return "C+";
  if (marks >= 45 && marks < 55) return "C";
  if (marks >= 0 && marks < 45) return "C-";
  return null;
}

function validateStudentId(studentId) {
  const validPrefixes = ["IT", "EN", "BS"];
  if (!studentId || typeof studentId !== "string") {
    return { valid: false, message: "Student ID is required" };
  }
  
  const prefix = studentId.substring(0, 2).toUpperCase();
  if (!validPrefixes.includes(prefix)) {
    return { 
      valid: false, 
      message: `Student ID must start with IT, EN, or BS (got: ${studentId})` 
    };
  }
  
  // Check that it has exactly 8 digits after the prefix
  const numericPart = studentId.substring(2);
  if (!/^\d{8}$/.test(numericPart)) {
    return { 
      valid: false, 
      message: `Student ID must have exactly 8 digits after the prefix (e.g., IT12345678). Got: ${studentId}` 
    };
  }
  
  return { valid: true };
}

function validateCourseId(courseId) {
  const validPrefixes = ["IT", "EN", "BS"];
  if (!courseId || typeof courseId !== "string") {
    return { valid: false, message: "Course ID is required" };
  }
  
  const prefix = courseId.substring(0, 2).toUpperCase();
  if (!validPrefixes.includes(prefix)) {
    return { 
      valid: false, 
      message: `Course ID must start with IT, EN, or BS (got: ${courseId})` 
    };
  }
  
  // Check that it has exactly 4 digits after the prefix
  const numericPart = courseId.substring(2);
  if (!/^\d{4}$/.test(numericPart)) {
    return { 
      valid: false, 
      message: `Course ID must have exactly 4 digits after the prefix (e.g., IT1234). Got: ${courseId}` 
    };
  }
  
  return { valid: true };
}

function validateSemester(semester) {
  if (!semester || typeof semester !== "string") {
    return { valid: false, message: "Semester is required" };
  }
  
  const semesterLower = semester.toLowerCase();
  if (!VALID_SEMESTERS.includes(semesterLower)) {
    return { 
      valid: false, 
      message: `Invalid semester. Must be one of: ${VALID_SEMESTERS.join(", ")} (case-insensitive). Got: ${semester}` 
    };
  }
  
  return { valid: true, normalized: semesterLower };
}

function validateMarks(marks) {
  if (marks === undefined || marks === null) {
    return { valid: false, message: "Marks are required" };
  }
  if (typeof marks !== "number" || isNaN(marks)) {
    return { valid: false, message: "Marks must be a valid number" };
  }
  if (marks < 0) {
    return { valid: false, message: "Marks cannot be negative" };
  }
  if (marks > 100) {
    return { valid: false, message: "Marks cannot exceed 100" };
  }
  return { valid: true };
}

function validateGrade(grade) {
  if (!grade || typeof grade !== "string") {
    return { valid: false, message: "Grade is required" };
  }
  if (!VALID_GRADES.includes(grade)) {
    return { 
      valid: false, 
      message: `Invalid grade. Must be one of: ${VALID_GRADES.join(", ")}` 
    };
  }
  return { valid: true };
}

function validateGradeMatchesMarks(grade, marks) {
  const calculatedGrade = calculateGradeFromMarks(marks);
  if (calculatedGrade !== grade) {
    return {
      valid: false,
      message: `Grade mismatch: marks ${marks} should result in grade ${calculatedGrade}, but got ${grade}`
    };
  }
  return { valid: true };
}

// ── In-memory store ──────────────────────────────────────────────────────────
let results = [
  { id: "r1", studentId: "IT12345678", courseId: "IT1001", grade: "A",  marks: 85, semester: "y1s1" },
  { id: "r2", studentId: "EN87654321", courseId: "EN2001", grade: "B+", marks: 76, semester: "y1s2" },
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
 * /results/calculate-grade/{marks}:
 *   get:
 *     tags: [Results]
 *     summary: Calculate grade from marks
 *     description: Returns the grade that corresponds to given marks based on the grading scale
 *     parameters:
 *       - in: path
 *         name: marks
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Grade calculated successfully
 *       400:
 *         description: Invalid marks value
 */
app.get("/results/calculate-grade/:marks", (req, res) => {
  const marks = parseFloat(req.params.marks);
  
  const marksValidation = validateMarks(marks);
  if (!marksValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: marksValidation.message 
    });
  }

  const grade = calculateGradeFromMarks(marks);
  res.json({ 
    success: true, 
    data: { 
      marks, 
      grade,
      scale: {
        "A+": "90-100",
        "A": "80-89",
        "A-": "75-79",
        "B+": "70-74",
        "B": "65-69",
        "B-": "60-64",
        "C+": "55-59",
        "C": "45-54",
        "C-": "0-44"
      }
    } 
  });
});

/**
 * @swagger
 * /results:
 *   post:
 *     tags: [Results]
 *     summary: Create a new result
 *     description: |
 *       Creates a new result. Validates:
 *       - Student ID must be PREFIX + 8 digits (e.g., IT12345678, EN87654321, BS11223344)
 *       - Course ID must be PREFIX + 4 digits (e.g., IT1234, EN5678, BS9012)
 *       - Semester must be y1s1, y1s2, y2s1, y2s2, y3s1, y3s2, y4s1, or y4s2
 *       - Marks must be 0-100
 *       - Grade must match marks: C- (<45), C (45-54), C+ (55-59), B- (60-64), B (65-69), B+ (70-74), A- (75-79), A (80-89), A+ (90-100)
 *       - No duplicate results for same student + course combination
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
 *                 example: "IT12345678"
 *               courseId:
 *                 type: string
 *                 example: "IT1234"
 *               grade:
 *                 type: string
 *                 enum: [A+, A, A-, B+, B, B-, C+, C, C-]
 *                 example: "A"
 *               marks:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85
 *               semester:
 *                 type: string
 *                 enum: [y1s1, y1s2, y2s1, y2s2, y3s1, y3s2, y4s1, y4s2]
 *                 example: "y1s1"
 *     responses:
 *       201:
 *         description: Result created successfully
 *       400:
 *         description: Validation error
 */
app.post("/results", (req, res) => {
  const { studentId, courseId, grade, marks, semester } = req.body;
  
  // Check required fields
  if (!studentId || !courseId || !grade || marks === undefined || !semester) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields required: studentId, courseId, grade, marks, semester" 
    });
  }

  // Validate student ID format
  const studentIdValidation = validateStudentId(studentId);
  if (!studentIdValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: studentIdValidation.message 
    });
  }

  // Validate course ID format
  const courseIdValidation = validateCourseId(courseId);
  if (!courseIdValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: courseIdValidation.message 
    });
  }

  // Validate semester
  const semesterValidation = validateSemester(semester);
  if (!semesterValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: semesterValidation.message 
    });
  }

  // Validate marks
  const marksValidation = validateMarks(marks);
  if (!marksValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: marksValidation.message 
    });
  }

  // Validate grade
  const gradeValidation = validateGrade(grade);
  if (!gradeValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: gradeValidation.message 
    });
  }

  // Validate grade matches marks
  const gradeMatchValidation = validateGradeMatchesMarks(grade, marks);
  if (!gradeMatchValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: gradeMatchValidation.message 
    });
  }

  // Check for duplicate result (same student + course - a student cannot have multiple results for the same course)
  const duplicate = results.find(
    r => r.studentId === studentId && r.courseId === courseId
  );
  if (duplicate) {
    return res.status(400).json({
      success: false,
      message: `Student ${studentId} already has a result for course ${courseId}. A student can only have one result per course.`
    });
  }

  const newResult = { id: uuidv4(), studentId, courseId, grade, marks, semester: semesterValidation.normalized };
  results.push(newResult);
  res.status(201).json({ success: true, data: newResult });
});

/**
 * @swagger
 * /results/{id}:
 *   put:
 *     tags: [Results]
 *     summary: Update a result
 *     description: |
 *       Updates an existing result with validation:
 *       - Marks must be 0-100
 *       - Grade must match marks if both provided
 *       - Grade must be one of: A+, A, A-, B+, B, B-, C+, C, C-
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
 *                 enum: [A+, A, A-, B+, B, B-, C+, C, C-]
 *               marks:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               semester:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Result not found
 */
app.put("/results/:id", (req, res) => {
  const idx = results.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Result not found" });
  }

  const { grade, marks, semester } = req.body;
  const updatedResult = { ...results[idx] };

  // Validate marks if provided
  if (marks !== undefined) {
    const marksValidation = validateMarks(marks);
    if (!marksValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: marksValidation.message 
      });
    }
    updatedResult.marks = marks;
  }

  // Validate grade if provided
  if (grade !== undefined) {
    const gradeValidation = validateGrade(grade);
    if (!gradeValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: gradeValidation.message 
      });
    }
    updatedResult.grade = grade;
  }

  // Validate grade matches marks
  const gradeMatchValidation = validateGradeMatchesMarks(
    updatedResult.grade, 
    updatedResult.marks
  );
  if (!gradeMatchValidation.valid) {
    return res.status(400).json({ 
      success: false, 
      message: gradeMatchValidation.message 
    });
  }

  // Update semester if provided
  if (semester !== undefined) {
    updatedResult.semester = semester;
  }

  results[idx] = updatedResult;
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
