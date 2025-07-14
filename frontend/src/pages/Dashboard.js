import React from 'react';
import { useQuery } from 'react-query';
import { BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react';
import { getStats } from '../services/api';
import StatCard from '../components/StatCard';
import Chart from '../components/Chart';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery('dashboard-stats', getStats);

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
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.courses?.overview?.totalCourses || 0,
      icon: BookOpen,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Students',
      value: stats?.students?.overview?.totalStudents || 0,
      icon: Users,
      color: 'green',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Active Enrollments',
      value: stats?.enrollments?.overview?.enrolledCount || 0,
      icon: GraduationCap,
      color: 'purple',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Average GPA',
      value: (stats?.students?.overview?.avgGPA || 0).toFixed(2),
      icon: TrendingUp,
      color: 'orange',
      change: '+0.2',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">Overview of your course management system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Enrollments by Semester</h3>
          <Chart 
            data={stats?.enrollments?.bySemester || []}
            type="bar"
            height={300}
          />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Students by Major</h3>
          <Chart 
            data={stats?.students?.byMajor || []}
            type="pie"
            height={300}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-secondary-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-secondary-700">New course "Advanced Web Development" added</span>
            </div>
            <span className="text-sm text-secondary-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-secondary-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-secondary-700">Student John Doe enrolled in CS101</span>
            </div>
            <span className="text-sm text-secondary-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-secondary-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-secondary-700">Grade updated for Math201</span>
            </div>
            <span className="text-sm text-secondary-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 