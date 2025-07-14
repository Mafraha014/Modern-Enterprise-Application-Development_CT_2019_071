import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { getStudents, deleteStudent } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { getYearOptions } from '../utils/yearOptions';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['students', searchTerm, selectedMajor, selectedYearLevel],
    () => getStudents({ search: searchTerm, major: selectedMajor, yearLevel: selectedYearLevel })
  );

  const deleteMutation = useMutation(deleteStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries('students');
      toast.success('Student deleted successfully');
      setShowDeleteModal(false);
      setStudentToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete student');
    }
  });

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete._id);
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
        <p className="text-red-600">Error loading students</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Students</h1>
          <p className="text-secondary-600 mt-2">Manage student information and records</p>
        </div>
        <Link
          to="/students/new"
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="input-field"
          >
            <option value="">All Majors</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
          </select>
          <select
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
            className="input-field"
          >
            <option value="">All Year Levels</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
          </select>
          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedMajor('');
                setSelectedYearLevel('');
              }}
              className="btn-secondary w-full md:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-secondary-900">Student List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="table-cell text-left font-medium text-secondary-700">Student ID</th>
                <th className="table-cell text-left font-medium text-secondary-700">Name</th>
                <th className="table-cell text-left font-medium text-secondary-700">Contact</th>
                <th className="table-cell text-left font-medium text-secondary-700">Major</th>
                <th className="table-cell text-left font-medium text-secondary-700">Year Level</th>
                <th className="table-cell text-left font-medium text-secondary-700">GPA</th>
                <th className="table-cell text-left font-medium text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.students?.map((student) => (
                <tr key={student._id} className="table-row">
                  <td className="table-cell">
                    <span className="font-medium text-secondary-900">{student.studentId}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-secondary-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-secondary-700">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </div>
                      {student.phone && (
                        <div className="flex items-center text-sm text-secondary-700">
                          <Phone className="h-3 w-3 mr-1" />
                          {student.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-secondary-700">{student.major}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {student.yearLevel}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <span className="font-medium text-secondary-900">{student.gpa.toFixed(2)}</span>
                      <div className="ml-2 w-16 bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(student.gpa / 4.0) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/students/${student._id}/edit`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student)}
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
        
        {data?.students?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-500">No students found</p>
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
        title="Delete Student"
      >
        <div className="p-6">
          <p className="text-secondary-700 mb-4">
            Are you sure you want to delete the student "{studentToDelete?.firstName} {studentToDelete?.lastName}"? This action cannot be undone.
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

export default Students; 