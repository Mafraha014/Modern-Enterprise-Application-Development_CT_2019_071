import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { createCourse, updateCourse, getCourse } from '../services/api';
import toast from 'react-hot-toast';
import { getYearOptions } from '../utils/yearOptions';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    instructor: '',
    capacity: 30,
    semester: 'Fall',
    year: new Date().getFullYear(),
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Fetch course data if editing
  const { data: course, isLoading: isLoadingCourse } = useQuery(
    ['course', id],
    () => getCourse(id),
    { enabled: isEditing, staleTime: 0 } // Add staleTime to refetch immediately on navigation
  );

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code || '',
        title: course.title || '',
        description: course.description || '',
        credits: course.credits || 3,
        instructor: course.instructor || '',
        capacity: course.capacity || 30,
        semester: course.semester || 'Fall',
        year: course.year || new Date().getFullYear(),
        isActive: course.isActive !== undefined ? course.isActive : true
      });
    } else if (!isEditing) { // Reset form for new course if not editing
      setFormData({
        code: '',
        title: '',
        description: '',
        credits: 3,
        instructor: '',
        capacity: 30,
        semester: 'Fall',
        year: new Date().getFullYear(),
        isActive: true
      });
    }
  }, [course, isEditing]);

  const createMutation = useMutation(createCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('courses');
      toast.success('Course created successfully');
      navigate('/courses');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to create course';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  });

  const updateMutation = useMutation(
    (data) => updateCourse(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
        toast.success('Course updated successfully');
        navigate('/courses');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to update course';
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

  const isLoading = createMutation.isLoading || updateMutation.isLoading || isLoadingCourse;

  if (isLoadingCourse) {
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
            onClick={() => navigate('/courses')}
            className="text-secondary-600 hover:text-secondary-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {isEditing ? 'Edit Course' : 'Add New Course'}
            </h1>
            <p className="text-secondary-600 mt-2">
              {isEditing ? 'Update course information' : 'Create a new course offering'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Code */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Course Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`input-field ${errors.code ? 'border-red-500' : ''}`}
              placeholder="e.g., CS101"
              maxLength={10}
              required
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
          </div>

          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Introduction to Computer Science"
              maxLength={100}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Credits */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Credits *
            </label>
            <select
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              className={`input-field ${errors.credits ? 'border-red-500' : ''}`}
              required
            >
              <option value={1}>1 Credit</option>
              <option value={2}>2 Credits</option>
              <option value={3}>3 Credits</option>
              <option value={4}>4 Credits</option>
              <option value={5}>5 Credits</option>
              <option value={6}>6 Credits</option>
            </select>
            {errors.credits && (
              <p className="text-red-500 text-sm mt-1">{errors.credits}</p>
            )}
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Instructor *
            </label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className={`input-field ${errors.instructor ? 'border-red-500' : ''}`}
              placeholder="e.g., Dr. John Smith"
              required
            />
            {errors.instructor && (
              <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={`input-field ${errors.capacity ? 'border-red-500' : ''}`}
              min="1"
              max="500"
              required
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
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
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`input-field ${errors.description ? 'border-red-500' : ''}`}
            rows="4"
            placeholder="Course description..."
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label className="ml-2 block text-sm text-secondary-700">
            Course is active
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={() => navigate('/courses')}
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
            {isEditing ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm; 