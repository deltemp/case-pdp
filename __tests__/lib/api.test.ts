import { getProductBySku, ApiError } from '../../src/lib/api';
import { Product, ProductNotFoundError } from '../../src/types/product';

// Mock fetch globally
global.fetch = jest.fn();

describe('api', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    brand: 'Test Brand',
    sku: 'TEST-001',
    price: 99.99,
    description: 'Test product description',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  describe('ApiError', () => {
    it('should create ApiError with message and status', () => {
      const error = new ApiError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.name).toBe('ApiError');
      expect(error.error).toBeUndefined();
    });

    it('should create ApiError with message, status, and error', () => {
      const error = new ApiError('Test error', 404, 'Not Found');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.error).toBe('Not Found');
      expect(error.name).toBe('ApiError');
    });

    it('should extend Error class', () => {
      const error = new ApiError('Test error', 500);
      
      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApiError).toBe(true);
    });
  });

  describe('getProductBySku', () => {
    it('should return product when API call is successful', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getProductBySku('TEST-001');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/products/TEST-001',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }
      );
      expect(result).toEqual(mockProduct);
    });

    it('should use default API_BASE_URL when environment variable is not set', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      // Mock successful response
      const mockProduct = { id: 1, sku: 'TEST-001', name: 'Test Product' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      await getProductBySku('TEST-001');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/products/TEST-001',
        expect.any(Object)
      );

      // Restore original environment
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });

    it('should throw ApiError with 404 status when product is not found', async () => {
      const mockErrorData: ProductNotFoundError = {
        status: 404,
        message: 'Produto não encontrado',
        error: 'Not Found',
      };
      
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(mockErrorData),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(getProductBySku('INVALID-SKU')).rejects.toThrow(ApiError);
      
      try {
        await getProductBySku('INVALID-SKU');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Produto não encontrado');
        expect((error as ApiError).error).toBe('Not Found');
      }
    });

    it('should throw ApiError with default message when 404 response has no message', async () => {
      const mockErrorData = {};
      
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(mockErrorData),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await getProductBySku('INVALID-SKU');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Produto não encontrado');
        expect((error as ApiError).error).toBe('Not Found');
      }
    });

    it('should throw ApiError for other HTTP error statuses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro na API: 500');
      }
    });

    it('should throw ApiError for network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro de conexão com o servidor');
      }
    });

    it('should re-throw ApiError when it is already an ApiError', async () => {
      const originalError = new ApiError('Original error', 400);
      (global.fetch as jest.Mock).mockRejectedValue(originalError);

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBe(originalError);
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).message).toBe('Original error');
      }
    });

    it('should handle JSON parsing errors in 404 response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await getProductBySku('INVALID-SKU');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro de conexão com o servidor');
      }
    });

    it('should handle JSON parsing errors in successful response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro de conexão com o servidor');
      }
    });

    it('should handle empty SKU parameter', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await getProductBySku('');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/products/',
        expect.any(Object)
      );
    });

    it('should handle SKU with special characters', async () => {
      const specialSku = 'TEST-001@#$%';
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await getProductBySku(specialSku);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/products/${specialSku}`,
        expect.any(Object)
      );
    });

    it('should include correct headers in request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await getProductBySku('TEST-001');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        })
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro de conexão com o servidor');
      }
    });

    it('should handle abort errors', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      try {
        await getProductBySku('TEST-001');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Erro de conexão com o servidor');
      }
    });

    it('should handle response with null body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(null),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getProductBySku('TEST-001');
      expect(result).toBeNull();
    });

    it('should handle different HTTP status codes', async () => {
      const statusCodes = [400, 401, 403, 500, 502, 503];
      
      for (const statusCode of statusCodes) {
        const mockResponse = {
          ok: false,
          status: statusCode,
          json: jest.fn(),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        try {
          await getProductBySku('TEST-001');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          expect((error as ApiError).status).toBe(statusCode);
          expect((error as ApiError).message).toBe(`Erro na API: ${statusCode}`);
        }
      }
    });
  });
});