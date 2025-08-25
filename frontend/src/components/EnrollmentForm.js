import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { createEnrollment, updateEnrollment, getEnrollment, getStudents, getCourses } from '../services/api';
import toast from 'react-hot-toast';
import { getYearOptions } from '../utils/yearOptions';

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    student: '',
    course: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    status: 'Enrolled',
    attendance: 0,
    totalClasses: 0,
    comments: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch enrollment data if editing
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery(
    ['enrollment', id],
    () => getEnrollment(id),
    { enabled: isEditing, staleTime: 0 } // Add staleTime to refetch immediately on navigation
  );

  // Fetch students and courses for dropdowns
  const { data: studentsData } = useQuery('students-list', () => getStudents({ limit: 1000 }), { staleTime: 0 });
  const { data: coursesData } = useQuery('courses-list', () => getCourses({ limit: 1000 }), { staleTime: 0 });

  useEffect(() => {
    if (enrollment) {
      setFormData({
        student: enrollment.student?._id || '',
        course: enrollment.course?._id || '',
        semester: enrollment.semester || 'Fall',
        year: enrollment.year || new Date().getFullYear(),
        status: enrollment.status || 'Enrolled',
        attendance: enrollment.attendance || 0,
        totalClasses: enrollment.totalClasses || 0,
        comments: enrollment.comments || ''
      });
    } else if (!isEditing) { // Reset form for new enrollment if not editing
      setFormData({
        student: '',
        course: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        status: 'Enrolled',
        attendance: 0,
        totalClasses: 0,
        comments: ''
      });
    }
  }, [enrollment, isEditing]);

  const createMutation = useMutation(createEnrollment, {
    onSuccess: () => {
      queryClient.invalidateQueries('enrollments');
      toast.success('Enrollment created successfully');
      navigate('/enrollments');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to create enrollment';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  });

  const updateMutation = useMutation(
    (data) => updateEnrollment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('enrollments');
        toast.success('Enrollment updated successfully');
        navigate('/enrollments');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to update enrollment';
        toast.error(errorMessage);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading || isLoadingEnrollment;

  if (isLoadingEnrollment) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const yearOptions = getYearOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/enrollments')}
            className="text-secondary-600 hover:text-secondary-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {isEditing ? 'Edit Enrollment' : 'Add New Enrollment'}
            </h1>
            <p className="text-secondary-600 mt-2">
              {isEditing ? 'Update enrollment information' : 'Create a new course enrollment'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Student *
            </label>
            <select
              name="student"
              value={formData.student}
              onChange={handleChange}
              className={`input-field ${errors.student ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a student</option>
              {studentsData?.students?.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.studentId} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
            {errors.student && (
              <p className="text-red-500 text-sm mt-1">{errors.student}</p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Course *
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`input-field ${errors.course ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a course</option>
              {coursesData?.courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title} ({course.semester} {course.year})
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="text-red-500 text-sm mt-1">{errors.course}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Semester *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={`input-field ${errors.semester ? 'border-red-500' : ''}`}
              required
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
            {errors.semester && (
              <p className="text-red-500 text-sm mt-1">{errors.semester}</p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Year *
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={`input-field ${errors.year ? 'border-red-500' : ''}`}
              required
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`input-field ${errors.status ? 'border-red-500' : ''}`}
              required
            >
              <option value="Enrolled">Enrolled</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>

          {/* Attendance */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Classes Attended
            </label>
            <input
              type="number"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              className={`input-field ${errors.attendance ? 'border-red-500' : ''}`}
              min="0"
            />
            {errors.attendance && (
              <p className="text-red-500 text-sm mt-1">{errors.attendance}</p>
            )}
          </div>

          {/* Total Classes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Total Classes
            </label>
            <input
              type="number"
              name="totalClasses"
              value={formData.totalClasses}
              onChange={handleChange}
              className={`input-field ${errors.totalClasses ? 'border-red-500' : ''}`}
              min="0"
            />
            {errors.totalClasses && (
              <p className="text-red-500 text-sm mt-1">{errors.totalClasses}</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className={`input-field ${errors.comments ? 'border-red-500' : ''}`}
            rows="4"
            placeholder="Additional notes or comments..."
            maxLength={500}
          />
          {errors.comments && (
            <p className="text-red-500 text-sm mt-1">{errors.comments}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={() => navigate('/enrollments')}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary inline-flex items-center"
            disabled={isLoading}
          >
            {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Enrollment' : 'Create Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm; 