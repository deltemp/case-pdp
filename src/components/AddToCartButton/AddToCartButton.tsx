'use client';

import React from 'react';
import { useProductActions } from '@/contexts/ProductActionsContext';

export function AddToCartButton() {
  const { cartStatus, handleAddToCart, quantity, product } = useProductActions();

  const getButtonContent = () => {
    switch (cartStatus) {
      case 'loading':
        return (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-testid="loading-spinner">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adicionando...
          </>
        );
      case 'success':
        return (
          <>
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Adicionado ao carrinho!
          </>
        );
      case 'error':
        return (
          <>
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Erro. Tente novamente
          </>
        );
      default:
        return (
          <>
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 9M7 13l-1.8-9m0 0h15M9 19v.01M20 19v.01" />
            </svg>
            Adicionar ao Carrinho
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200";
    
    switch (cartStatus) {
      case 'loading':
        return `${baseStyles} bg-blue-400 text-white cursor-not-allowed`;
      case 'success':
        return `${baseStyles} bg-green-600 text-white cursor-default`;
      case 'error':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800 cursor-pointer`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={cartStatus === 'loading' || cartStatus === 'success'}
      className={getButtonStyles()}
      aria-label={`Adicionar ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} de ${product?.name} ao carrinho`}
    >
      {getButtonContent()}
    </button>
  );
}