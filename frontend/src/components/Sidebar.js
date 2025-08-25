import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { logout } from '../services/api';
import toast from 'react-hot-toast';

const Sidebar = ({ navigation }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-secondary-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="ml-2 text-xl font-semibold text-white">
                Course Management
              </h1>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* User Info and Logout */}
            <div className="border-t border-secondary-200 p-4">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-secondary-500">{user?.role || 'admin'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 rounded-md transition-colors duration-150"
              >
                <LogOut className="mr-3 h-5 w-5 text-secondary-400" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 