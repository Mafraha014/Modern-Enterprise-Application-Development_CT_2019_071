import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { createStudent, updateStudent, getStudent } from '../services/api';
import toast from 'react-hot-toast';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    major: '',
    yearLevel: 'Freshman',
    gpa: 0.0,
    totalCredits: 0,
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [errors, setErrors] = useState({});

  // Fetch student data if editing
  const { data: student, isLoading: isLoadingStudent } = useQuery(
    ['student', id],
    () => getStudent(id),
    { enabled: isEditing }
  );

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  }, [student]);

  const createMutation = useMutation(createStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries('students');
      toast.success('Student created successfully');
      navigate('/students');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to create student';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  });

  const updateMutation = useMutation(
    (data) => updateStudent(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
        toast.success('Student updated successfully');
        navigate('/students');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to update student';
        toast.error(errorMessage);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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

  const isLoading = createMutation.isLoading || updateMutation.isLoading || isLoadingStudent;

  if (isLoadingStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="text-secondary-600 hover:text-secondary-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-secondary-600 mt-2">
              {isEditing ? 'Update student information' : 'Create a new student record'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={`input-field ${errors.studentId ? 'border-red-500' : ''}`}
              placeholder="e.g., STU2024001"
              maxLength={20}
              required
            />
            {errors.studentId && (
              <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="e.g., John"
              maxLength={50}
              required
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="e.g., Doe"
              maxLength={50}
              required
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="e.g., john.doe@university.edu"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="e.g., +1234567890"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              required
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Major *
            </label>
            <select
              name="major"
              value={formData.major}
              onChange={handleChange}
              className={`input-field ${errors.major ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Medicine">Medicine</option>
              <option value="Law">Law</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            {errors.major && (
              <p className="text-red-500 text-sm mt-1">{errors.major}</p>
            )}
          </div>

          {/* Year Level */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Year Level *
            </label>
            <select
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              className={`input-field ${errors.yearLevel ? 'border-red-500' : ''}`}
              required
            >
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>
            {errors.yearLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.yearLevel}</p>
            )}
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              GPA
            </label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className={`input-field ${errors.gpa ? 'border-red-500' : ''}`}
              min="0"
              max="4"
              step="0.01"
            />
            {errors.gpa && (
              <p className="text-red-500 text-sm mt-1">{errors.gpa}</p>
            )}
          </div>

          {/* Total Credits */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Total Credits
            </label>
            <input
              type="number"
              name="totalCredits"
              value={formData.totalCredits}
              onChange={handleChange}
              className={`input-field ${errors.totalCredits ? 'border-red-500' : ''}`}
              min="0"
            />
            {errors.totalCredits && (
              <p className="text-red-500 text-sm mt-1">{errors.totalCredits}</p>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 123 Main St"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., USA"
              />
            </div>
          </div>
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
            Student is active
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={() => navigate('/students')}
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
            {isEditing ? 'Update Student' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm; 