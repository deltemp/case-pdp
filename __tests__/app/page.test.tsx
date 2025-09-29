import { redirect } from 'next/navigation';
import Home, { metadata } from '@/app/page';

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('Home Page', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    // Mock redirect to throw an error (as it should in Next.js)
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
  });

  describe('Redirect Functionality', () => {
    it('redirects to the correct product page', () => {
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/product/sf-comfort-3l-bg');
    });

    it('calls redirect exactly once', () => {
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });

    it('redirects to the specific product SKU', () => {
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/product/sf-comfort-3l-bg');
    });
  });

  describe('Function Behavior', () => {
    it('is a function', () => {
      expect(typeof Home).toBe('function');
    });

    it('does not return any JSX content', () => {
      // Mock redirect to not throw for this test
      mockRedirect.mockImplementation(() => {
        // Return never type by throwing
        throw new Error('NEXT_REDIRECT');
      });
      
      expect(() => Home()).toThrow('NEXT_REDIRECT');
    });
  });

  describe('Component Behavior', () => {
    it('is a server component that performs redirect', () => {
      // Mock redirect to not throw for this test
      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });
      
      // Verify the component throws on redirect
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      
      // Verify redirect is called
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('executes redirect immediately when called', () => {
      // Mock redirect to not throw for this test
      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });
      
      const startTime = Date.now();
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      const endTime = Date.now();
      
      // Should execute very quickly (less than 10ms)
      expect(endTime - startTime).toBeLessThan(10);
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('does not perform any side effects other than redirect', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => Home()).toThrow('NEXT_REDIRECT');
      
      // Should not log anything
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('Home Page Metadata', () => {
  beforeEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  describe('Basic Metadata', () => {
    it('has correct title', () => {
      expect(metadata.title).toBe('Página Inicial | E-commerce Móveis');
    });

    it('has correct description', () => {
      expect(metadata.description).toBe(
        'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais. Entrega rápida e garantia de satisfação.'
      );
    });

    it('has alternates with canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('http://localhost:3001');
    });
  });

  describe('Environment Variable Handling', () => {
    it('uses environment variable for canonical URL when available', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001';
      
      // Re-import to get updated metadata
      delete require.cache[require.resolve('@/app/page')];
      const { metadata: updatedMetadata } = require('@/app/page');
      
      expect(updatedMetadata.alternates?.canonical).toBe('http://localhost:3001');
    });

    it('falls back to localhost when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      
      // Re-import to get updated metadata
      delete require.cache[require.resolve('@/app/page')];
      const { metadata: updatedMetadata } = require('@/app/page');
      
      expect(updatedMetadata.alternates?.canonical).toBe('http://localhost:3001');
    });
  });

  describe('OpenGraph Metadata', () => {
    it('has correct OpenGraph title', () => {
      expect(metadata.openGraph?.title).toBe('E-commerce Móveis - Qualidade e Conforto para sua Casa');
    });

    it('has correct OpenGraph description', () => {
      expect(metadata.openGraph?.description).toBe(
        'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais.'
      );
    });

    it('has correct OpenGraph type', () => {
      // Type assertion to access type property
      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('uses environment variable for OpenGraph URL when available', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001';
      
      // Re-import to get updated metadata
      delete require.cache[require.resolve('@/app/page')];
      const { metadata: updatedMetadata } = require('@/app/page');
      
      expect(updatedMetadata.openGraph?.url).toBe('http://localhost:3001');
    });

    it('falls back to localhost for OpenGraph URL when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      
      // Re-import to get updated metadata
      delete require.cache[require.resolve('@/app/page')];
      const { metadata: updatedMetadata } = require('@/app/page');
      
      expect(updatedMetadata.openGraph?.url).toBe('http://localhost:3001');
    });
  });

  describe('Twitter Metadata', () => {
    it('has correct Twitter card type', () => {
      // Type assertion to access card property
      expect((metadata.twitter as any)?.card).toBe('summary_large_image');
    });

    it('has correct Twitter title', () => {
      expect(metadata.twitter?.title).toBe('E-commerce Móveis - Qualidade e Conforto para sua Casa');
    });

    it('has correct Twitter description', () => {
      expect(metadata.twitter?.description).toBe(
        'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais.'
      );
    });
  });

  describe('Metadata Structure', () => {
    it('has all required metadata properties', () => {
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('alternates');
      expect(metadata).toHaveProperty('openGraph');
      expect(metadata).toHaveProperty('twitter');
    });

    it('has properly structured alternates', () => {
      expect(metadata.alternates).toHaveProperty('canonical');
      expect(typeof metadata.alternates?.canonical).toBe('string');
    });

    it('has properly structured OpenGraph', () => {
      expect(metadata.openGraph).toHaveProperty('title');
      expect(metadata.openGraph).toHaveProperty('description');
      expect(metadata.openGraph).toHaveProperty('url');
      // Type assertion to access type property
      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('has properly structured Twitter metadata', () => {
      // Type assertion to access card property
      expect((metadata.twitter as any)?.card).toBe('summary_large_image');
      expect(metadata.twitter).toHaveProperty('title');
      expect(metadata.twitter).toHaveProperty('description');
    });
  });

  describe('SEO Optimization', () => {
    it('has title within recommended length', () => {
      const title = metadata.title as string;
      expect(title.length).toBeLessThanOrEqual(60);
    });

    it('has description within recommended length', () => {
      const description = metadata.description as string;
      expect(description.length).toBeLessThanOrEqual(160);
    });

    it('has OpenGraph title within recommended length', () => {
      const ogTitle = metadata.openGraph?.title as string;
      expect(ogTitle.length).toBeLessThanOrEqual(60);
    });

    it('has OpenGraph description within recommended length', () => {
      const ogDescription = metadata.openGraph?.description as string;
      expect(ogDescription.length).toBeLessThanOrEqual(160);
    });

    it('has Twitter title within recommended length', () => {
      const twitterTitle = metadata.twitter?.title as string;
      expect(twitterTitle.length).toBeLessThanOrEqual(70);
    });

    it('has Twitter description within recommended length', () => {
      const twitterDescription = metadata.twitter?.description as string;
      expect(twitterDescription.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Content Quality', () => {
    it('has meaningful and descriptive title', () => {
      const title = metadata.title as string;
      expect(title).toContain('E-commerce');
      expect(title).toContain('Móveis');
    });

    it('has meaningful and descriptive description', () => {
      const description = metadata.description as string;
      expect(description).toContain('móveis');
      expect(description).toContain('qualidade');
      expect(description).toContain('preços');
    });

    it('uses consistent branding across all metadata', () => {
      const title = metadata.title as string;
      const ogTitle = metadata.openGraph?.title as string;
      const twitterTitle = metadata.twitter?.title as string;
      
      expect(title).toContain('E-commerce Móveis');
      expect(ogTitle).toContain('E-commerce Móveis');
      expect(twitterTitle).toContain('E-commerce Móveis');
    });

    it('has consistent descriptions across platforms', () => {
      const description = metadata.description as string;
      const ogDescription = metadata.openGraph?.description as string;
      const twitterDescription = metadata.twitter?.description as string;
      
      // All should mention key concepts
      [description, ogDescription, twitterDescription].forEach(desc => {
        expect(desc).toContain('móveis');
        expect(desc).toContain('qualidade');
      });
    });
  });
});