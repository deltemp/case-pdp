import { Product } from '@/types/product';
import { formatPrice, formatDate } from '@/utils/format';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Brand */}
      <div>
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
          {product.brand}
        </span>
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* SKU */}
      <div className="text-sm text-gray-500">
        <span className="font-medium">SKU:</span> {product.sku}
      </div>

      {/* Price */}
      <div className="border-l-4 border-green-500 pl-4">
        <div className="text-3xl font-bold text-green-600">
          {formatPrice(product.price)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          À vista no PIX ou em até 12x sem juros
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Descrição do Produto
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* Product Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Informações do Produto</h3>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Marca:</dt>
            <dd className="font-medium text-gray-900">{product.brand}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Código:</dt>
            <dd className="font-medium text-gray-900">{product.sku}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Disponível desde:</dt>
            <dd className="font-medium text-gray-900">
              {formatDate(product.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Vantagens</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Entrega rápida e segura
          </li>
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Garantia de qualidade
          </li>
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Parcelamento sem juros
          </li>
        </ul>
      </div>
    </div>
  );
}