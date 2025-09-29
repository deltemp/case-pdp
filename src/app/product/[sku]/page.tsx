import { notFound } from 'next/navigation';
import { getProductBySku, ApiError } from '@/lib/api';
import { ProductImage } from '@/components/ProductImage';
import { ProductDetails } from '@/components/ProductDetails';
import { ProductActions } from '@/components/ProductActions/ProductActions';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ sku: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { sku } = await params;
  
  try {
    const product = await getProductBySku(sku);
    
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ProductImage src={product.imageUrl} alt={product.name} priority />
            </div>
            
            <div className="space-y-6">
              <ProductDetails product={product} />
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { sku } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  
  try {
    const product = await getProductBySku(sku);
    
    // Generate a comprehensive meta description
    const metaDescription = product.description 
      ? `${product.description.substring(0, 150)}${product.description.length > 150 ? '...' : ''}`
      : `Compre ${product.name} da marca ${product.brand} por R$ ${product.price.toFixed(2).replace('.', ',')}. Produto de qualidade com entrega rápida e garantia.`;
    
    const canonicalUrl = `${baseUrl}/product/${sku}`;
    
    return {
      title: `${product.name} - ${product.brand} | E-commerce Móveis`,
      description: metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${product.name} - ${product.brand}`,
        description: metaDescription,
        url: canonicalUrl,
        images: [{
          url: product.imageUrl,
          width: 600,
          height: 400,
          alt: product.name,
        }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand}`,
        description: metaDescription,
        images: [product.imageUrl],
      },
    };
  } catch {
    return {
      title: 'Produto não encontrado | E-commerce Móveis',
      description: 'O produto que você está procurando não foi encontrado. Navegue por nosso catálogo para descobrir outros produtos incríveis.',
      alternates: {
        canonical: `${baseUrl}/product/${sku}`,
      },
    };
  }
}