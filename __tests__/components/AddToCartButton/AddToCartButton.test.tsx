import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
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

describe('AddToCartButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default state', () => {
    renderWithProvider(<AddToCartButton />);
    
    expect(screen.getByText('Adicionar ao Carrinho')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('shows loading state when clicked', async () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    fireEvent.click(addButton);
    
    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(); // Loading spinner
  });

  it('shows success state after adding to cart', async () => {
    // Mock Math.random to always return success
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5); // > 0.2, so success
    
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Adicionado ao carrinho!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByLabelText(/Adicionar 1 unidade de .* ao carrinho/);
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('type', 'button');
  });

  it('applies correct CSS classes for different states', () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByRole('button');
    
    // Default state
    expect(addButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
  });

  it('displays correct icons for different states', async () => {
    // Mock Math.random to ensure success state
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5); // > 0.2, so success
    
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    // Default state - cart icon
    expect(addButton.querySelector('svg')).toBeInTheDocument();
    
    // Click to trigger loading state
    fireEvent.click(addButton);
    
    // Loading state - spinner icon
    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
    const loadingIcon = addButton.querySelector('svg.animate-spin');
    expect(loadingIcon).toBeInTheDocument();
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Adicionado ao carrinho!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Success state - check icon
    const successButton = screen.getByText('Adicionado ao carrinho!');
    const checkIcon = successButton.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
    
    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('handles error state correctly', async () => {
    // Mock Math.random to always return a value that triggers error (<= 0.2)
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    render(
      <ProductActionsProvider product={mockProduct}>
        <AddToCartButton />
      </ProductActionsProvider>
    );

    const button = screen.getByRole('button', { name: /adicionar.*ao carrinho/i });
    fireEvent.click(button);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Erro. Tente novamente')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check error styling
    const errorButton = screen.getByText('Erro. Tente novamente');
    expect(errorButton).toHaveClass('bg-red-600');
    
    // Restore mocks
    jest.restoreAllMocks();
  });

  it('updates aria-label based on quantity from context', () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByLabelText(/Adicionar 1 unidade de .* ao carrinho/);
    expect(addButton).toBeInTheDocument();
  });

  it('renders without quantity controls (quantity controls are in QuantitySpinner)', () => {
    renderWithProvider(<AddToCartButton />);
    
    // AddToCartButton should not have quantity controls
    expect(screen.queryByDisplayValue('1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Aumentar quantidade')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Diminuir quantidade')).not.toBeInTheDocument();
  });

  it('does not render social action buttons (they are in SocialActions component)', () => {
    renderWithProvider(<AddToCartButton />);
    
    // AddToCartButton should not have social action buttons
    expect(screen.queryByText('Favoritar')).not.toBeInTheDocument();
    expect(screen.queryByText('Compartilhar')).not.toBeInTheDocument();
  });

  it('uses quantity from context in aria-label', () => {
    renderWithProvider(<AddToCartButton />);
    
    // Check that aria-label uses quantity from context (default is 1)
    const addButton = screen.getByLabelText(/Adicionar 1 unidade de .* ao carrinho/);
    expect(addButton).toBeInTheDocument();
  });

  it('disables button during loading state', async () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    // Click add to cart to trigger loading state
    fireEvent.click(addButton);
    
    // Verify button is disabled during loading
    const loadingButton = screen.getByText('Adicionando...');
    expect(loadingButton).toBeDisabled();
  });

  it('applies correct button styles for all states', () => {
    renderWithProvider(<AddToCartButton />);
    
    const addButton = screen.getByText('Adicionar ao Carrinho');
    
    // Default state
    expect(addButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    
    // Click to trigger loading state
    fireEvent.click(addButton);
    
    // Loading state
    const loadingButton = screen.getByText('Adicionando...');
    expect(loadingButton).toHaveClass('bg-blue-400', 'cursor-not-allowed');
  });

  it('applies correct error state styling', async () => {
    // Mock Math.random to trigger error state
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    renderWithProvider(<AddToCartButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Erro. Tente novamente')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check error styling classes
    const errorButton = screen.getByText('Erro. Tente novamente');
    expect(errorButton).toHaveClass('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500');
    
    // Restore mocks
    jest.restoreAllMocks();
  });

  it('applies correct success state styling', async () => {
    // Mock Math.random to trigger success state
    jest.spyOn(Math, 'random').mockReturnValue(0.8);

    renderWithProvider(<AddToCartButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Adicionado ao carrinho!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check success styling classes
    const successButton = screen.getByText('Adicionado ao carrinho!');
    expect(successButton).toHaveClass('bg-green-600', 'cursor-default');
    expect(successButton).toBeDisabled();
    
    // Restore mocks
    jest.restoreAllMocks();
  });
});