import React from 'react';
import { render, screen } from '@testing-library/react';
import { PerformanceProvider } from '@/components/PerformanceProvider';

// Mock the performance module
jest.mock('@/lib/performance', () => ({
  initPerformanceMonitoring: jest.fn(),
}));

// Test component to verify children are rendered
function TestComponent() {
  return <div data-testid="test-child">Test Child Component</div>;
}

describe('PerformanceProvider', () => {
  let mockInitPerformanceMonitoring: jest.Mock;
  let originalNodeEnv: string | undefined;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Get the mocked function
    const { initPerformanceMonitoring } = require('@/lib/performance');
    mockInitPerformanceMonitoring = initPerformanceMonitoring as jest.Mock;
    
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    
    // Spy on console.warn to suppress warnings during tests
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    jest.clearAllMocks();
    // Reset NODE_ENV to development for most tests
    (process.env as any).NODE_ENV = 'development';
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv !== undefined) {
      (process.env as any).NODE_ENV = originalNodeEnv;
    } else {
      delete (process.env as any).NODE_ENV;
    }
    
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  describe('Component rendering', () => {
    it('should render children correctly', () => {
      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child Component')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <PerformanceProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span data-testid="child-3">Child 3</span>
        </PerformanceProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      const { container } = render(<PerformanceProvider>{null}</PerformanceProvider>);
      
      // Should render without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance monitoring initialization', () => {
    it('should initialize performance monitoring in development environment', () => {
      (process.env as any).NODE_ENV = 'development';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).toHaveBeenCalledTimes(1);
    });

    it('should not initialize performance monitoring in production environment', () => {
      (process.env as any).NODE_ENV = 'production';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });

    it('should not initialize performance monitoring in test environment', () => {
      (process.env as any).NODE_ENV = 'test';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });

    it('should not initialize performance monitoring when NODE_ENV is undefined', () => {
      delete (process.env as any).NODE_ENV;

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });

    it('should initialize performance monitoring only once per component instance', () => {
      (process.env as any).NODE_ENV = 'development';

      const { rerender } = render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      // Re-render the same component
      rerender(
        <PerformanceProvider>
          <div>Different child</div>
        </PerformanceProvider>
      );

      // Should still only be called once
      expect(mockInitPerformanceMonitoring).toHaveBeenCalledTimes(1);
    });

    it('should initialize performance monitoring for each new provider instance', () => {
      (process.env as any).NODE_ENV = 'development';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      render(
        <PerformanceProvider>
          <div>Another provider instance</div>
        </PerformanceProvider>
      );

      // Should be called once for each provider instance
      expect(mockInitPerformanceMonitoring).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment variable edge cases', () => {
    it('should handle empty NODE_ENV', () => {
      (process.env as any).NODE_ENV = '';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive NODE_ENV values', () => {
      (process.env as any).NODE_ENV = 'Development'; // Capital D

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });

    it('should handle NODE_ENV with whitespace', () => {
      (process.env as any).NODE_ENV = ' development ';

      render(
        <PerformanceProvider>
          <TestComponent />
        </PerformanceProvider>
      );

      expect(mockInitPerformanceMonitoring).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should not crash if performance monitoring initialization throws an error', () => {
      (process.env as any).NODE_ENV = 'development';
      mockInitPerformanceMonitoring.mockImplementation(() => {
        throw new Error('Performance monitoring failed');
      });

      expect(() => {
        render(
          <PerformanceProvider>
            <TestComponent />
          </PerformanceProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      
      // Verify that console.warn was called with the expected error message
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance monitoring initialization failed:',
        expect.any(Error)
      );
    });
  });
});