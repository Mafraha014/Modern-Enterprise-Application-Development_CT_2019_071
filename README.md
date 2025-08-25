# University Course Management System

A modern enterprise-level web application for managing university courses, student registrations, and academic records. Built with Node.js, Express, MongoDB, and React.

## 🚀 Features

### Core Functionality
- **Course Management**: Create, update, and manage course offerings
- **Student Management**: Comprehensive student information and records
- **Enrollment System**: Handle course registrations and grade management
- **Dashboard Analytics**: Real-time statistics and insights
- **Modern UI/UX**: Responsive design with Tailwind CSS

### Technical Features
- **RESTful API**: Modern Express.js backend with comprehensive endpoints
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React with React Query for state management
- **Validation**: Input validation and error handling
- **Security**: Helmet.js, CORS, and input sanitization
- **Containerization**: Docker support for easy deployment

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+)
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **React** (v18) - UI library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Development & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (production)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-management-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your MongoDB connection string
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or install MongoDB locally
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

7. **Start the frontend application**
   ```bash
   cd frontend
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Option 2: Docker Deployment

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd course-management-system
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Courses
- `GET /courses` - Get all courses (with pagination and filtering)
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course (soft delete)
- `GET /courses/stats/overview` - Get course statistics

#### Students
- `GET /students` - Get all students (with pagination and filtering)
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student (soft delete)
- `GET /students/stats/overview` - Get student statistics

#### Enrollments
- `GET /enrollments` - Get all enrollments (with pagination and filtering)
- `GET /enrollments/:id` - Get enrollment by ID
- `POST /enrollments` - Create new enrollment
- `PUT /enrollments/:id` - Update enrollment
- `DELETE /enrollments/:id` - Delete enrollment
- `PUT /enrollments/:id/grade` - Update grade for enrollment
- `GET /enrollments/stats/overview` - Get enrollment statistics

### Query Parameters

#### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### Filtering
- `search` - Search term for text fields
- `semester` - Filter by semester (Fall, Spring, Summer)
- `year` - Filter by year
- `status` - Filter by enrollment status
- `major` - Filter by student major
- `yearLevel` - Filter by student year level

## 🗄️ Database Schema

### Course Model
```javascript
{
  code: String,           // Course code (unique)
  title: String,          // Course title
  description: String,    // Course description
  credits: Number,        // Credit hours (1-6)
  instructor: String,     // Instructor name
  capacity: Number,       // Maximum enrollment
  enrolled: Number,       // Current enrollment
  semester: String,       // Fall, Spring, Summer
  year: Number,          // Academic year
  isActive: Boolean       // Course status
}
```

### Student Model
```javascript
{
  studentId: String,      // Student ID (unique)
  firstName: String,      // First name
  lastName: String,       // Last name
  email: String,          // Email (unique)
  phone: String,          // Phone number
  dateOfBirth: Date,      // Date of birth
  major: String,          // Academic major
  yearLevel: String,      // Freshman, Sophomore, etc.
  gpa: Number,           // Grade point average
  totalCredits: Number,   // Total credits earned
  isActive: Boolean       // Student status
}
```

### Enrollment Model
```javascript
{
  student: ObjectId,      // Reference to Student
  course: ObjectId,       // Reference to Course
  semester: String,       // Fall, Spring, Summer
  year: Number,          // Academic year
  status: String,         // Enrolled, Completed, etc.
  grade: String,          // A+, A, B+, etc.
  gradePoints: Number,    // Numeric grade points
  attendance: Number,     // Classes attended
  totalClasses: Number,   // Total classes
  comments: String        // Additional notes
}
```

## 🎨 UI Components

The application includes modern, reusable components:

- **StatCard** - Dashboard statistics display
- **Modal** - Reusable modal dialogs
- **Chart** - Data visualization components
- **Sidebar** - Navigation sidebar
- **Forms** - Comprehensive form components with validation

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

#### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Code Structure

```
├── server.js              # Express server entry point
├── models/                # Mongoose models
│   ├── Course.js
│   ├── Student.js
│   └── Enrollment.js
├── routes/                # API routes
│   ├── courses.js
│   ├── students.js
│   └── enrollments.js
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── Dockerfile             # Backend container
├── frontend/Dockerfile    # Frontend container
└── docker-compose.yml     # Multi-container setup
```



## 🎓 Learning Objectives

This project demonstrates:

- **Modern Web Development**: Contemporary tech stack and best practices
- **Full-Stack Development**: Complete application with frontend and backend
- **Database Design**: Proper schema design and relationships
- **API Development**: RESTful API with proper error handling
- **State Management**: Client-side state management with React Query
- **UI/UX Design**: Modern, responsive user interface
- **Deployment**: Containerization and cloud deployment
- **Security**: Input validation and security best practices
