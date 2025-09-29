interface OrganizationSchemaProps {
  name?: string
  url?: string
  logo?: string
  contactPhone?: string
  socialLinks?: string[]
}

export function OrganizationSchema({
  name = 'Your E-commerce Store',
  url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  logo = '/logo.png',
  contactPhone = '+1-555-123-4567',
  socialLinks = [
    'https://www.facebook.com/yourstore',
    'https://www.twitter.com/yourstore',
    'https://www.instagram.com/yourstore',
  ]
}: OrganizationSchemaProps = {}) {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: `${url}${logo}`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactPhone,
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
    sameAs: socialLinks,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  )
}

interface ProductSchemaProps {
  name: string
  description: string
  sku: string
  brand: string
  category: string
  images: string[]
  price: number
  currency?: string
  inStock: boolean
  seller?: string
}

export function ProductSchema({
  name,
  description,
  sku,
  brand,
  category,
  images,
  price,
  currency = 'USD',
  inStock,
  seller = 'Your E-commerce Store'
}: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    category,
    image: images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: seller,
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
    />
  )
}

interface WebsiteSchemaProps {
  name?: string
  url?: string
  description?: string
  potentialAction?: {
    target: string
    queryInput: string
  }
}

export function WebsiteSchema({
  name = 'Your E-commerce Store',
  url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  description = 'Discover quality products at competitive prices.',
  potentialAction
}: WebsiteSchemaProps = {}) {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    ...(potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: potentialAction.target,
        'query-input': potentialAction.queryInput,
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  )
}