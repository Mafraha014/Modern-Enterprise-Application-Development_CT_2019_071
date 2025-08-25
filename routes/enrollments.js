const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { logActivity } = require('../routes/activity'); // Import logActivity
const router = express.Router();

// Validation middleware
const validateEnrollment = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('status').isIn(['Enrolled', 'Dropped', 'Completed', 'Withdrawn']).withMessage('Invalid status'),
  body('semester').isIn(['Fall', 'Spring', 'Summer']).withMessage('Invalid semester'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be 2020 or later'),
  body('grade').optional().isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P', 'NP']).withMessage('Invalid grade')
];

// GET all enrollments with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.year) filter.year = parseInt(req.query.year);

    let enrollments = await Enrollment.find(filter)
      .populate('student', 'studentId firstName lastName')
      .populate('course', 'code title')
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply search filter after population
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      enrollments = enrollments.filter(enrollment => {
        const studentMatch = enrollment.student && (
          enrollment.student.studentId?.toLowerCase().includes(searchTerm) ||
          enrollment.student.firstName?.toLowerCase().includes(searchTerm) ||
          enrollment.student.lastName?.toLowerCase().includes(searchTerm)
        );
        const courseMatch = enrollment.course && (
          enrollment.course.code?.toLowerCase().includes(searchTerm) ||
          enrollment.course.title?.toLowerCase().includes(searchTerm)
        );
        return studentMatch || courseMatch;
      });
    }

    // Calculate total count (considering search filter)
    let total = await Enrollment.countDocuments(filter);
    if (req.query.search) {
      total = enrollments.length; // Use filtered count for search
    }

    res.json({
      enrollments,
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

// GET enrollment by ID
router.get('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'studentId firstName lastName email')
      .populate('course', 'code title credits instructor');
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new enrollment
router.post('/', validateEnrollment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if student and course exist
    const student = await Student.findById(req.body.student);
    const course = await Course.findById(req.body.course);
    
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }
    if (!course) {
      return res.status(400).json({ error: 'Course not found' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: req.body.student,
      course: req.body.course,
      semester: req.body.semester,
      year: req.body.year
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled in this course for this semester' });
    }

    // Check course capacity
    const currentEnrollments = await Enrollment.countDocuments({
      course: req.body.course,
      semester: req.body.semester,
      year: req.body.year,
      status: 'Enrolled'
    });

    if (currentEnrollments >= course.capacity) {
      return res.status(400).json({ error: 'Course is at full capacity' });
    }

    const enrollment = new Enrollment(req.body);
    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(req.body.course, { $inc: { enrolled: 1 } });
    
    // Populate student and course for activity logging
    await enrollment.populate('student', 'firstName lastName');
    await enrollment.populate('course', 'title');
    
    // Log activity
    logActivity('Enrollment Created', 'Enrollment', enrollment._id, `New enrollment for "${enrollment.student.firstName} ${enrollment.student.lastName}" in "${enrollment.course.title}" created.`);

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update enrollment
router.put('/:id', validateEnrollment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('student', 'firstName lastName')
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Log activity
    logActivity('Enrollment Updated', 'Enrollment', enrollment._id, `Enrollment for "${enrollment.student.firstName} ${enrollment.student.lastName}" in "${enrollment.course.title}" updated.`);

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update grade for an enrollment
router.put('/:id/grade', async (req, res) => {
  try {
    const { grade, comments } = req.body;
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'firstName lastName')
      .populate('course', 'title');
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    enrollment.grade = grade;
    if (comments !== undefined) enrollment.comments = comments;
    await enrollment.save();

    // Log activity
    logActivity('Enrollment Grade Updated', 'Enrollment', enrollment._id, `Grade for enrollment in "${enrollment.course.title}" updated to ${grade}.`);

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE enrollment (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
      .populate('student', 'firstName lastName')
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Log activity
    logActivity('Enrollment Deleted', 'Enrollment', enrollment._id, `Enrollment for "${enrollment.student.firstName} ${enrollment.student.lastName}" in "${enrollment.course.title}" deleted (soft delete).`, 'red');

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET enrollment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Enrollment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          enrolledCount: { $sum: { $cond: [{ $eq: ['$status', 'Enrolled'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          droppedCount: { $sum: { $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0] } }
        }
      }
    ]);

    const semesterStats = await Enrollment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          enrolledCount: { $sum: { $cond: [{ $eq: ['$status', 'Enrolled'] }, 1, 0] } }
        }
      }
    ]);

    const statusStats = await Enrollment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {},
      bySemester: semesterStats,
      byStatus: statusStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 