'use client';

import React from 'react';
import Image from 'next/image';
import { useProductActions } from '@/contexts/ProductActionsContext';

export function SocialActions() {
  const { product } = useProductActions();

  const handleFavorite = () => {
    // TODO: Implement favorite functionality
    console.log('Favoritar produto:', { name: product?.name, sku: product?.sku });
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Compartilhar produto:', { name: product?.name, sku: product?.sku });
  };

  return (
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={handleFavorite}
        className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer flex items-center justify-center space-x-2"
      >
        <Image src="/icons/favorite.svg" alt="Favoritar" width={16} height={16} />
        <span>Favoritar</span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer flex items-center justify-center space-x-2"
      >
        <Image src="/icons/share.svg" alt="Compartilhar" width={16} height={16} />
        <span>Compartilhar</span>
      </button>
    </div>
  );
}