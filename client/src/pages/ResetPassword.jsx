import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Reset Password 🔑
          </h2>
          <p className="text-gray-300">
            Enter your new password
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-600 bg-slate-700 text-white rounded-lg focus:border-blue-500 outline-none"
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-600 bg-slate-700 text-white rounded-lg focus:border-blue-500 outline-none"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
