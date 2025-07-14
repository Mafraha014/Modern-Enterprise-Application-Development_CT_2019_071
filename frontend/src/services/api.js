import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Course APIs
export const getCourses = (params = {}) => 
  api.get('/courses', { params }).then(res => res.data);

export const getCourse = (id) => 
  api.get(`/courses/${id}`).then(res => res.data);

export const createCourse = (data) => 
  api.post('/courses', data).then(res => res.data);

export const updateCourse = (id, data) => 
  api.put(`/courses/${id}`, data).then(res => res.data);

export const deleteCourse = (id) => 
  api.delete(`/courses/${id}`).then(res => res.data);

export const getCourseStats = () => 
  api.get('/courses/stats/overview').then(res => res.data);

// Student APIs
export const getStudents = (params = {}) => 
  api.get('/students', { params }).then(res => res.data);

export const getStudent = (id) => 
  api.get(`/students/${id}`).then(res => res.data);

export const createStudent = (data) => 
  api.post('/students', data).then(res => res.data);

export const updateStudent = (id, data) => 
  api.put(`/students/${id}`, data).then(res => res.data);

export const deleteStudent = (id) => 
  api.delete(`/students/${id}`).then(res => res.data);

export const getStudentStats = () => 
  api.get('/students/stats/overview').then(res => res.data);

// Enrollment APIs
export const getEnrollments = (params = {}) => 
  api.get('/enrollments', { params }).then(res => res.data);

export const getEnrollment = (id) => 
  api.get(`/enrollments/${id}`).then(res => res.data);

export const createEnrollment = (data) => 
  api.post('/enrollments', data).then(res => res.data);

export const updateEnrollment = (id, data) => 
  api.put(`/enrollments/${id}`, data).then(res => res.data);

export const deleteEnrollment = (id) => 
  api.delete(`/enrollments/${id}`).then(res => res.data);

export const updateGrade = (id, data) => 
  api.put(`/enrollments/${id}/grade`, data).then(res => res.data);

export const getEnrollmentStats = () => 
  api.get('/enrollments/stats/overview').then(res => res.data);

export const getEnrollmentsByStudent = (studentId) => 
  api.get(`/enrollments/student/${studentId}`).then(res => res.data);

export const getEnrollmentsByCourse = (courseId) => 
  api.get(`/enrollments/course/${courseId}`).then(res => res.data);

// Dashboard APIs
export const getStats = async () => {
  const [courseStats, studentStats, enrollmentStats] = await Promise.all([
    getCourseStats(),
    getStudentStats(),
    getEnrollmentStats()
  ]);

  return {
    courses: courseStats,
    students: studentStats,
    enrollments: enrollmentStats
  };
};

// Health check
export const healthCheck = () => 
  api.get('/health').then(res => res.data);

export default api; 