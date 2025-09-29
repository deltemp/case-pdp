'use client';

import React, { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        initPerformanceMonitoring();
      } catch (error) {
        // Silently handle performance monitoring initialization errors
        // This prevents the component from crashing if performance monitoring fails
        console.warn('Performance monitoring initialization failed:', error);
      }
    }
  }, []);

  return <>{children}</>;
}