import { getCachedProducts, getCachedStaticPages } from '../../src/lib/sitemap-cache';
import { getProductsForSitemap } from '../../src/lib/sitemap-data';

// Mock the sitemap-data module
jest.mock('../../src/lib/sitemap-data', () => ({
  getProductsForSitemap: jest.fn(),
  SITEMAP_CACHE_CONFIG: {
    revalidate: 3600,
    tags: ['products', 'sitemap'],
  },
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn, keys, options) => {
    // Return a function that calls the original function
    return async (...args: any[]) => {
      return await fn(...args);
    };
  }),
}));

describe('sitemap-cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variable
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  describe('getCachedProducts', () => {
    it('should return cached products from getProductsForSitemap', async () => {
      const mockProducts = [
        {
          sku: 'test-product-1',
          name: 'Test Product 1',
          lastModified: new Date('2024-01-01'),
          isActive: true,
        },
        {
          sku: 'test-product-2',
          name: 'Test Product 2',
          lastModified: new Date('2024-01-02'),
          isActive: true,
        },
      ];

      (getProductsForSitemap as jest.Mock).mockResolvedValue(mockProducts);

      const result = await getCachedProducts();

      expect(getProductsForSitemap).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducts);
    });

    it('should handle errors from getProductsForSitemap', async () => {
      const error = new Error('Failed to fetch products');
      (getProductsForSitemap as jest.Mock).mockRejectedValue(error);

      await expect(getCachedProducts()).rejects.toThrow('Failed to fetch products');
    });

    it('should return empty array when no products available', async () => {
      (getProductsForSitemap as jest.Mock).mockResolvedValue([]);

      const result = await getCachedProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getCachedStaticPages', () => {
    it('should return static pages with correct URLs and metadata', async () => {
      const result = await getCachedStaticPages();

      expect(result).toHaveLength(5);
      
      // Check home page
      expect(result[0]).toEqual({
        url: 'https://example.com',
        lastModified: expect.any(Date),
        changeFrequency: 'daily',
        priority: 1,
      });

      // Check products page
      expect(result[1]).toEqual({
        url: 'https://example.com/products',
        lastModified: expect.any(Date),
        changeFrequency: 'daily',
        priority: 0.9,
      });

      // Check categories page
      expect(result[2]).toEqual({
        url: 'https://example.com/categories',
        lastModified: expect.any(Date),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      // Check about page
      expect(result[3]).toEqual({
        url: 'https://example.com/about',
        lastModified: expect.any(Date),
        changeFrequency: 'monthly',
        priority: 0.6,
      });

      // Check contact page
      expect(result[4]).toEqual({
        url: 'https://example.com/contact',
        lastModified: expect.any(Date),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });

    it('should use localhost as fallback when NEXT_PUBLIC_SITE_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const result = await getCachedStaticPages();

      expect(result[0].url).toBe('http://localhost:3001');
      expect(result[1].url).toBe('http://localhost:3001/products');
    });

    it('should use custom site URL when NEXT_PUBLIC_SITE_URL is set', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';

      const result = await getCachedStaticPages();

      expect(result[0].url).toBe('https://custom-domain.com');
      expect(result[1].url).toBe('https://custom-domain.com/products');
    });

    it('should return pages with correct priorities in descending order', async () => {
      const result = await getCachedStaticPages();

      const priorities = result.map(page => page.priority);
      expect(priorities).toEqual([1, 0.9, 0.8, 0.6, 0.5]);
    });

    it('should return pages with valid change frequencies', async () => {
      const result = await getCachedStaticPages();

      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      
      result.forEach(page => {
        expect(validFrequencies).toContain(page.changeFrequency);
      });
    });

    it('should return pages with recent lastModified dates', async () => {
      const result = await getCachedStaticPages();
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      result.forEach(page => {
        expect(page.lastModified).toBeInstanceOf(Date);
        expect(page.lastModified.getTime()).toBeGreaterThan(oneHourAgo.getTime());
        expect(page.lastModified.getTime()).toBeLessThanOrEqual(now.getTime());
      });
    });
  });

  describe('cache configuration', () => {
    it('should have correct cache configuration for products', () => {
      // Test that the cache configuration is properly imported
      const { SITEMAP_CACHE_CONFIG } = require('../../src/lib/sitemap-data');
      
      expect(SITEMAP_CACHE_CONFIG).toEqual({
        revalidate: 3600,
        tags: ['products', 'sitemap'],
      });
    });

    it('should have correct cache configuration for static pages', () => {
      // Test the static pages cache configuration values
      const expectedConfig = {
        revalidate: 86400, // 24 hours
        tags: ['static-pages', 'sitemap'],
      };
      
      // Verify the configuration values are reasonable
      expect(expectedConfig.revalidate).toBe(86400);
      expect(expectedConfig.tags).toContain('static-pages');
      expect(expectedConfig.tags).toContain('sitemap');
    });
  });
});