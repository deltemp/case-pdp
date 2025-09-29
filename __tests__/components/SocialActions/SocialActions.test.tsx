import { render, screen, fireEvent } from '@testing-library/react';
import { SocialActions } from '@/components/SocialActions/SocialActions';
import { ProductActionsProvider } from '@/contexts/ProductActionsContext';
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

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ProductActionsProvider product={mockProduct}>
      {component}
    </ProductActionsProvider>
  );
};

// Mock console.log to test function calls
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('SocialActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('renders favorite and share buttons', () => {
    renderWithProvider(<SocialActions />);
    
    expect(screen.getByText('Favoritar')).toBeInTheDocument();
    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
  });

  it('renders with proper button structure', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteButton = screen.getByText('Favoritar');
    const shareButton = screen.getByText('Compartilhar');
    
    expect(favoriteButton).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
    expect(favoriteButton.tagName).toBe('SPAN'); // Text inside button
    expect(shareButton.tagName).toBe('SPAN'); // Text inside button
  });

  it('has proper CSS classes and styling', () => {
    renderWithProvider(<SocialActions />);
    
    const container = screen.getByText('Favoritar').parentElement?.parentElement;
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    
    expect(container).toHaveClass('flex', 'space-x-3');
    expect(favoriteButton).toHaveClass(
      'flex-1',
      'bg-white',
      'border',
      'border-gray-300',
      'text-gray-700',
      'px-4',
      'py-2',
      'rounded-md',
      'hover:bg-gray-50',
      'cursor-pointer'
    );
    expect(shareButton).toHaveClass(
      'flex-1',
      'bg-white',
      'border',
      'border-gray-300',
      'text-gray-700',
      'px-4',
      'py-2',
      'rounded-md',
      'hover:bg-gray-50',
      'cursor-pointer'
    );
  });

  it('calls handleFavorite when favorite button is clicked', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    
    fireEvent.click(favoriteButton!);
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Favoritar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
  });

  it('calls handleShare when share button is clicked', () => {
    renderWithProvider(<SocialActions />);
    
    const shareButton = screen.getByText('Compartilhar').parentElement;
    
    fireEvent.click(shareButton!);
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Compartilhar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
  });

  it('renders images with proper attributes', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteImage = screen.getByAltText('Favoritar');
    const shareImage = screen.getByAltText('Compartilhar');
    
    expect(favoriteImage).toBeInTheDocument();
    expect(shareImage).toBeInTheDocument();
    expect(favoriteImage).toHaveAttribute('src', '/icons/favorite.svg');
    expect(shareImage).toHaveAttribute('src', '/icons/share.svg');
    expect(favoriteImage).toHaveAttribute('width', '16');
    expect(favoriteImage).toHaveAttribute('height', '16');
    expect(shareImage).toHaveAttribute('width', '16');
    expect(shareImage).toHaveAttribute('height', '16');
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    
    expect(favoriteButton).toHaveAttribute('type', 'button');
    expect(shareButton).toHaveAttribute('type', 'button');
    expect(favoriteButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-blue-500');
    expect(shareButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-blue-500');
  });

  it('handles multiple clicks correctly', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    
    // Click favorite multiple times
    fireEvent.click(favoriteButton!);
    fireEvent.click(favoriteButton!);
    
    // Click share multiple times
    fireEvent.click(shareButton!);
    fireEvent.click(shareButton!);
    
    expect(mockConsoleLog).toHaveBeenCalledTimes(4);
    expect(mockConsoleLog).toHaveBeenNthCalledWith(1, 'Favoritar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    expect(mockConsoleLog).toHaveBeenNthCalledWith(2, 'Favoritar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Compartilhar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    expect(mockConsoleLog).toHaveBeenNthCalledWith(4, 'Compartilhar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
  });

  it('uses product data from context correctly', () => {
    const customProduct: Product = {
      id: 2,
      name: 'Mesa de Jantar',
      brand: 'MadeiraFina',
      sku: 'MJ-MADEIRA-4P',
      price: 899.99,
      description: 'Mesa de jantar em madeira maciça.',
      imageUrl: 'https://example.com/mesa.jpg',
      createdAt: '2024-01-16T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
    };

    render(
      <ProductActionsProvider product={customProduct}>
        <SocialActions />
      </ProductActionsProvider>
    );
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    
    fireEvent.click(favoriteButton!);
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Favoritar produto:', {
      name: customProduct.name,
      sku: customProduct.sku
    });
  });

  it('renders buttons with proper flex layout', () => {
    renderWithProvider(<SocialActions />);
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    
    expect(favoriteButton).toHaveClass('flex', 'items-center', 'justify-center', 'space-x-2');
    expect(shareButton).toHaveClass('flex', 'items-center', 'justify-center', 'space-x-2');
  });
});