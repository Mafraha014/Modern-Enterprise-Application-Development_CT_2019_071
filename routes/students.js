const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { logActivity } = require('../routes/activity'); // Import logActivity
const router = express.Router();

// Validation middleware
const validateStudent = [
  body('studentId').trim().isLength({ min: 3, max: 10 }).withMessage('Student ID must be 3-10 characters'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('major').trim().isLength({ min: 2, max: 100 }).withMessage('Major must be 2-100 characters'),
  body('yearLevel').isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).withMessage('Invalid year level'),
  body('gpa').isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4')
];

// GET all students with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    if (req.query.major) filter.major = { $regex: `^${req.query.major}$`, $options: 'i' };
    if (req.query.yearLevel) filter.yearLevel = req.query.yearLevel;
    if (req.query.search) {
      filter.$or = [
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Student.countDocuments(filter);

    res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new student
router.post('/', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId: req.body.studentId });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    const student = new Student(req.body);
    await student.save();

    // Log activity
    logActivity('Student Created', 'Student', student._id, `New student "${student.firstName} ${student.lastName}" (${student.studentId}) created.`);

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update student
router.put('/:id', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Log activity
    logActivity('Student Updated', 'Student', student._id, `Student "${student.firstName} ${student.lastName}" (${student.studentId}) updated.`);

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE student (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Log activity
    logActivity('Student Deleted', 'Student', student._id, `Student "${student.firstName} ${student.lastName}" (${student.studentId}) deleted (soft delete).`, 'red');

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET student statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgGPA: { $avg: '$gpa' },
          totalEnrolled: { $sum: 1 }
        }
      }
    ]);

    const majorStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$major',
          count: { $sum: 1 },
          avgGPA: { $avg: '$gpa' }
        }
      }
    ]);

    const yearLevelStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$yearLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {},
      byMajor: majorStats,
      byYearLevel: yearLevelStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 