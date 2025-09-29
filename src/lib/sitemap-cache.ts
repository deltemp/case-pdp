import { unstable_cache } from 'next/cache'
import { getProductsForSitemap, SITEMAP_CACHE_CONFIG } from './sitemap-data'

export const getCachedProducts = unstable_cache(
  async () => {
    return await getProductsForSitemap()
  },
  ['sitemap-products'],
  {
    revalidate: SITEMAP_CACHE_CONFIG.revalidate,
    tags: SITEMAP_CACHE_CONFIG.tags,
  }
)

// Cache for static pages data
export const getCachedStaticPages = unstable_cache(
  async () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]
  },
  ['sitemap-static-pages'],
  {
    revalidate: 86400, // Cache for 24 hours
    tags: ['static-pages', 'sitemap'],
  }
)