import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { brandService } from '../services/brand.service';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Brand, Category } from '../types';

interface BrandModalProps {
  brand: Brand | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const BrandModal = ({ brand, categories, onClose, onSuccess }: BrandModalProps) => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameRu: '',
    nameEn: '',
    categoryId: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (brand) {
      const brandData = brand as any;
      setFormData({
        name: brand.name || '',
        nameRu: brand.nameRu || '',
        nameEn: brand.nameEn || '',
        categoryId: brandData.categoryId?.toString() || '',
      });
      const brandImages = brandData.images || [];
      setExistingImages(Array.isArray(brandImages) ? brandImages : [brandImages].filter(Boolean));
    }
  }, [brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.site || !auth?.token) return;

    if (!formData.name) {
      toast.error('Nomi majburiy');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Kategoriya majburiy');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      if (formData.nameRu) formDataToSend.append('nameRu', formData.nameRu);
      if (formData.nameEn) formDataToSend.append('nameEn', formData.nameEn);
      formDataToSend.append('categoryId', formData.categoryId);

      // Add images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      if (brand) {
        await brandService.update(auth.site, auth.token, brand.id, formDataToSend);
        toast.success('Brend yangilandi');
      } else {
        await brandService.create(auth.site, auth.token, formDataToSend);
        toast.success('Brend yaratildi');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {brand ? 'Brendni tahrirlash' : 'Yangi brend'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomi (RU)
            </label>
            <input
              type="text"
              value={formData.nameRu}
              onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomi (EN)
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriya *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Tanlang</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameRu || cat.name || cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rasmlar
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Rasm tanlash</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {images.length > 0 && (
                <span className="text-sm text-gray-600">{images.length} fayl tanlandi</span>
              )}
            </div>
            {existingImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {existingImages.map((img, idx) => {
                  const imageUrl = img.startsWith('http') || img.startsWith('/') 
                    ? img 
                    : `https://gpg-backend-vgrz.onrender.com/upload/brands/${img}`;
                  return (
                    <img 
                      key={idx} 
                      src={imageUrl} 
                      alt="Existing" 
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        if (!img.startsWith('http')) {
                          (e.target as HTMLImageElement).src = img;
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Saqlanmoqda...' : brand ? 'Yangilash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;

