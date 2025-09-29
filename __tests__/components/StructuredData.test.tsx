import React from 'react';
import { render } from '@testing-library/react';
import {
  OrganizationSchema,
  BreadcrumbSchema,
  ProductSchema,
  WebsiteSchema,
} from '@/components/StructuredData';

// Helper function to extract JSON-LD data from rendered component
function getJsonLdData(container: HTMLElement): any {
  const script = container.querySelector('script[type="application/ld+json"]');
  return script ? JSON.parse(script.innerHTML) : null;
}

describe('StructuredData Components', () => {
  describe('OrganizationSchema', () => {
    it('should render with default props', () => {
      const { container } = render(<OrganizationSchema />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Your E-commerce Store',
        url: 'http://localhost:3001',
        logo: 'http://localhost:3001/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-123-4567',
          contactType: 'Customer Service',
          availableLanguage: 'English',
        },
        sameAs: [
          'https://www.facebook.com/yourstore',
          'https://www.twitter.com/yourstore',
          'https://www.instagram.com/yourstore',
        ],
      });
    });

    it('should render with custom props', () => {
      const customProps = {
        name: 'Custom Store',
        url: 'https://customstore.com',
        logo: '/custom-logo.png',
        contactPhone: '+1-555-999-8888',
        socialLinks: [
          'https://www.facebook.com/customstore',
          'https://www.linkedin.com/company/customstore',
        ],
      };

      const { container } = render(<OrganizationSchema {...customProps} />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Custom Store',
        url: 'https://customstore.com',
        logo: 'https://customstore.com/custom-logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-999-8888',
          contactType: 'Customer Service',
          availableLanguage: 'English',
        },
        sameAs: [
          'https://www.facebook.com/customstore',
          'https://www.linkedin.com/company/customstore',
        ],
      });
    });

    it('should handle empty social links', () => {
      const { container } = render(<OrganizationSchema socialLinks={[]} />);
      const data = getJsonLdData(container);

      expect(data.sameAs).toEqual([]);
    });

    it('should use environment variable for URL when available', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://env-site.com';

      const { container } = render(<OrganizationSchema />);
      const data = getJsonLdData(container);

      expect(data.url).toBe('https://env-site.com');
      expect(data.logo).toBe('https://env-site.com/logo.png');

      // Restore original environment
      if (originalEnv) {
        process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      }
    });
  });

  describe('BreadcrumbSchema', () => {
    it('should render breadcrumb schema with multiple items', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Category', url: 'https://example.com/category' },
        { name: 'Product', url: 'https://example.com/category/product' },
      ];

      const { container } = render(<BreadcrumbSchema items={items} />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://example.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Category',
            item: 'https://example.com/category',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Product',
            item: 'https://example.com/category/product',
          },
        ],
      });
    });

    it('should render breadcrumb schema with single item', () => {
      const items = [{ name: 'Home', url: 'https://example.com' }];

      const { container } = render(<BreadcrumbSchema items={items} />);
      const data = getJsonLdData(container);

      expect(data.itemListElement).toHaveLength(1);
      expect(data.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });
    });

    it('should handle empty items array', () => {
      const { container } = render(<BreadcrumbSchema items={[]} />);
      const data = getJsonLdData(container);

      expect(data.itemListElement).toEqual([]);
    });
  });

  describe('ProductSchema', () => {
    const defaultProductProps = {
      name: 'Test Product',
      description: 'A great test product',
      sku: 'TEST-001',
      brand: 'Test Brand',
      category: 'Test Category',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      price: 99.99,
      inStock: true,
    };

    it('should render product schema with default currency', () => {
      const { container } = render(<ProductSchema {...defaultProductProps} />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Product',
        description: 'A great test product',
        sku: 'TEST-001',
        brand: {
          '@type': 'Brand',
          name: 'Test Brand',
        },
        category: 'Test Category',
        image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        offers: {
          '@type': 'Offer',
          price: '99.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Your E-commerce Store',
          },
        },
      });
    });

    it('should render product schema with custom currency and seller', () => {
      const customProps = {
        ...defaultProductProps,
        currency: 'EUR',
        seller: 'Custom Seller',
      };

      const { container } = render(<ProductSchema {...customProps} />);
      const data = getJsonLdData(container);

      expect(data.offers.priceCurrency).toBe('EUR');
      expect(data.offers.seller.name).toBe('Custom Seller');
    });

    it('should render product schema when out of stock', () => {
      const outOfStockProps = {
        ...defaultProductProps,
        inStock: false,
      };

      const { container } = render(<ProductSchema {...outOfStockProps} />);
      const data = getJsonLdData(container);

      expect(data.offers.availability).toBe('https://schema.org/OutOfStock');
    });

    it('should handle single image', () => {
      const singleImageProps = {
        ...defaultProductProps,
        images: ['https://example.com/single-image.jpg'],
      };

      const { container } = render(<ProductSchema {...singleImageProps} />);
      const data = getJsonLdData(container);

      expect(data.image).toEqual(['https://example.com/single-image.jpg']);
    });

    it('should handle empty images array', () => {
      const noImagesProps = {
        ...defaultProductProps,
        images: [],
      };

      const { container } = render(<ProductSchema {...noImagesProps} />);
      const data = getJsonLdData(container);

      expect(data.image).toEqual([]);
    });

    it('should format price as string', () => {
      const priceProps = {
        ...defaultProductProps,
        price: 123.456,
      };

      const { container } = render(<ProductSchema {...priceProps} />);
      const data = getJsonLdData(container);

      expect(data.offers.price).toBe('123.456');
      expect(typeof data.offers.price).toBe('string');
    });
  });

  describe('WebsiteSchema', () => {
    it('should render with default props', () => {
      const { container } = render(<WebsiteSchema />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Your E-commerce Store',
        url: 'http://localhost:3001',
        description: 'Discover quality products at competitive prices.',
      });
    });

    it('should render with custom props', () => {
      const customProps = {
        name: 'Custom Website',
        url: 'https://customwebsite.com',
        description: 'Custom description for the website',
      };

      const { container } = render(<WebsiteSchema {...customProps} />);
      const data = getJsonLdData(container);

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Custom Website',
        url: 'https://customwebsite.com',
        description: 'Custom description for the website',
      });
    });

    it('should render with potential action', () => {
      const potentialAction = {
        target: 'https://example.com/search?q={search_term_string}',
        queryInput: 'required name=search_term_string',
      };

      const { container } = render(<WebsiteSchema potentialAction={potentialAction} />);
      const data = getJsonLdData(container);

      expect(data.potentialAction).toEqual({
        '@type': 'SearchAction',
        target: 'https://example.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      });
    });

    it('should use environment variable for URL when available', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://env-website.com';

      const { container } = render(<WebsiteSchema />);
      const data = getJsonLdData(container);

      expect(data.url).toBe('https://env-website.com');

      // Restore original environment
      if (originalEnv) {
        process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      }
    });
  });

  describe('Script tag validation', () => {
    it('should render valid script tags for all components', () => {
      const { container } = render(
        <>
          <OrganizationSchema />
          <BreadcrumbSchema items={[{ name: 'Home', url: 'https://example.com' }]} />
          <ProductSchema
            name="Test"
            description="Test"
            sku="TEST"
            brand="Test"
            category="Test"
            images={['test.jpg']}
            price={10}
            inStock={true}
          />
          <WebsiteSchema />
        </>
      );

      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(4);

      scripts.forEach(script => {
        expect(() => JSON.parse(script.innerHTML)).not.toThrow();
      });
    });

    it('should properly escape JSON content', () => {
      const propsWithSpecialChars = {
        name: 'Product with "quotes" & <tags>',
        description: 'Description with \n newlines and \t tabs',
        sku: 'SKU-001',
        brand: 'Brand & Co.',
        category: 'Category',
        images: ['image.jpg'],
        price: 10,
        inStock: true,
      };

      const { container } = render(<ProductSchema {...propsWithSpecialChars} />);
      const data = getJsonLdData(container);

      expect(data.name).toBe('Product with "quotes" & <tags>');
      expect(data.description).toBe('Description with \n newlines and \t tabs');
      expect(data.brand.name).toBe('Brand & Co.');
    });
  });
});