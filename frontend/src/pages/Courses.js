import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { getCourses, deleteCourse } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { getYearOptions } from '../utils/yearOptions';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const queryClient = useQueryClient();

  const yearOptions = getYearOptions();

  const { data, isLoading, error } = useQuery(
    ['courses', searchTerm, selectedSemester, selectedYear],
    () => getCourses({ search: searchTerm, semester: selectedSemester, year: selectedYear })
  );

  const deleteMutation = useMutation(deleteCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('courses');
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  });

  const handleDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete._id);
    }
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
        <p className="text-red-600">Error loading courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Courses</h1>
          <p className="text-secondary-600 mt-2">Manage university courses and offerings</p>
        </div>
        <Link
          to="/courses/new"
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
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
          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
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

      {/* Courses Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-secondary-900">Course List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="table-cell text-left font-medium text-secondary-700">Code</th>
                <th className="table-cell text-left font-medium text-secondary-700">Title</th>
                <th className="table-cell text-left font-medium text-secondary-700">Instructor</th>
                <th className="table-cell text-left font-medium text-secondary-700">Credits</th>
                <th className="table-cell text-left font-medium text-secondary-700">Enrolled</th>
                <th className="table-cell text-left font-medium text-secondary-700">Semester</th>
                <th className="table-cell text-left font-medium text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.courses?.map((course) => (
                <tr key={course._id} className="table-row">
                  <td className="table-cell">
                    <span className="font-medium text-secondary-900">{course.code}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-secondary-900">{course.title}</div>
                      {course.description && (
                        <div className="text-sm text-secondary-500 truncate max-w-xs">
                          {course.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-secondary-700">{course.instructor}</td>
                  <td className="table-cell text-secondary-700">{course.credits}</td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <span className="text-secondary-700">{course.enrolled}/{course.capacity}</span>
                      <div className="ml-2 w-16 bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${(course.enrolled / course.capacity) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {course.semester} {course.year}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${course._id}/edit`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(course)}
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
        
        {data?.courses?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-500">No courses found</p>
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
        title="Delete Course"
      >
        <div className="p-6">
          <p className="text-secondary-700 mb-4">
            Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
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
    </div>
  );
};

export default Courses; 