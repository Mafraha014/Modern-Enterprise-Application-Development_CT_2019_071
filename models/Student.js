const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true
  },
  yearLevel: {
    type: String,
    required: [true, 'Year level is required'],
    enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
  },
  gpa: {
    type: Number,
    min: [0.0, 'GPA cannot be negative'],
    max: [4.0, 'GPA cannot exceed 4.0'],
    default: 0.0
  },
  totalCredits: {
    type: Number,
    min: [0, 'Total credits cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, {
  timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for efficient queries
studentSchema.index({ studentId: 1, email: 1 });

module.exports = mongoose.model('Student', studentSchema); 