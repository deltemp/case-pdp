import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductPage, { generateMetadata } from '@/app/product/[sku]/page';
import { getProductBySku, ApiError } from '@/lib/api';
import { Product } from '@/types/product';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

jest.mock('@/lib/api', () => {
  class MockApiError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  return {
    getProductBySku: jest.fn(),
    ApiError: MockApiError,
  };
});

jest.mock('@/components/ProductImage', () => {
  return {
    ProductImage: function MockProductImage({ src, alt }: { src: string; alt: string; priority?: boolean }) {
      return <div data-testid="product-image">{alt} Image</div>;
    }
  };
});

jest.mock('@/components/ProductDetails', () => {
  return {
    ProductDetails: function MockProductDetails({ product }: { product: Product }) {
      return <div data-testid="product-details">{product.name} Details</div>;
    }
  };
});

jest.mock('@/components/ProductActions/ProductActions', () => {
  return {
    ProductActions: function MockProductActions({ product }: { product: Product }) {
      return (
        <div data-testid="product-actions" className="space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantidade:</label>
            <div data-testid="quantity-spinner">Quantity Spinner</div>
          </div>
          <div data-testid="add-to-cart-button">Add to Cart Button</div>
          <div data-testid="social-actions">Social Actions</div>
        </div>
      );
    }
  };
});

const mockProduct: Product = {
  id: 1,
  name: 'Sofá 3 Lugares Comfort',
  brand: 'MóveisTop',
  sku: 'sf-comfort-3l-bg',
  price: 1299.99,
  description: 'Sofá confortável de 3 lugares em tecido bege.',
  imageUrl: 'https://example.com/sofa.jpg',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

const { notFound } = require('next/navigation');
const mockGetProductBySku = getProductBySku as jest.MockedFunction<typeof getProductBySku>;
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

describe('ProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product page with all components when product exists', async () => {
    mockGetProductBySku.mockResolvedValue(mockProduct);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    const ProductPageComponent = await ProductPage({ params });
    
    render(ProductPageComponent);

    expect(screen.getByTestId('product-image')).toBeInTheDocument();
    expect(screen.getByTestId('product-details')).toBeInTheDocument();
    expect(screen.getByTestId('product-actions')).toBeInTheDocument();
    
    expect(screen.getByText('Sofá 3 Lugares Comfort Image')).toBeInTheDocument();
    expect(screen.getByText('Sofá 3 Lugares Comfort Details')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument();
    expect(screen.getByTestId('social-actions')).toBeInTheDocument();
  });

  it('calls notFound when product does not exist', async () => {
    const error = new ApiError('Product not found', 404);
    mockGetProductBySku.mockRejectedValue(error);

    const params = Promise.resolve({ sku: 'non-existent-sku' });
    
    await expect(ProductPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('calls getProductBySku with correct SKU', async () => {
    mockGetProductBySku.mockResolvedValue(mockProduct);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    await ProductPage({ params });

    expect(mockGetProductBySku).toHaveBeenCalledWith('sf-comfort-3l-bg');
  });

  it('has proper page structure and layout', async () => {
    mockGetProductBySku.mockResolvedValue(mockProduct);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    const ProductPageComponent = await ProductPage({ params });
    
    render(ProductPageComponent);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('min-h-screen', 'bg-gray-50');
    
    const containerDiv = screen.getByText('Sofá 3 Lugares Comfort Image').closest('.container');
    expect(containerDiv).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('throws error for non-404/400 API errors', async () => {
    const error = new ApiError('Internal server error', 500);
    mockGetProductBySku.mockRejectedValue(error);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    
    await expect(ProductPage({ params })).rejects.toThrow('Internal server error');
    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('throws error for generic errors', async () => {
    const error = new Error('Network error');
    mockGetProductBySku.mockRejectedValue(error);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    
    await expect(ProductPage({ params })).rejects.toThrow('Network error');
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates correct metadata for existing product', async () => {
    mockGetProductBySku.mockResolvedValue(mockProduct);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    const metadata = await generateMetadata({ params });

    expect(metadata).toEqual({
      title: 'Sofá 3 Lugares Comfort - MóveisTop | E-commerce Móveis',
      description: 'Sofá confortável de 3 lugares em tecido bege.',
      alternates: {
        canonical: 'http://localhost:3001/product/sf-comfort-3l-bg',
      },
      openGraph: {
        title: 'Sofá 3 Lugares Comfort - MóveisTop',
        description: 'Sofá confortável de 3 lugares em tecido bege.',
        images: [{
          url: 'https://example.com/sofa.jpg',
          width: 600,
          height: 400,
          alt: 'Sofá 3 Lugares Comfort',
        }],
        type: 'website',
        url: 'http://localhost:3001/product/sf-comfort-3l-bg',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Sofá 3 Lugares Comfort - MóveisTop',
        description: 'Sofá confortável de 3 lugares em tecido bege.',
        images: ['https://example.com/sofa.jpg'],
      },
    });
  });

  it('generates fallback metadata for non-existent product', async () => {
    const error = new ApiError('Product not found', 404);
    mockGetProductBySku.mockRejectedValue(error);

    const params = Promise.resolve({ sku: 'non-existent-sku' });
    const metadata = await generateMetadata({ params });

    expect(metadata).toEqual({
      title: 'Produto não encontrado | E-commerce Móveis',
      description: 'O produto que você está procurando não foi encontrado. Navegue por nosso catálogo para descobrir outros produtos incríveis.',
      alternates: {
        canonical: 'http://localhost:3001/product/non-existent-sku',
      },
    });
  });

  it('calls getProductBySku with correct SKU for metadata', async () => {
    mockGetProductBySku.mockResolvedValue(mockProduct);

    const params = Promise.resolve({ sku: 'sf-comfort-3l-bg' });
    await generateMetadata({ params });

    expect(mockGetProductBySku).toHaveBeenCalledWith('sf-comfort-3l-bg');
  });
});