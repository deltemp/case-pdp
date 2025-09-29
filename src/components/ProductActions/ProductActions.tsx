'use client';

import React from 'react';
import { Product } from '@/types/product';
import { ProductActionsProvider } from '@/contexts/ProductActionsContext';
import { AddToCartButton } from '../AddToCartButton/AddToCartButton';
import { QuantitySpinner } from '../QuantitySpinner/QuantitySpinner';
import { SocialActions } from '../SocialActions/SocialActions';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  return (
    <ProductActionsProvider product={product}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantidade:</label>
          <QuantitySpinner />
        </div>

        <AddToCartButton />

        <SocialActions />
      </div>
    </ProductActionsProvider>
  );
}