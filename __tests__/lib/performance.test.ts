import { PerformanceMonitor, usePerformanceMonitor, withPerformanceMonitoring, analyzeBundleSize, initPerformanceMonitoring } from '../../src/lib/performance';
import { renderHook, render } from '@testing-library/react';
import * as React from 'react';
import type { Metric } from 'web-vitals';

// Import global type definitions
import '../types/global.d.ts';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}));

// Mock fetch globally with proper typing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
(global as any).fetch = mockFetch;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

// Type definitions for mocked objects
interface MockedWindow {
  gtag?: jest.MockedFunction<(...args: any[]) => void>;
  PerformanceObserver?: jest.MockedFunction<any>;
  performance?: {
    getEntriesByType: jest.MockedFunction<(type: string) => any[]>;
    mark: jest.MockedFunction<(name: string) => void>;
    measure: jest.MockedFunction<(name: string, startMark?: string, endMark?: string) => void>;
  };
}

interface MockedDocument {
  querySelectorAll: jest.MockedFunction<(selector: string) => Array<{
    getAttribute: jest.MockedFunction<(name: string) => string | null>;
  }>>;
}

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;
  let originalWindow: any;
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalWindow = (global as any).window;
    
    // Mock fetch globally
    (global as any).fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Store original NODE_ENV before each test
    originalNodeEnv = process.env.NODE_ENV;
    
    // Reset the singleton instance
    (PerformanceMonitor as any).instance = undefined;
    
    // Mock fetch to return a resolved promise
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    
    // Mock window object with proper typing
    const mockWindow: MockedWindow = {
      gtag: jest.fn(),
      PerformanceObserver: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      })),
      performance: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
      },
    };
    
    (global as any).window = mockWindow;
    
    performanceMonitor = PerformanceMonitor.getInstance();
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
    
    // Restore original NODE_ENV after each test
    if (originalNodeEnv !== undefined) {
      (process.env as any).NODE_ENV = originalNodeEnv;
    } else {
      delete (process.env as any).NODE_ENV;
    }
  });

  afterAll(() => {
    (global as any).window = originalWindow;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('init', () => {
    it('should initialize performance monitoring in browser environment', () => {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = require('web-vitals');
      
      performanceMonitor.init();

      expect(onCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(onINP).toHaveBeenCalledWith(expect.any(Function));
      expect(onFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(onLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(onTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not initialize in server environment', () => {
      // Remove window object to simulate server environment
      delete (global as any).window;
      
      // Create a fresh instance for server environment test
      (PerformanceMonitor as any).instance = undefined;
      const serverMonitor = PerformanceMonitor.getInstance();
      serverMonitor.init();

      // Should not throw and should handle gracefully
      expect(() => serverMonitor.init()).not.toThrow();
    });
  });

  describe('handleMetric', () => {
    it('should send metrics to analytics in production environment', () => {
      (process.env as any).NODE_ENV = 'production';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      const metric: Metric = {
        name: 'CLS',
        value: 0.1,
        id: 'test-id',
        delta: 0.1,
        entries: [],
        rating: 'good',
        navigationType: 'navigate',
      };

      // Make handleMetric public for testing
      (performanceMonitor as any).handleMetric(metric);

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"name":"CLS"'),
      });
    });

    it('should send metrics to gtag in production', () => {
      (process.env as any).NODE_ENV = 'production';
      
      const metric: Metric = { 
        name: 'CLS', 
        value: 0.1, 
        id: 'test-id', 
        delta: 0.1, 
        entries: [],
        rating: 'good',
        navigationType: 'navigate',
      };
      
      // Ensure gtag is available and mocked
      const gtagMock = jest.fn();
      
      // Mock window with gtag property
      const windowWithGtag = (global as any).window as MockedWindow;
      windowWithGtag.gtag = gtagMock;
      
      // Make handleMetric public for testing
      (performanceMonitor as any).handleMetric(metric);

      expect(gtagMock).toHaveBeenCalledWith('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    });

    it('should handle metrics when no analytics is available', () => {
      const windowWithoutGtag = (global as any).window as MockedWindow;
      delete windowWithoutGtag.gtag;

      const metric: Metric = {
        name: 'FCP',
        value: 1500,
        id: 'test-id',
        delta: 1500,
        entries: [],
        rating: 'good',
        navigationType: 'navigate',
      };

      // Make handleMetric public for testing
      expect(() => (performanceMonitor as any).handleMetric(metric)).not.toThrow();

      // Restore gtag
      windowWithoutGtag.gtag = jest.fn();
    });
  });

  describe('getMetrics and getMetric', () => {
    it('should store and retrieve metrics', () => {
      const metric: Metric = {
        name: 'LCP',
        value: 2000,
        id: 'test-id',
        delta: 2000,
        entries: [],
        rating: 'good',
        navigationType: 'navigate',
      };

      // Make handleMetric public for testing
      (performanceMonitor as any).handleMetric(metric);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.size).toBe(1);
      expect(metrics.get('LCP')).toEqual(metric);

      const specificMetric = performanceMonitor.getMetric('LCP');
      expect(specificMetric).toEqual(metric);
    });
  });

  describe('checkPerformanceBudget', () => {
    it('should pass when all metrics are within budget', () => {
      // Add metrics that are within budget
      const metrics: Metric[] = [
        { name: 'LCP', value: 2000, id: 'test-lcp', delta: 2000, entries: [], rating: 'good', navigationType: 'navigate' },
        { name: 'INP', value: 80, id: 'test-inp', delta: 80, entries: [], rating: 'good', navigationType: 'navigate' },
        { name: 'CLS', value: 0.05, id: 'test-cls', delta: 0.05, entries: [], rating: 'good', navigationType: 'navigate' },
      ];

      // Make handleMetric public for testing
      metrics.forEach(metric => (performanceMonitor as any).handleMetric(metric));

      const result = performanceMonitor.checkPerformanceBudget();

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when metrics exceed budget', () => {
      // First add some metrics to the monitor
      const metrics: Metric[] = [
        { name: 'LCP', value: 3000, id: 'test-lcp', delta: 3000, entries: [], rating: 'poor', navigationType: 'navigate' },
        { name: 'INP', value: 120, id: 'test-inp', delta: 120, entries: [], rating: 'poor', navigationType: 'navigate' },
        { name: 'CLS', value: 0.15, id: 'test-cls', delta: 0.15, entries: [], rating: 'poor', navigationType: 'navigate' },
      ];

      // Make handleMetric public for testing
      metrics.forEach(metric => (performanceMonitor as any).handleMetric(metric));

      const result = performanceMonitor.checkPerformanceBudget();

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    // Mock window object for hook tests
    const mockWindow: MockedWindow = {
      gtag: jest.fn(),
      PerformanceObserver: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      })),
      performance: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
      },
    };
    
    (global as any).window = mockWindow;
  });

  it('should return performance monitor methods', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    expect(result.current).toHaveProperty('getMetrics');
    expect(result.current).toHaveProperty('getMetric');
    expect(result.current).toHaveProperty('checkBudget');
    expect(typeof result.current.getMetrics).toBe('function');
    expect(typeof result.current.getMetric).toBe('function');
    expect(typeof result.current.checkBudget).toBe('function');
  });

  it('should return consistent methods across renders', () => {
      const { result, rerender } = renderHook(() => usePerformanceMonitor());
      
      const firstResult = result.current;
      
      rerender();
      
      // Check that the methods are still functions and have the same names
      expect(typeof result.current.getMetrics).toBe('function');
      expect(typeof result.current.getMetric).toBe('function');
      expect(typeof result.current.checkBudget).toBe('function');
      expect(result.current.getMetrics.name).toBe(firstResult.getMetrics.name);
      expect(result.current.getMetric.name).toBe(firstResult.getMetric.name);
      expect(result.current.checkBudget.name).toBe(firstResult.checkBudget.name);
    });
});

describe('withPerformanceMonitoring', () => {
  const TestComponent = ({ name }: { name: string }) => React.createElement('div', null, `Hello ${name}`);

  beforeEach(() => {
    // Mock window object for HOC tests
    const mockWindow: MockedWindow = {
      gtag: jest.fn(),
      PerformanceObserver: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      })),
      performance: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
      },
    };
    
    (global as any).window = mockWindow;
  });

  it('should wrap component with performance monitoring', () => {
    const WrappedComponent = withPerformanceMonitoring(TestComponent, 'TestComponent');

    const { container } = render(React.createElement(WrappedComponent as any, { name: "World" }));

    expect(container.textContent).toBe('Hello World');
    // Note: Performance timing happens in useEffect cleanup, which is async
  });

  it('should handle missing performance API gracefully', () => {
    // Remove performance from window
    (global as any).window = {};
    
    // Create a new instance without performance API
    const monitorWithoutPerf = PerformanceMonitor.getInstance();
    monitorWithoutPerf.init();

    // Should not throw errors and should handle gracefully
    expect(() => monitorWithoutPerf.init()).not.toThrow();
  });
});

