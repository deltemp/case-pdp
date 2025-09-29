import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductActions } from '@/components/ProductActions/ProductActions';
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

const renderWithProvider = () => {
  return render(<ProductActions product={mockProduct} />);
};

describe('ProductActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all child components', () => {
    renderWithProvider();
    
    // Check for QuantitySpinner elements
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    
    // Check for AddToCartButton
    expect(screen.getByText('Adicionar ao Carrinho')).toBeInTheDocument();
    
    // Check for SocialActions
    expect(screen.getByText('Favoritar')).toBeInTheDocument();
    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
  });

  it('has proper container structure and styling', () => {
    renderWithProvider();
    
    const container = screen.getByDisplayValue('1').closest('.space-y-4');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('space-y-4');
  });

  it('integrates quantity spinner with add to cart button', async () => {
    renderWithProvider();
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    // Increase quantity
    fireEvent.click(increaseButton);
    expect(quantityInput.value).toBe('2');
    
    // Check that aria-label updates
    expect(screen.getByLabelText(/Adicionar 2 unidades de .* ao carrinho/)).toBeInTheDocument();
    
    // Click add to cart
    fireEvent.click(addButton);
    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
  });

  it('maintains state consistency across components', () => {
    renderWithProvider();
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    
    // Change quantity multiple times
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    expect(quantityInput.value).toBe('4');
    
    // Verify the add to cart button reflects the correct quantity
    expect(screen.getByLabelText(/Adicionar 4 unidades de .* ao carrinho/)).toBeInTheDocument();
  });

  it('handles social actions independently of cart actions', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithProvider();
    
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    // Click social actions
    fireEvent.click(favoriteButton!);
    fireEvent.click(shareButton!);
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Favoritar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    expect(mockConsoleLog).toHaveBeenCalledWith('Compartilhar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    
    // Add to cart should still work
    fireEvent.click(addButton);
    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
    
    mockConsoleLog.mockRestore();
  });

  it('renders with proper component order', () => {
    renderWithProvider();
    
    const container = screen.getByDisplayValue('1').closest('.space-y-4');
    const children = container?.children;
    
    expect(children).toHaveLength(3);
    
    // First child should contain quantity spinner
    expect(children?.[0]).toContainElement(screen.getByDisplayValue('1'));
    
    // Second child should contain add to cart button
    expect(children?.[1]).toContainElement(screen.getByText('Adicionar ao Carrinho'));
    
    // Third child should contain social actions
    expect(children?.[2]).toContainElement(screen.getByText('Favoritar'));
    expect(children?.[2]).toContainElement(screen.getByText('Compartilhar'));
  });

  it('handles complex user interactions', async () => {
    // Mock Math.random to ensure success state
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5); // > 0.2, so success
    
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithProvider();
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    const decreaseButton = screen.getByText('-');
    const addButton = screen.getByText('Adicionar ao Carrinho');
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    
    // Complex interaction sequence
    fireEvent.click(increaseButton); // quantity = 2
    fireEvent.click(increaseButton); // quantity = 3
    fireEvent.click(favoriteButton!); // favorite product
    fireEvent.click(decreaseButton); // quantity = 2
    
    expect(quantityInput.value).toBe('2');
    expect(mockConsoleLog).toHaveBeenCalledWith('Favoritar produto:', {
      name: mockProduct.name,
      sku: mockProduct.sku
    });
    
    // Add to cart with final quantity
    fireEvent.click(addButton);
    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Adicionado ao carrinho!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    mockConsoleLog.mockRestore();
    Math.random = originalRandom;
  });

  it('provides proper accessibility for the entire component', () => {
    renderWithProvider();
    
    // Check quantity input accessibility
    const quantityInput = screen.getByDisplayValue('1');
    expect(quantityInput).toHaveAttribute('id', 'quantity');
    expect(quantityInput).toHaveAttribute('type', 'number');
    expect(quantityInput).toHaveAttribute('min', '1');
    
    // Check button accessibility
    const addButton = screen.getByLabelText(/Adicionar 1 unidade de .* ao carrinho/);
    expect(addButton).toHaveAttribute('type', 'button');
    
    // Check social buttons accessibility
    const favoriteButton = screen.getByText('Favoritar').parentElement;
    const shareButton = screen.getByText('Compartilhar').parentElement;
    expect(favoriteButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    expect(shareButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('handles edge cases gracefully', () => {
    renderWithProvider();
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const decreaseButton = screen.getByText('-');
    
    // Try to decrease below minimum
    fireEvent.click(decreaseButton);
    expect(quantityInput.value).toBe('1');
    expect(decreaseButton).toBeDisabled();
    
    // Try invalid input
    fireEvent.change(quantityInput, { target: { value: 'invalid' } });
    expect(quantityInput.value).toBe('1');
  });
});