export type SiteType = 'gpg' | 'valesco';
export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  user: {
    id: number;
    login?: string;
    username?: string;
    name?: string;
    email?: string;
    role: string;
    sites?: string[];
  };
}
export interface AuthState {
  site: SiteType | null;
  token: string | null;
  user: AuthResponse['user'] | null;
}
export interface Product {
  id: number;
  nameRu?: string;
  nameEn?: string;
  title?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  description_ru?: string;
  description_en?: string;
  images?: string[];
  image?: string[];
  price?: number;
  categoryId?: number;
  category?: {
    id: number;
    [key: string]: any;
  };
  brandId?: number;
  specifications?: string[];
  documents?: string[];
  [key: string]: any;
}
export interface Category {
  id: number;
  nameRu?: string;
  nameEn?: string;
  name?: string;
  title?: {
    ru?: string;
    en?: string;
  };
  descriptionRu?: string;
  descriptionEn?: string;
  image?: string;
  img?: string;
  images?: string[];
  [key: string]: any;
}
export interface Brand {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  image?: string;
}