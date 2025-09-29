export interface Product {
  id: number;
  name: string;
  brand: string;
  sku: string;
  price: number;
  description: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductApiResponse {
  status?: number;
  message?: string;
  error?: string;
}

export interface ProductNotFoundError extends ProductApiResponse {
  status: 404;
  message: string;
  error: 'Not Found';
}