import { Product, ProductNotFoundError } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getProductBySku(sku: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${sku}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable caching for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        const errorData: ProductNotFoundError = await response.json();
        throw new ApiError(
          errorData.message || 'Produto não encontrado',
          404,
          'Not Found'
        );
      }
      
      throw new ApiError(
        `Erro na API: ${response.status}`,
        response.status
      );
    }

    const product: Product = await response.json();
    return product;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      'Erro de conexão com o servidor',
      500
    );
  }
}