import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../context/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    admissionNumber: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number format
    if (!formData.phoneNumber.match(/^254[0-9]{9}$/)) {
      toast.error('Phone number must be in format 254XXXXXXXXX');
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
          <div className="grid grid-cols-2 gap-3">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="First Name"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Last Name"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            id="admissionNumber"
            name="admissionNumber"
            type="text"
            required
            placeholder="Admission Number"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.admissionNumber}
            onChange={handleChange}
          />

          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            placeholder="Phone Number (254XXXXXXXXX)"
            pattern="254[0-9]{9}"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength="6"
            placeholder="Password"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 text-gray-700"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
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
