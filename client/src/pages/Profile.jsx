import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Loading from '../components/Loading';

const Profile = () => {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.shippingAddress?.address || '',
        city: data.shippingAddress?.city || '',
        postalCode: data.shippingAddress?.postalCode || '',
        country: data.shippingAddress?.country || '',
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };
      
      const updated = await userService.updateProfile(updateData);
      setProfile(updated);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading profile..." />;

  return (
    <div className="py-12 min-h-screen">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <img
                src={currentUser?.picture || 'https://via.placeholder.com/150'}
                alt={currentUser?.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary-500"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile?.name || currentUser?.name}</h2>
              <p className="text-gray-600 mb-4">{profile?.email || currentUser?.email}</p>
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {profile?.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || currentUser?.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="flex-1 btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

