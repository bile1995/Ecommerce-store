import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      setMessage('Password reset link sent to your email!');
      if (response.data.resetUrl) {
        setResetLink(response.data.resetUrl);
      }
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Forgot Password? 🔐
          </h2>
          <p className="text-gray-300">
            Enter your email to receive a password reset link
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
                <p className="mb-2">{message}</p>
                {resetLink && (
                  <a href={resetLink} className="text-blue-300 hover:text-blue-200 underline break-all">
                    Click here to reset password
                  </a>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-600 bg-slate-700 text-white rounded-lg focus:border-blue-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
