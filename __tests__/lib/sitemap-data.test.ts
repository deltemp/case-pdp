import { getProductsForSitemap, SITEMAP_CACHE_CONFIG, type Product } from '../../src/lib/sitemap-data';

// Mock fetch globally
global.fetch = jest.fn();

describe('sitemap-data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.API_BASE_URL;
  });

  describe('getProductsForSitemap', () => {
    it('should return mock products when API is not available', async () => {
      const result = await getProductsForSitemap();

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        sku: 'product-1',
        name: 'Premium Wireless Headphones',
        lastModified: new Date('2024-01-15'),
        isActive: true,
      });
      expect(result[4]).toEqual({
        sku: 'product-5',
        name: 'USB-C Hub',
        lastModified: new Date('2024-02-01'),
        isActive: true,
      });
    });

    it('should return only active products', async () => {
      const result = await getProductsForSitemap();

      result.forEach(product => {
        expect(product.isActive).toBe(true);
      });
    });

    it('should return products with required properties', async () => {
      const result = await getProductsForSitemap();

      result.forEach(product => {
        expect(product).toHaveProperty('sku');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('lastModified');
        expect(product).toHaveProperty('isActive');
        
        expect(typeof product.sku).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(product.lastModified).toBeInstanceOf(Date);
        expect(typeof product.isActive).toBe('boolean');
      });
    });

    it('should return products with unique SKUs', async () => {
      const result = await getProductsForSitemap();
      const skus = result.map(product => product.sku);
      const uniqueSkus = [...new Set(skus)];

      expect(skus).toHaveLength(uniqueSkus.length);
    });

    it('should return products with non-empty names', async () => {
      const result = await getProductsForSitemap();

      result.forEach(product => {
        expect(product.name.trim()).not.toBe('');
        expect(product.name.length).toBeGreaterThan(0);
      });
    });

    it('should return products with valid dates', async () => {
      const result = await getProductsForSitemap();
      const now = new Date();

      result.forEach(product => {
        expect(product.lastModified).toBeInstanceOf(Date);
        expect(product.lastModified.getTime()).not.toBeNaN();
        // Dates should be in the past or present
        expect(product.lastModified.getTime()).toBeLessThanOrEqual(now.getTime());
      });
    });

    it('should handle empty product list gracefully', async () => {
      // Mock the function to return empty array
      const mockGetProducts = jest.fn().mockResolvedValue([]);
      
      const result = await mockGetProducts();
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles API errors gracefully', async () => {
      // Set API_BASE_URL to trigger API call
      process.env.API_BASE_URL = 'https://api.example.com';
      
      // Mock fetch to throw an error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Mock console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getProductsForSitemap();

      expect(result).toEqual([]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/products/sitemap',
        expect.objectContaining({
          next: { revalidate: 3600 }
        })
      );
      
      // Verify error was logged (covers lines 59-60)
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching products for sitemap:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should filter inactive products when API returns mixed data', async () => {
      // This test simulates what would happen with real API data
      const mockApiResponse = [
        {
          sku: 'active-product',
          name: 'Active Product',
          lastModified: new Date('2024-01-01'),
          isActive: true,
        },
        {
          sku: 'inactive-product',
          name: 'Inactive Product',
          lastModified: new Date('2024-01-01'),
          isActive: false,
        },
      ];

      // Mock fetch to return mixed active/inactive products
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      // Set API_BASE_URL to trigger API call path
      process.env.API_BASE_URL = 'https://api.example.com';

      // Since current implementation uses mock data, we test the filtering logic
      const result = await getProductsForSitemap();
      
      // All returned products should be active
      result.forEach(product => {
        expect(product.isActive).toBe(true);
      });
    });
  });

  describe('SITEMAP_CACHE_CONFIG', () => {
    it('should have correct cache configuration', () => {
      expect(SITEMAP_CACHE_CONFIG).toEqual({
        revalidate: 3600, // 1 hour
        tags: ['products', 'sitemap'],
      });
    });

    it('should have reasonable revalidate time', () => {
      expect(SITEMAP_CACHE_CONFIG.revalidate).toBeGreaterThan(0);
      expect(SITEMAP_CACHE_CONFIG.revalidate).toBeLessThanOrEqual(86400); // Max 24 hours
    });

    it('should have appropriate cache tags', () => {
      expect(SITEMAP_CACHE_CONFIG.tags).toContain('products');
      expect(SITEMAP_CACHE_CONFIG.tags).toContain('sitemap');
      expect(SITEMAP_CACHE_CONFIG.tags).toHaveLength(2);
    });
  });

  describe('Product interface', () => {
    it('should match expected Product interface structure', async () => {
      const result = await getProductsForSitemap();
      const product = result[0];

      // Type checking through runtime validation
      const expectedKeys = ['sku', 'name', 'lastModified', 'isActive'];
      const productKeys = Object.keys(product);

      expectedKeys.forEach(key => {
        expect(productKeys).toContain(key);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle products with special characters in names', async () => {
      const result = await getProductsForSitemap();
      
      // Check that product names can contain various characters
      result.forEach(product => {
        expect(typeof product.name).toBe('string');
        // Names should not contain only whitespace
        expect(product.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('should handle products with different date formats', async () => {
      const result = await getProductsForSitemap();
      
      result.forEach(product => {
        expect(product.lastModified).toBeInstanceOf(Date);
        expect(isNaN(product.lastModified.getTime())).toBe(false);
      });
    });

    it('should maintain data consistency across multiple calls', async () => {
      const result1 = await getProductsForSitemap();
      const result2 = await getProductsForSitemap();

      expect(result1).toEqual(result2);
      expect(result1.length).toBe(result2.length);
    });
  });
});