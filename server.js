const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/students');
const enrollmentRoutes = require('./routes/enrollments');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process if MongoDB connection fails
});

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Course Management API is running',
    database: 'MongoDB Connected',
    mode: 'production'
  });
});

// Manifest.json endpoint for frontend (no longer needed, frontend handles this)
// app.get('/manifest.json', (req, res) => {
//   res.json({
//     "short_name": "Course Management",
//     "name": "Course Management System",
//     "icons": [
//       {
//         "src": "favicon.ico",
//         "sizes": "64x64 32x32 24x24 16x16",
//         "type": "image/x-icon"
//       }
//     ],
//     "start_url": ".",
//     "display": "standalone",
//     "theme_color": "#000000",
//     "background_color": "#ffffff"
//   });
// });

// Favicon endpoint (no longer needed, frontend handles this)
// app.get('/favicon.ico', (req, res) => {
//   res.status(204).end(); // No content
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: Production`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 