import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { getEnrollments, deleteEnrollment, updateGrade } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { getYearOptions } from '../utils/yearOptions';

const Enrollments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [enrollmentToGrade, setEnrollmentToGrade] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', comments: '' });
  
  const queryClient = useQueryClient();
  const yearOptions = getYearOptions();

  const { data, isLoading, error } = useQuery(
    ['enrollments', searchTerm, selectedStatus, selectedSemester, selectedYear],
    () => getEnrollments({ search: searchTerm, status: selectedStatus, semester: selectedSemester, year: selectedYear })
  );

  const deleteMutation = useMutation(deleteEnrollment, {
    onSuccess: () => {
      queryClient.invalidateQueries('enrollments');
      toast.success('Enrollment deleted successfully');
      setShowDeleteModal(false);
      setEnrollmentToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete enrollment');
    }
  });

  const gradeMutation = useMutation(
    ({ id, data }) => updateGrade(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('enrollments');
        toast.success('Grade updated successfully');
        setShowGradeModal(false);
        setEnrollmentToGrade(null);
        setGradeData({ grade: '', comments: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update grade');
      }
    }
  );

  const handleDelete = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const handleGrade = (enrollment) => {
    setEnrollmentToGrade(enrollment);
    setGradeData({ grade: enrollment.grade || '', comments: enrollment.comments || '' });
    setShowGradeModal(true);
  };

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      deleteMutation.mutate(enrollmentToDelete._id);
    }
  };

  const confirmGrade = () => {
    if (enrollmentToGrade && gradeData.grade) {
      gradeMutation.mutate({ id: enrollmentToGrade._id, data: gradeData });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Enrolled': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Dropped': 'bg-red-100 text-red-800',
      'Withdrawn': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-secondary-100 text-secondary-800';
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-secondary-500';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-secondary-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading enrollments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Enrollments</h1>
          <p className="text-secondary-600 mt-2">Manage course registrations and grades</p>
        </div>
        <Link
          to="/enrollments/new"
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Enrollment
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="input-field"
          >
            <option value="">All Semesters</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field"
          >
            <option value="">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="col-span-1 md:col-span-1 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedSemester('');
                setSelectedYear('');
              }}
              className="btn-secondary w-full md:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-secondary-900">Enrollment List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="table-cell text-left font-medium text-secondary-700">Student</th>
                <th className="table-cell text-left font-medium text-secondary-700">Course</th>
                <th className="table-cell text-left font-medium text-secondary-700">Semester</th>
                <th className="table-cell text-left font-medium text-secondary-700">Status</th>
                <th className="table-cell text-left font-medium text-secondary-700">Grade</th>
                <th className="table-cell text-left font-medium text-secondary-700">Attendance</th>
                <th className="table-cell text-left font-medium text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.enrollments?.map((enrollment) => (
                <tr key={enrollment._id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-secondary-900">
                        {enrollment.student?.firstName} {enrollment.student?.lastName}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {enrollment.student?.studentId}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-secondary-900">
                        {enrollment.course?.code} - {enrollment.course?.title}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {enrollment.course?.credits} credits
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-secondary-400 mr-1" />
                      <span className="text-secondary-700">
                        {enrollment.semester} {enrollment.year}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`font-medium ${getGradeColor(enrollment.grade)}`}>
                      {enrollment.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <span className="text-secondary-700">
                        {enrollment.attendance}/{enrollment.totalClasses}
                      </span>
                      {enrollment.totalClasses > 0 && (
                        <div className="ml-2 w-16 bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(enrollment.attendance / enrollment.totalClasses) * 100}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGrade(enrollment)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Update Grade"
                      >
                        <GraduationCap className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/enrollments/${enrollment._id}/edit`}
                        className="text-secondary-600 hover:text-secondary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(enrollment)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data?.enrollments?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-500">No enrollments found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary-700">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary px-3 py-1">Previous</button>
            <button className="btn-primary px-3 py-1">Next</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Enrollment"
      >
        <div className="p-6">
          <p className="text-secondary-700 mb-4">
            Are you sure you want to delete this enrollment? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn-danger"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Grade Update Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="Update Grade"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Grade
            </label>
            <select
              value={gradeData.grade}
              onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
              className="input-field"
            >
              <option value="">Select Grade</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="D-">D-</option>
              <option value="F">F</option>
              <option value="W">W</option>
              <option value="I">I</option>
              <option value="P">P</option>
              <option value="NP">NP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Comments
            </label>
            <textarea
              value={gradeData.comments}
              onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Optional comments..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowGradeModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmGrade}
              className="btn-primary"
              disabled={gradeMutation.isLoading || !gradeData.grade}
            >
              {gradeMutation.isLoading ? 'Updating...' : 'Update Grade'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enrollments; 