const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const router = express.Router();

// Validation middleware
const validateCourse = [
  body('code').trim().isLength({ min: 2, max: 10 }).withMessage('Course code must be 2-10 characters'),
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Course title must be 3-100 characters'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('instructor').trim().isLength({ min: 2 }).withMessage('Instructor name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('semester').isIn(['Fall', 'Spring', 'Summer']).withMessage('Invalid semester'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be 2020 or later')
];

// GET all courses with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.instructor) filter.instructor = { $regex: req.query.instructor, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { code: { $regex: req.query.search, $options: 'i' } },
        { title: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
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

// GET course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new course
router.post('/', validateCourse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: req.body.code });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update course
router.put('/:id', validateCourse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE course (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET course statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalEnrolled: { $sum: '$enrolled' },
          totalCapacity: { $sum: '$capacity' },
          avgCredits: { $avg: '$credits' }
        }
      }
    ]);

    const semesterStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          totalEnrolled: { $sum: '$enrolled' }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {},
      bySemester: semesterStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 