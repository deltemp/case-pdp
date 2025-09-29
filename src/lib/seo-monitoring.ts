export interface SitemapHealthCheck {
  status: 'healthy' | 'warning' | 'error'
  urlCount: number
  lastChecked: Date
  errors: string[]
  warnings: string[]
}

export async function checkSitemapHealth(): Promise<SitemapHealthCheck> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`)
    
    if (!response.ok) {
      errors.push(`Sitemap HTTP error: ${response.status} ${response.statusText}`)
      return {
        status: 'error',
        urlCount: 0,
        lastChecked: new Date(),
        errors,
        warnings,
      }
    }
    
    const text = await response.text()
    const urlCount = (text.match(/<url>/g) || []).length
    
    // Check for minimum URL count
    if (urlCount < 5) {
      warnings.push(`Sitemap has unusually few URLs: ${urlCount}`)
    }
    
    // Check for XML validity
    if (!text.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push('Sitemap missing XML declaration')
    }
    
    if (!text.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      errors.push('Sitemap missing proper urlset declaration')
    }
    
    // Check for required elements
    if (!text.includes('<loc>')) {
      errors.push('Sitemap missing location elements')
    }
    
    const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy'
    
    return {
      status,
      urlCount,
      lastChecked: new Date(),
      errors,
      warnings,
    }
  } catch (error) {
    errors.push(`Sitemap health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      status: 'error',
      urlCount: 0,
      lastChecked: new Date(),
      errors,
      warnings,
    }
  }
}

export interface RobotsHealthCheck {
  status: 'healthy' | 'warning' | 'error'
  lastChecked: Date
  errors: string[]
  warnings: string[]
  hasUserAgent: boolean
  hasSitemap: boolean
  hasDisallow: boolean
}

export async function checkRobotsHealth(): Promise<RobotsHealthCheck> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const response = await fetch(`${baseUrl}/robots.txt`)
    
    if (!response.ok) {
      errors.push(`Robots.txt HTTP error: ${response.status} ${response.statusText}`)
      return {
        status: 'error',
        lastChecked: new Date(),
        errors,
        warnings,
        hasUserAgent: false,
        hasSitemap: false,
        hasDisallow: false,
      }
    }
    
    const text = await response.text()
    
    const hasUserAgent = text.includes('User-agent:')
    const hasSitemap = text.includes('Sitemap:')
    const hasDisallow = text.includes('Disallow:')
    
    if (!hasUserAgent) {
      errors.push('Robots.txt missing User-agent directive')
    }
    
    if (!hasSitemap) {
      warnings.push('Robots.txt missing Sitemap directive')
    }
    
    if (!hasDisallow) {
      warnings.push('Robots.txt has no Disallow directives - consider adding some for security')
    }
    
    const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy'
    
    return {
      status,
      lastChecked: new Date(),
      errors,
      warnings,
      hasUserAgent,
      hasSitemap,
      hasDisallow,
    }
  } catch (error) {
    errors.push(`Robots.txt health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      status: 'error',
      lastChecked: new Date(),
      errors,
      warnings,
      hasUserAgent: false,
      hasSitemap: false,
      hasDisallow: false,
    }
  }
}

export interface SEOHealthReport {
  sitemap: SitemapHealthCheck
  robots: RobotsHealthCheck
  overall: 'healthy' | 'warning' | 'error'
  lastChecked: Date
}

export async function generateSEOHealthReport(): Promise<SEOHealthReport> {
  const [sitemapHealth, robotsHealth] = await Promise.all([
    checkSitemapHealth(),
    checkRobotsHealth(),
  ])
  
  const hasErrors = sitemapHealth.status === 'error' || robotsHealth.status === 'error'
  const hasWarnings = sitemapHealth.status === 'warning' || robotsHealth.status === 'warning'
  
  const overall = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy'
  
  return {
    sitemap: sitemapHealth,
    robots: robotsHealth,
    overall,
    lastChecked: new Date(),
  }
}

// Utility function to log SEO health report
export function logSEOHealthReport(report: SEOHealthReport): void {
  console.log('=== SEO Health Report ===')
  console.log(`Overall Status: ${report.overall.toUpperCase()}`)
  console.log(`Last Checked: ${report.lastChecked.toISOString()}`)
  
  console.log('\n--- Sitemap Health ---')
  console.log(`Status: ${report.sitemap.status.toUpperCase()}`)
  console.log(`URL Count: ${report.sitemap.urlCount}`)
  
  if (report.sitemap.errors.length > 0) {
    console.log('Errors:')
    report.sitemap.errors.forEach(error => console.log(`  - ${error}`))
  }
  
  if (report.sitemap.warnings.length > 0) {
    console.log('Warnings:')
    report.sitemap.warnings.forEach(warning => console.log(`  - ${warning}`))
  }
  
  console.log('\n--- Robots.txt Health ---')
  console.log(`Status: ${report.robots.status.toUpperCase()}`)
  console.log(`Has User-agent: ${report.robots.hasUserAgent}`)
  console.log(`Has Sitemap: ${report.robots.hasSitemap}`)
  console.log(`Has Disallow: ${report.robots.hasDisallow}`)
  
  if (report.robots.errors.length > 0) {
    console.log('Errors:')
    report.robots.errors.forEach(error => console.log(`  - ${error}`))
  }
  
  if (report.robots.warnings.length > 0) {
    console.log('Warnings:')
    report.robots.warnings.forEach(warning => console.log(`  - ${warning}`))
  }
  
  console.log('========================')
}

// Automated monitoring function that can be called periodically
export async function runSEOMonitoring(): Promise<void> {
  try {
    const report = await generateSEOHealthReport()
    logSEOHealthReport(report)
    
    // In a real application, you might want to:
    // - Send alerts to monitoring services
    // - Store results in a database
    // - Send notifications if status changes
    
    if (report.overall === 'error') {
      console.error('🚨 SEO Health Check: Critical errors detected!')
    } else if (report.overall === 'warning') {
      console.warn('⚠️ SEO Health Check: Warnings detected')
    } else {
      console.log('✅ SEO Health Check: All systems healthy')
    }
  } catch (error) {
    console.error('Failed to run SEO monitoring:', error)
  }
}