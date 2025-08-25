const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Student = require('./models/Student');
const Enrollment = require('./models/Enrollment');
const Activity = require('./models/Activity');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/course-management';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected for seeding');
})
.catch(err => {
  console.error('MongoDB connection error for seeding:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await Promise.all([
      Course.deleteMany({}),
      Student.deleteMany({}),
      Enrollment.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('Existing data cleared.');

    // Sample Courses
    const courses = await Course.insertMany([
      { code: 'CS101', title: 'Introduction to Computer Science', description: 'Fundamental concepts of computer science and programming', credits: 3, instructor: 'Dr. Alice Smith', capacity: 30, enrolled: 0, semester: 'Fall', year: 2024, isActive: true },
      { code: 'MATH201', title: 'Calculus I', description: 'Differential and integral calculus', credits: 4, instructor: 'Dr. Bob Johnson', capacity: 35, enrolled: 0, semester: 'Fall', year: 2024, isActive: true },
      { code: 'ENG101', title: 'English Composition', description: 'Academic writing and critical thinking', credits: 3, instructor: 'Prof. Carol Davis', capacity: 25, enrolled: 0, semester: 'Fall', year: 2024, isActive: true },
      { code: 'PHYS101', title: 'Physics Fundamentals', description: 'Basic principles of physics and mechanics', credits: 4, instructor: 'Dr. David Wilson', capacity: 30, enrolled: 0, semester: 'Spring', year: 2025, isActive: true },
      { code: 'CHEM101', title: 'General Chemistry', description: 'Introduction to chemical principles and laboratory techniques', credits: 4, instructor: 'Dr. Emily Brown', capacity: 28, enrolled: 0, semester: 'Summer', year: 2025, isActive: true },
    ]);
    console.log('Courses seeded.');

    // Sample Students
    const students = await Student.insertMany([
      { studentId: 'STU001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '111-222-3333', dateOfBirth: new Date('2002-01-15'), major: 'Computer Science', yearLevel: 'Sophomore', gpa: 3.8, totalCredits: 30, isActive: true },
      { studentId: 'STU002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '444-555-6666', dateOfBirth: new Date('2001-05-20'), major: 'Mathematics', yearLevel: 'Junior', gpa: 3.9, totalCredits: 60, isActive: true },
      { studentId: 'STU003', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', phone: '777-888-9999', dateOfBirth: new Date('2003-09-10'), major: 'Physics', yearLevel: 'Freshman', gpa: 3.5, totalCredits: 15, isActive: true },
    ]);
    console.log('Students seeded.');

    // Sample Enrollments
    await Enrollment.insertMany([
      { student: students[0]._id, course: courses[0]._id, enrollmentDate: new Date(), status: 'Enrolled', semester: 'Fall', year: 2024, grade: 'A', isActive: true },
      { student: students[1]._id, course: courses[0]._id, enrollmentDate: new Date(), status: 'Enrolled', semester: 'Fall', year: 2024, grade: 'B+', isActive: true },
      { student: students[0]._id, course: courses[1]._id, enrollmentDate: new Date(), status: 'Enrolled', semester: 'Fall', year: 2024, grade: 'A-', isActive: true },
    ]);
    console.log('Enrollments seeded.');

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
