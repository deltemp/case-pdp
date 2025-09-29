'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

type CartStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProductActionsContextType {
  // State
  quantity: number;
  cartStatus: CartStatus;
  product: Product | null;
  
  // Actions
  setQuantity: (quantity: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  setCartStatus: (status: CartStatus) => void;
  handleAddToCart: () => Promise<void>;
}

const ProductActionsContext = createContext<ProductActionsContextType | undefined>(undefined);

interface ProductActionsProviderProps {
  children: ReactNode;
  product: Product;
}

export function ProductActionsProvider({ children, product }: ProductActionsProviderProps) {
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<CartStatus>('idle');

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(10, prev + 1));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    setCartStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random success/error for demo
      if (Math.random() > 0.2) {
        setCartStatus('success');
        setTimeout(() => setCartStatus('idle'), 2000);
      } else {
        setCartStatus('error');
        setTimeout(() => setCartStatus('idle'), 3000);
      }
    } catch {
      setCartStatus('error');
      setTimeout(() => setCartStatus('idle'), 3000);
    }
  };

  const value: ProductActionsContextType = {
    quantity,
    cartStatus,
    product,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    setCartStatus,
    handleAddToCart,
  };

  return (
    <ProductActionsContext.Provider value={value}>
      {children}
    </ProductActionsContext.Provider>
  );
}

export function useProductActions() {
  const context = useContext(ProductActionsContext);
  if (context === undefined) {
    throw new Error('useProductActions must be used within a ProductActionsProvider');
  }
  return context;
}

export { ProductActionsContext };
export type { CartStatus, ProductActionsContextType };