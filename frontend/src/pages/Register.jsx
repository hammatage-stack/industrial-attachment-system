import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../context/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!value.toLowerCase().endsWith('@gmail.com')) return 'Please use a Gmail address (example@gmail.com)';
        return '';
      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) return 'Invalid phone number format';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: 'N/A', color: 'gray' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    
    if (score <= 1) return { level: 1, label: 'Weak', color: 'red' };
    if (score === 2) return { level: 2, label: 'Fair', color: 'yellow' };
    if (score === 3) return { level: 3, label: 'Good', color: 'blue' };
    return { level: 4, label: 'Strong', color: 'green' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome aboard!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const FormField = ({ icon: Icon, label, name, type = 'text', placeholder, value }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            errors[name] && touched[name]
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          } text-gray-700`}
        />
        {errors[name] && touched[name] && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <FiAlertCircle size={18} />
          </div>
        )}
      </div>
      {errors[name] && touched[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  const PasswordField = ({ label, name, placeholder, value, showPassword, setShowPassword }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FiLock size={18} />
        </div>
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            errors[name] && touched[name]
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          } text-gray-700`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
      {errors[name] && touched[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <FiUser className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Join thousands of students finding their perfect attachment opportunity
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              icon={FiUser}
              label="Full Name"
              name="fullName"
              placeholder="e.g., John Doe"
              value={formData.fullName}
            />

            <FormField
              icon={FiMail}
              label="Gmail Address"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
            />

            <FormField
              icon={FiPhone}
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="e.g., 254712345678 or 0712345678"
              value={formData.phoneNumber}
            />

            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role || 'student'}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full pl-3 pr-4 py-3 border-2 rounded-lg focus:outline-none border-gray-300 focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>

            

            <PasswordField
              label="Password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            {formData.password && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <div className="flex gap-1 h-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${
                          i < passwordStrength.level
                            ? `bg-${passwordStrength.color}-500`
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
            />

            {formData.confirmPassword && !errors.confirmPassword && (
              <div className="flex items-center gap-2 text-green-600 text-sm mb-4">
                <FiCheckCircle size={16} />
                <span>Passwords match</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full block text-center bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-gray-200"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
