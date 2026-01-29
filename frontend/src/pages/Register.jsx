import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../context/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    regNumber: '',
    institution: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce Gmail-only email
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Please register with a Gmail address (example@gmail.com)');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    setLoading(false);

    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const getStrengthLabel = (pw) => {
    if (!pw) return 'N/A';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Industrial Attachment System</h1>
            <p className="text-sm text-gray-600 font-semibold mt-1">Create Your Account</p>
            <p className="text-xs text-gray-500 mt-1">Register to apply for opportunities</p>
          </div>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Full Name"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.fullName}
            onChange={handleChange}
          />

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            id="regNumber"
            name="regNumber"
            type="text"
            required
            placeholder="Registration Number"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.regNumber}
            onChange={handleChange}
          />

          <input
            id="institution"
            name="institution"
            type="text"
            required
            placeholder="Institution"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.institution}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength="6"
              placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="text-sm text-gray-600">Password strength: {getStrengthLabel(formData.password)}</div>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength="6"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 transition"
        >
          Back Home
        </button>
      </div>
    </div>
  );
};

export default Register;
