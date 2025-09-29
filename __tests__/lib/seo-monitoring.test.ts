import {
  checkSitemapHealth,
  checkRobotsHealth,
  generateSEOHealthReport,
  logSEOHealthReport,
  runSEOMonitoring,
  SitemapHealthCheck,
  RobotsHealthCheck,
  SEOHealthReport
} from '@/lib/seo-monitoring';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('SEO Monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  describe('checkSitemapHealth', () => {
    it('should return healthy status for valid sitemap with many URLs', async () => {
      const mockSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://example.com/</loc></url>
          <url><loc>https://example.com/product/1</loc></url>
          <url><loc>https://example.com/product/2</loc></url>
          <url><loc>https://example.com/product/3</loc></url>
          <url><loc>https://example.com/product/4</loc></url>
          <url><loc>https://example.com/product/5</loc></url>
        </urlset>`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockSitemapXML),
      });

      const result = await checkSitemapHealth();

      expect(result).toEqual({
        status: 'healthy',
        urlCount: 6,
        lastChecked: expect.any(Date),
        errors: [],
        warnings: [],
      });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/sitemap.xml');
    });

    it('should return warning status for sitemap with few URLs', async () => {
      const mockSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://example.com/</loc></url>
          <url><loc>https://example.com/about</loc></url>
        </urlset>`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockSitemapXML),
      });

      const result = await checkSitemapHealth();

      expect(result.status).toBe('warning');
      expect(result.urlCount).toBe(2);
      expect(result.warnings).toContain('Sitemap has unusually few URLs: 2');
    });

    it('should return error status for HTTP error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not Found'),
      });

      const result = await checkSitemapHealth();

      expect(result).toEqual({
        status: 'error',
        urlCount: 0,
        lastChecked: expect.any(Date),
        errors: ['Sitemap HTTP error: 404 Not Found'],
        warnings: [],
      });
    });

    it('should return error status for missing XML declaration', async () => {
      const invalidXML = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://example.com/</loc></url>
      </urlset>`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(invalidXML),
      });

      const result = await checkSitemapHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('Sitemap missing XML declaration');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkSitemapHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('Sitemap health check failed: Network error');
    });
  });

  describe('checkRobotsHealth', () => {
    it('should return healthy status for valid robots.txt', async () => {
      const mockRobotsContent = `User-agent: *
Disallow: /admin
Disallow: /private

Sitemap: https://example.com/sitemap.xml`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockRobotsContent),
      });

      const result = await checkRobotsHealth();

      expect(result).toEqual({
        status: 'healthy',
        lastChecked: expect.any(Date),
        errors: [],
        warnings: [],
        hasUserAgent: true,
        hasSitemap: true,
        hasDisallow: true,
      });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/robots.txt');
    });

    it('should return error status for HTTP error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not Found'),
      });

      const result = await checkRobotsHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('Robots.txt HTTP error: 404 Not Found');
    });

    it('should return warning for missing sitemap reference', async () => {
      const robotsWithoutSitemap = `User-agent: *
Disallow: /admin`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(robotsWithoutSitemap),
      });

      const result = await checkRobotsHealth();

      expect(result.status).toBe('warning');
      expect(result.warnings).toContain('Robots.txt missing Sitemap directive');
      expect(result.hasSitemap).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkRobotsHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('Robots.txt health check failed: Network error');
    });
  });

  describe('generateSEOHealthReport', () => {
    it('should generate comprehensive health report', async () => {
      // Mock successful sitemap check
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              <url><loc>https://example.com/</loc></url>
              <url><loc>https://example.com/product/1</loc></url>
              <url><loc>https://example.com/product/2</loc></url>
              <url><loc>https://example.com/product/3</loc></url>
              <url><loc>https://example.com/product/4</loc></url>
              <url><loc>https://example.com/product/5</loc></url>
            </urlset>`),
        })
        // Mock successful robots check
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`User-agent: *
Disallow: /admin
Sitemap: https://example.com/sitemap.xml`),
        });

      const report = await generateSEOHealthReport();

      expect(report.overall).toBe('healthy');
      expect(report.sitemap.status).toBe('healthy');
      expect(report.robots.status).toBe('healthy');
    });

    it('should identify issues and set warning status', async () => {
      // Mock sitemap with few URLs
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              <url><loc>https://example.com/</loc></url>
            </urlset>`),
        })
        // Mock robots without sitemap reference
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(`User-agent: *
Disallow: /admin`),
        });

      const report = await generateSEOHealthReport();

      expect(report.overall).toBe('warning');
      expect(report.sitemap.warnings).toContain('Sitemap has unusually few URLs: 1');
      expect(report.robots.warnings).toContain('Robots.txt missing Sitemap directive');
    });

    it('should set error status for major issues', async () => {
      // Mock both sitemap and robots failing
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('Not Found'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('Not Found'),
        });

      const report = await generateSEOHealthReport();

      expect(report.overall).toBe('error');
      expect(report.sitemap.status).toBe('error');
      expect(report.robots.status).toBe('error');
    });
  });

  describe('logSEOHealthReport', () => {
     it('should log healthy report', () => {
       const healthyReport: SEOHealthReport = {
         sitemap: {
           status: 'healthy',
           urlCount: 5,
           lastChecked: new Date(),
           errors: [],
           warnings: [],
         },
         robots: {
           status: 'healthy',
           lastChecked: new Date(),
           errors: [],
           warnings: [],
           hasUserAgent: true,
           hasSitemap: true,
           hasDisallow: true,
         },
         overall: 'healthy',
         lastChecked: new Date(),
       };

       logSEOHealthReport(healthyReport);

       expect(mockConsoleLog).toHaveBeenCalledWith('=== SEO Health Report ===');
       expect(mockConsoleLog).toHaveBeenCalledWith('Overall Status: HEALTHY');
     });

     it('should log warning report with issues', () => {
       const warningReport: SEOHealthReport = {
         sitemap: {
           status: 'warning',
           urlCount: 2,
           lastChecked: new Date(),
           errors: [],
           warnings: ['Sitemap has unusually few URLs: 2'],
         },
         robots: {
           status: 'warning',
           lastChecked: new Date(),
           errors: [],
           warnings: ['Robots.txt missing Sitemap directive'],
           hasUserAgent: true,
           hasSitemap: false,
           hasDisallow: true,
         },
         overall: 'warning',
         lastChecked: new Date(),
       };

       logSEOHealthReport(warningReport);

       expect(mockConsoleLog).toHaveBeenCalledWith('=== SEO Health Report ===');
       expect(mockConsoleLog).toHaveBeenCalledWith('Overall Status: WARNING');
     });

     it('should log error report', () => {
       const errorReport: SEOHealthReport = {
         sitemap: {
           status: 'error',
           urlCount: 0,
           lastChecked: new Date(),
           errors: ['Sitemap HTTP error: 404 Not Found'],
           warnings: [],
         },
         robots: {
           status: 'error',
           lastChecked: new Date(),
           errors: ['Robots.txt HTTP error: 404 Not Found'],
           warnings: [],
           hasUserAgent: false,
           hasSitemap: false,
           hasDisallow: false,
         },
         overall: 'error',
         lastChecked: new Date(),
       };

       logSEOHealthReport(errorReport);

       expect(mockConsoleLog).toHaveBeenCalledWith('=== SEO Health Report ===');
       expect(mockConsoleLog).toHaveBeenCalledWith('Overall Status: ERROR');
     });
   });

  describe('runSEOMonitoring', () => {
     it('should run complete SEO monitoring cycle', async () => {
       // Mock successful checks
       (global.fetch as jest.Mock)
         .mockResolvedValueOnce({
           ok: true,
           status: 200,
           text: () => Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
             <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
               <url><loc>https://example.com/</loc></url>
               <url><loc>https://example.com/product/1</loc></url>
               <url><loc>https://example.com/product/2</loc></url>
               <url><loc>https://example.com/product/3</loc></url>
               <url><loc>https://example.com/product/4</loc></url>
               <url><loc>https://example.com/product/5</loc></url>
             </urlset>`),
         })
         .mockResolvedValueOnce({
           ok: true,
           status: 200,
           text: () => Promise.resolve(`User-agent: *
Disallow: /admin
Sitemap: https://example.com/sitemap.xml`),
         });

       await runSEOMonitoring();

       expect(mockConsoleLog).toHaveBeenCalledWith('✅ SEO Health Check: All systems healthy');
       expect(global.fetch).toHaveBeenCalledTimes(2);
     });

     it('should handle errors during monitoring', async () => {
       // Mock network errors
       (global.fetch as jest.Mock)
         .mockRejectedValueOnce(new Error('Network error'))
         .mockRejectedValueOnce(new Error('Network error'));

       await runSEOMonitoring();

       expect(mockConsoleError).toHaveBeenCalledWith('🚨 SEO Health Check: Critical errors detected!');
     });
   });
});