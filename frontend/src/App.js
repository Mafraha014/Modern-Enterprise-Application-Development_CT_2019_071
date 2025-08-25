import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, BarChart3, Home } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Enrollments from './pages/Enrollments';
import CourseForm from './components/CourseForm';
import StudentForm from './components/StudentForm';
import EnrollmentForm from './components/EnrollmentForm';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Enrollments', href: '/enrollments', icon: GraduationCap },
];

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
    <div className="flex h-screen bg-secondary-50">
      <Sidebar navigation={navigation} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-50">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/new" element={<CourseForm />} />
              <Route path="/courses/:id/edit" element={<CourseForm />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/:id/edit" element={<StudentForm />} />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/enrollments/new" element={<EnrollmentForm />} />
              <Route path="/enrollments/:id/edit" element={<EnrollmentForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App; 