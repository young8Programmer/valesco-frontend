// kod uslubini yaxshilash
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// shopping cart funksiyasi qo'shildi
import { brandService } from '../services/brand.service';
// unit testlar qo'shildi
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    } else {
      // Reset when creating new brand
      setFormData({
        name: '',
        nameRu: '',
        nameEn: '',
        categoryId: '',
      });
      setImages([]);
      setImagePreviews([]);
      setExistingImages([]);
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
      // categoryId must be sent as string (FormData limitation), backend will parse it
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

      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setImagePreviews([]);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Add to existing images
      setImages(prev => [...prev, ...newFiles]);
      // Create previews for new images
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-white border-b px-6 py-4 flex items-center justify-between">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    : `http://103.125.219.167:3000/upload/brands/${img}`;
                  return (
                    <div key={idx} className="relative">
                      <img 
                        src={imageUrl} 
                        alt="Existing" 
                        className="w-32 h-32 object-cover rounded"
                        onError={(e) => {
                          if (!img.startsWith('http')) {
                            (e.target as HTMLImageElement).src = img;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {imagePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center justify-end space-x-3 pt-4 border-t bg-white sticky bottom-0">
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

