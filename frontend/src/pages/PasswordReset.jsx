import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

const PasswordReset = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error resetting password');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Set a new password</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" required placeholder="New password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" required placeholder="Confirm password" className="w-full px-3 py-2 border rounded" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save new password'}</button>
      </form>
    </div>
  );
};

export default PasswordReset;
