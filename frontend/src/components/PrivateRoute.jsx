import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
