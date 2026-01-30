import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiBell, FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import { useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../context/authStore';
import { notificationAPI } from '../services/api';
import { useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
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

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);
    socket.on('connect', () => {
      socket.emit('join', 'students');
    });
    socket.on('notification', (n) => {
      setNotifications((cur) => [n, ...cur]);
      setUnreadCount((c) => c + 1);
    });
    return () => socket.disconnect();
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FiBriefcase className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                IAS
              </div>
              <div className="text-xs text-gray-500 -mt-1">Industrial Attachment</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
              Home
            </Link>
            <Link to="/opportunities" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
              Opportunities
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                  Dashboard
                </Link>
                    <Link to="/messages" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                      Messages
                    </Link>
                    <Link to="/opportunities/create" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                      Post Opportunity
                    </Link>
                <Link to="/my-applications" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                  My Applications
                </Link>
                <Link to="/institutions" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                  Institutions
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition font-semibold">
                    Admin
                  </Link>
                )}
                {user?.role === 'company' && (
                  <Link to="/company" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                    Company
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
                        ) : (
                          notifications.slice(0, 5).map((notif, i) => (
                            <div key={i} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition text-sm">
                              <p className="text-gray-900 font-medium">{notif.title}</p>
                              <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="hidden sm:flex items-center space-x-3 border-l border-gray-200 pl-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.firstName}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </>
            )}

            {/* Desktop right-side login/signup removed to avoid duplicate navigation */}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/opportunities"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setIsOpen(false)}
            >
              Opportunities
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-applications"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  My Applications
                </Link>
                <Link
                  to="/institutions"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Institutions
                </Link>
                <Link
                  to="/messages"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <div className="px-3 py-3 border-t border-gray-200 mt-2">
                  <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.fullName?.[0] || user?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.firstName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium w-full"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 mx-1 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-center font-medium transition"
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
