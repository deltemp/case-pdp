import { MetadataRoute } from 'next'
import { getCachedProducts, getCachedStaticPages } from '@/lib/sitemap-cache'

// Enable ISR for sitemap
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  
  try {
    const staticPages = await getCachedStaticPages()
    
    const products = await getCachedProducts()
    
    // Generate product pages for sitemap
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.sku}`,
      lastModified: product.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    // Combine all pages
    return [...staticPages, ...productPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to basic sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}