const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Enrolled', 'Dropped', 'Completed', 'Withdrawn'],
    default: 'Enrolled'
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P', 'NP', null],
    default: null
  },
  gradePoints: {
    type: Number,
    min: [0, 'Grade points cannot be negative'],
    max: [4, 'Grade points cannot exceed 4'],
    default: null
  },
  attendance: {
    type: Number,
    min: [0, 'Attendance cannot be negative'],
    default: 0
  },
  totalClasses: {
    type: Number,
    min: [0, 'Total classes cannot be negative'],
    default: 0
  },
  comments: {
    type: String,
    maxlength: [500, 'Comments cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

// Virtual for attendance percentage
enrollmentSchema.virtual('attendancePercentage').get(function() {
  if (this.totalClasses === 0) return 0;
  return Math.round((this.attendance / this.totalClasses) * 100);
});

// Pre-save middleware to update course enrollment count
enrollmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, { $inc: { enrolled: 1 } });
  }
  next();
});

// Pre-remove middleware to update course enrollment count
enrollmentSchema.pre('remove', async function(next) {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, { $inc: { enrolled: -1 } });
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema); 