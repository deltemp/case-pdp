export interface Product {
  sku: string
  name: string
  lastModified: Date
  isActive: boolean
}

export async function getProductsForSitemap(): Promise<Product[]> {
  try {
    // Check if we should use API endpoint
    if (process.env.API_BASE_URL) {
      const response = await fetch(`${process.env.API_BASE_URL}/products/sitemap`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      return data.products || []
    }
    
    // For now, returning mock data
    const mockProducts: Product[] = [
      {
        sku: 'product-1',
        name: 'Premium Wireless Headphones',
        lastModified: new Date('2024-01-15'),
        isActive: true,
      },
      {
        sku: 'product-2',
        name: 'Smart Fitness Tracker',
        lastModified: new Date('2024-01-20'),
        isActive: true,
      },
      {
        sku: 'product-3',
        name: 'Bluetooth Speaker',
        lastModified: new Date('2024-01-25'),
        isActive: true,
      },
      {
        sku: 'product-4',
        name: 'Wireless Charging Pad',
        lastModified: new Date('2024-01-30'),
        isActive: true,
      },
      {
        sku: 'product-5',
        name: 'USB-C Hub',
        lastModified: new Date('2024-02-01'),
        isActive: true,
      },
    ]
    
    // Filter only active products
    return mockProducts
      .filter((product: Product) => product.isActive)
      .map((product: Product) => ({
        sku: product.sku,
        name: product.name,
        lastModified: new Date(product.lastModified),
        isActive: product.isActive,
      }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

export interface SitemapCacheOptions {
  revalidate?: number
  tags?: string[]
}

// Cache configuration for sitemap data
export const SITEMAP_CACHE_CONFIG: SitemapCacheOptions = {
  revalidate: 3600, // Cache for 1 hour
  tags: ['products', 'sitemap'],
}