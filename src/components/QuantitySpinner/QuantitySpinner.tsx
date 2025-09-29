'use client';

import React from 'react';
import { useProductActions } from '@/contexts/ProductActionsContext';

export function QuantitySpinner() {
  const { quantity, setQuantity, incrementQuantity, decrementQuantity } = useProductActions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md">
      <button
        onClick={decrementQuantity}
        disabled={quantity <= 1}
        className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        -
      </button>
      <input
        id="quantity"
        type="number"
        value={quantity}
        onChange={handleInputChange}
        className="w-16 px-2 py-2 text-center border-0 focus:ring-0 disabled:opacity-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        min="1"
      />
      <button
        onClick={incrementQuantity}
        className="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
      >
        +
      </button>
    </div>
  );
}