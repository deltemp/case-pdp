import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as React from 'react';

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, Metric> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance monitoring
  public init(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Custom performance observers
    this.observeResourceTiming();
    this.observeNavigationTiming();
  }

  private handleMetric(metric: Metric): void {
    this.metrics.set(metric.name, metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: Metric): void {
    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(error => {
      console.warn('Failed to send performance metric:', error);
    });
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Monitor large resources
            if (resourceEntry.transferSize > 100000) { // > 100KB
              console.warn(`Large resource detected: ${resourceEntry.name} (${Math.round(resourceEntry.transferSize / 1024)}KB)`);
            }

            // Monitor slow resources
            if (resourceEntry.duration > 1000) { // > 1s
              console.warn(`Slow resource detected: ${resourceEntry.name} (${Math.round(resourceEntry.duration)}ms)`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private observeNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            // Calculate custom metrics
            const metrics = {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              domComplete: navEntry.domComplete - navEntry.fetchStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            };

            if (process.env.NODE_ENV === 'development') {
              console.log('[Performance] Navigation Timing:', metrics);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  // Get current metrics
  public getMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  // Get specific metric
  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  // Performance budget checker
  public checkPerformanceBudget(): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const budget = {
      LCP: 2500, // 2.5s
      INP: 200,  // 200ms (replaced FID)
      CLS: 0.1,  // 0.1
      FCP: 1800, // 1.8s
      TTFB: 800, // 800ms
    };

    Object.entries(budget).forEach(([metricName, threshold]) => {
      const metric = this.metrics.get(metricName);
      if (metric && metric.value > threshold) {
        violations.push(`${metricName}: ${metric.value} > ${threshold}`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.init();
  }, [monitor]);

  return {
    getMetrics: () => monitor.getMetrics(),
    getMetric: (name: string) => monitor.getMetric(name),
    checkBudget: () => monitor.checkPerformanceBudget(),
  };
}

// Performance decorator for components
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
      };
    });

    return React.createElement(WrappedComponent, props);
  };
}

// Bundle size analyzer utility
export function analyzeBundleSize(): void {
  if (typeof window === 'undefined') return;

  // Analyze loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const totalSize = scripts.reduce((total, script) => {
    const src = script.getAttribute('src');
    if (src && src.includes('/_next/static/')) {
      // Estimate size based on script name patterns
      if (src.includes('chunks/pages/')) return total + 50000; // ~50KB per page
      if (src.includes('chunks/main-')) return total + 200000; // ~200KB main bundle
      if (src.includes('chunks/framework-')) return total + 150000; // ~150KB framework
      if (src.includes('chunks/webpack-')) return total + 10000; // ~10KB webpack runtime
    }
    return total;
  }, 0);

  console.log(`[Performance] Estimated bundle size: ${Math.round(totalSize / 1024)}KB`);
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance();
    monitor.init();
    
    // Analyze bundle size after load
    window.addEventListener('load', () => {
      setTimeout(analyzeBundleSize, 1000);
    });
  }
}