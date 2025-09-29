declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    PerformanceObserver?: {
      new (callback: (list: any) => void): {
        observe: (options: any) => void;
        disconnect: () => void;
      };
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
    }
  }
}

export {};