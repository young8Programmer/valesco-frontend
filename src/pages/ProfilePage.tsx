import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { createApiClient } from '../utils/api';

const ProfilePage = () => {
  const { auth } = useAuth();
// kod formatlash va indentatsiya
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: auth?.user?.name || '',
    email: auth?.user?.email || '',
    login: auth?.user?.login || auth?.user?.username || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useMutation(
    async (data: any) => {
      if (!auth?.site || !auth?.token) throw new Error('Auth not found');
      
      const client = createApiClient(auth.site, auth.token);
      
      if (auth.site === 'gpg') {
        const response = await client.patch('/auth/profile', data);
        return response.data;
      } else {
        // Valesco backend doesn't have profile update endpoint, skip for now
        throw new Error('Profile update not available for this site');
      }
    },
    {
      onSuccess: (data) => {
        toast.success('Profile yangilandi');
        setIsEditing(false);
        // Update auth context
        if (auth) {
          const updatedAuth = {
            ...auth,
            user: { ...auth.user, ...data },
          };
          localStorage.setItem('auth', JSON.stringify(updatedAuth));
          window.location.reload(); // Simple refresh to update context
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Yangi parollar mos kelmaydi');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {};
      
      if (formData.name) updateData.name = formData.name;
      if (formData.email) updateData.email = formData.email;
      if (formData.newPassword) {
        updateData.password = formData.password;
        updateData.newPassword = formData.newPassword;
      }

      await updateProfileMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600">Shaxsiy ma'lumotlaringizni boshqaring</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {auth.user?.name || auth.user?.username || auth.user?.login || 'Admin'}
            </h3>
            <p className="text-sm text-gray-500">
              {auth.user?.role === 'super_admin' || auth.user?.role === 'superAdmin'
                ? 'Super Admin'
                : 'Admin'}
            </p>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <p className="text-gray-900">{auth.user?.login || auth.user?.username || '-'}</p>
            </div>
            {auth.user?.name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
                <p className="text-gray-900">{auth.user.name}</p>
              </div>
            )}
            {auth.user?.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{auth.user.email}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <p className="text-gray-900">
                {auth.user?.role === 'super_admin' || auth.user?.role === 'superAdmin'
                  ? 'Super Admin'
                  : 'Admin'}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Tahrirlash
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <input
                type="text"
                value={formData.login}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Login o'zgartirib bo'lmaydi</p>
            </div>

            {auth.site === 'gpg' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Parolni o'zgartirish</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joriy parol</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Parolni o'zgartirish uchun kiriting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parol</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parolni tasdiqlash</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: auth?.user?.name || '',
                    email: auth?.user?.email || '',
                    login: auth?.user?.login || auth?.user?.username || '',
                    password: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
                <span>Bekor qilish</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

