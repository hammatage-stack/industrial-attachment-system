import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../context/authStore';

const Login = () => {
  const [formData, setFormData] = useState({
    admissionNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    
    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900">NITA</h1>
            <p className="text-sm text-orange-500 font-semibold">Student Portal</p>
            <p className="text-xs text-gray-600 mt-1">Sign in to start your session</p>
          </div>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            id="admissionNumber"
            name="admissionNumber"
            type="text"
            required
            placeholder="Enter your Admission Number"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.admissionNumber}
            onChange={handleChange}
          />
          
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your Password"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="keepSignedIn"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 border-2 border-blue-500 rounded accent-blue-500 cursor-pointer"
              />
              <label htmlFor="keepSignedIn" className="ml-2 text-sm text-gray-700">
                Keep me signed in
              </label>
            </div>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </a>
          </div>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 transition"
        >
          Back Home
        </button>
      </div>
    </div>
  );
};

export default Login;
