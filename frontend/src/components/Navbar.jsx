import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import { useState } from 'react';
import useAuthStore from '../context/authStore';
import { notificationAPI } from '../services/api';
import { useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await notificationAPI.getAll();
        if (mounted) {
          setNotifications(res.data.notifications || []);
          setUnreadCount((res.data.notifications || []).filter(n => !n.read).length);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              IAS
            </Link>
            <span className="ml-2 text-sm text-gray-600 hidden sm:block">
              Industrial Attachment System
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2">
              Home
            </Link>
            <Link to="/opportunities" className="text-gray-700 hover:text-primary-600 px-3 py-2">
              Opportunities
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Dashboard
                </Link>
                <Link to="/my-applications" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  My Applications
                </Link>
                <Link to="/institutions" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Institutions
                </Link>
                
                {/* Admin link - only visible to admins */}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-purple-600 hover:text-purple-700 px-3 py-2 font-semibold">
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 ml-4">
                  <div className="relative">
                    <FiBell className="text-gray-600 cursor-pointer" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">{unreadCount}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-600" />
                    <span className="text-gray-700">{user?.firstName}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/opportunities"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              Opportunities
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-applications"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  My Applications
                </Link>
                <Link
                  to="/institutions"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Institutions
                </Link>
                
                {/* Admin link - only visible to admins */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-purple-600 hover:bg-purple-100 rounded font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <div className="px-3 py-2 text-gray-700 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiUser />
                    <span>{user?.firstName} {user?.lastName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
