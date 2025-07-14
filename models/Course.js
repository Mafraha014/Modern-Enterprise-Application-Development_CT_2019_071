const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Course code cannot exceed 10 characters']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Course capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    default: 30
  },
  enrolled: {
    type: Number,
    default: 0,
    min: 0
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.enrolled;
});

// Index for efficient queries
courseSchema.index({ code: 1, semester: 1, year: 1 });

module.exports = mongoose.model('Course', courseSchema); 