describe('analyzeBundleSize', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should analyze bundle size and log results', () => {
    const mockScripts = [
      { getAttribute: jest.fn().mockReturnValue('/_next/static/chunks/pages/index.js') },
      { getAttribute: jest.fn().mockReturnValue('/_next/static/chunks/main-abc123.js') },
      { getAttribute: jest.fn().mockReturnValue('/_next/static/chunks/framework-def456.js') },
      { getAttribute: jest.fn().mockReturnValue('/_next/static/chunks/webpack-789.js') },
    ];

    (global as any).window = {};
    const mockDocument: MockedDocument = {
      querySelectorAll: jest.fn().mockReturnValue(mockScripts),
    };
    (global as any).document = mockDocument;

    analyzeBundleSize();

    // The function estimates: 50KB + 200KB + 150KB + 10KB = 410KB
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Performance] Estimated bundle size:'));
  });

  it('should handle scripts without Next.js static paths', () => {
    const mockScripts = [
      { getAttribute: jest.fn().mockReturnValue('/some-other-script.js') },
      { getAttribute: jest.fn().mockReturnValue('https://external.com/script.js') },
    ];

    (global as any).window = {};
    const mockDocument: MockedDocument = {
      querySelectorAll: jest.fn().mockReturnValue(mockScripts),
    };
    (global as any).document = mockDocument;

    analyzeBundleSize();

    expect(consoleLogSpy).toHaveBeenCalledWith('[Performance] Estimated bundle size: 0KB');
  });

  it('should handle missing window (server environment)', () => {
    const originalWindow = (global as any).window;
    delete (global as any).window;

    const result = analyzeBundleSize();

    expect(result).toBeUndefined();
    
    // Restore window for other tests
    (global as any).window = originalWindow;
  });
});

describe('initPerformanceMonitoring', () => {
  beforeEach(() => {
    // Mock window object for init tests
    const mockWindow: MockedWindow = {
      gtag: jest.fn(),
      PerformanceObserver: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      })),
      performance: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
      },
    };
    
    (global as any).window = mockWindow;
  });

  it('should initialize performance monitoring', () => {
    const spy = jest.spyOn(PerformanceMonitor.prototype, 'init');
    
    initPerformanceMonitoring();
    
    expect(spy).toHaveBeenCalled();
    
    spy.mockRestore();
  });
});