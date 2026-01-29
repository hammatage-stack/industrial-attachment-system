import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Check if user is authenticated AND has admin role
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
