import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState([]);
  const [apiUrl, setApiUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      setSettings(data);
      const apiSetting = data.find(s => s.key === 'EXTERNAL_PRODUCTS_API_URL');
      setApiUrl(apiSetting?.value || 'https://dummyjson.com/products');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSetting('EXTERNAL_PRODUCTS_API_URL', apiUrl);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading settings..." />;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-white mb-8">⚙️ Settings</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">External API Configuration</h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Error') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              External Products API URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800"
              placeholder="https://dummyjson.com/products"
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              Enter the base URL for the external products API. This will be used to fetch product data.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : '✓ Save Settings'}
          </button>
        </form>

        <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            ℹ️ API Information
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            The external API is used to fetch product data. Make sure the API follows the expected format.
            <br />
            <strong>Default:</strong> https://dummyjson.com/products
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
