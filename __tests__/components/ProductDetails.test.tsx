import { render, screen } from '@testing-library/react';
import { ProductDetails } from '@/components/ProductDetails';
import { Product } from '@/types/product';

const mockProduct: Product = {
  id: 1,
  name: 'Sofá 3 Lugares Comfort',
  brand: 'MóveisTop',
  sku: 'sf-comfort-3l-bg',
  price: 1299.99,
  description: 'Sofá confortável de 3 lugares em tecido bege.',
  imageUrl: 'https://example.com/sofa.jpg',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

// Mock the format utilities
jest.mock('@/utils/format', () => ({
  formatPrice: (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`,
  formatDate: (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  },
}));

describe('ProductDetails', () => {
  it('renders all product information correctly', () => {
    render(<ProductDetails product={mockProduct} />);
    
    // Check brand and name
    expect(screen.getAllByText('MóveisTop')).toHaveLength(2); // Brand appears twice (badge and info section)
    expect(screen.getByText('Sofá 3 Lugares Comfort')).toBeInTheDocument();
    
    // Check SKU
    expect(screen.getByText('SKU:')).toBeInTheDocument();
    expect(screen.getAllByText('sf-comfort-3l-bg')).toHaveLength(2); // SKU appears twice (main section and info section)
    
    // Check price
    expect(screen.getByText('R$ 1299,99')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText('Sofá confortável de 3 lugares em tecido bege.')).toBeInTheDocument();
  });

  it('displays formatted creation date', () => {
    render(<ProductDetails product={mockProduct} />);
    
    expect(screen.getByText(/Disponível desde:/)).toBeInTheDocument();
  });

  it('shows delivery and quality information', () => {
    render(<ProductDetails product={mockProduct} />);

    expect(screen.getByText('Entrega rápida e segura')).toBeInTheDocument();
    expect(screen.getByText('Garantia de qualidade')).toBeInTheDocument();
    expect(screen.getByText('Parcelamento sem juros')).toBeInTheDocument();
  });

  it('has proper heading hierarchy', () => {
    render(<ProductDetails product={mockProduct} />);

    const nameHeading = screen.getByRole('heading', { level: 1 });
    const descriptionHeading = screen.getByRole('heading', { level: 2 });
    
    expect(nameHeading).toHaveTextContent('Sofá 3 Lugares Comfort');
    expect(descriptionHeading).toHaveTextContent('Descrição do Produto');
  });

  it('applies correct CSS classes for styling', () => {
    render(<ProductDetails product={mockProduct} />);
    
    const brandBadge = screen.getAllByText('MóveisTop')[0]; // Get the first occurrence (brand badge)
    expect(brandBadge).toHaveClass('inline-block', 'px-3', 'py-1', 'text-sm', 'font-medium', 'text-blue-600', 'bg-blue-100', 'rounded-full');
  });

  it('handles long product names gracefully', () => {
    const productWithLongName = {
      ...mockProduct,
      name: 'Sofá Retrátil e Reclinável 3 Lugares com Chaise Longue em Tecido Suede Premium Collection Comfort Plus',
    };
    
    render(<ProductDetails product={productWithLongName} />);
    
    expect(screen.getByText(productWithLongName.name)).toBeInTheDocument();
  });

  it('handles missing or empty description', () => {
    const productWithoutDescription = {
      ...mockProduct,
      description: '',
    };
    
    render(<ProductDetails product={productWithoutDescription} />);

    // Should still render other elements
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sofá 3 Lugares Comfort');
    expect(screen.queryByText('Descrição do Produto')).not.toBeInTheDocument();
  });

  it('formats price correctly for different values', () => {
    const expensiveProduct = {
      ...mockProduct,
      price: 15999.99,
    };
    
    render(<ProductDetails product={expensiveProduct} />);
    
    expect(screen.getByText('R$ 15999,99')).toBeInTheDocument();
  });

  it('displays additional product features', () => {
    render(<ProductDetails product={mockProduct} />);

    expect(screen.getByText('Vantagens')).toBeInTheDocument();
    expect(screen.getByText('Entrega rápida e segura')).toBeInTheDocument();
    expect(screen.getByText('Garantia de qualidade')).toBeInTheDocument();
    expect(screen.getByText('Parcelamento sem juros')).toBeInTheDocument();
  });
});