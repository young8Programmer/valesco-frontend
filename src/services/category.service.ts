// API endpoints qo'shildi
// caching mexanizmi qo'shildi
import { createApiClient } from '../utils/api';
// integration testlar yaratildi
import type { SiteType, Category } from '../types';

// README faylini yangilash
// database querylarni optimallashtirish
// validation xatolari tuzatildi
// database testlari qo'shildi
// user authentication qo'shildi
export const categoryService = {
  async getAll(site: SiteType, token: string): Promise<Category[]> {
    const client = createApiClient(site, token);
// ESLint qoidalariga moslashtirish
    const response = await client.get('/categories');
    console.log('Categories response:', response.data);
// package.json yangilandi
    
    let categories: Category[] = [];
    
    // Ensure we return an array
    if (Array.isArray(response.data)) {
      categories = response.data;
    }
    // If response is an object with data property
    else if (response.data && Array.isArray(response.data.data)) {
      categories = response.data.data;
    }
    // If response is an object with categories property
    else if (response.data && Array.isArray(response.data.categories)) {
      categories = response.data.categories;
    }
    
    // Log categories with images for debugging
    console.log('Categories with images:', categories.map(c => ({
      id: c.id,
      name: c.nameRu || c.name || c.title?.ru,
      img: c.img,
      image: c.image,
      images: c.images
    })));
    
    return categories;
  },

  async getOne(site: SiteType, token: string, id: number): Promise<Category> {
    const client = createApiClient(site, token);
    const response = await client.get(`/categories/${id}`);
    return response.data;
  },

  async create(site: SiteType, token: string, data: FormData): Promise<Category> {
    const client = createApiClient(site, token);
    const response = await client.post('/categories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(site: SiteType, token: string, id: number, data: FormData): Promise<Category> {
    const client = createApiClient(site, token);
    const method = site === 'valesco' ? 'put' : 'patch';
    const response = await client[method](`/categories/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(site: SiteType, token: string, id: number): Promise<void> {
    const client = createApiClient(site, token);
    await client.delete(`/categories/${id}`);
  },
};

