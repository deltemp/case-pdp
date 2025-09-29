import { render, screen, fireEvent } from '@testing-library/react';
import { QuantitySpinner } from '@/components/QuantitySpinner/QuantitySpinner';
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

describe('QuantitySpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial quantity of 1', () => {
    renderWithProvider(<QuantitySpinner />);
    
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('increases quantity when plus button is clicked', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    
    fireEvent.click(increaseButton);
    
    expect(quantityInput.value).toBe('2');
  });

  it('decreases quantity when minus button is clicked', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    const decreaseButton = screen.getByText('-');
    
    // First increase to 2
    fireEvent.click(increaseButton);
    expect(quantityInput.value).toBe('2');
    
    // Then decrease back to 1
    fireEvent.click(decreaseButton);
    expect(quantityInput.value).toBe('1');
  });

  it('does not decrease quantity below 1', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const decreaseButton = screen.getByText('-');
    
    // Try to decrease below 1
    fireEvent.click(decreaseButton);
    
    expect(quantityInput.value).toBe('1');
    expect(decreaseButton).toBeDisabled();
  });

  it('handles direct input changes', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    expect(quantityInput.value).toBe('5');
  });

  it('ignores invalid input values', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    
    // Try to input invalid values
    fireEvent.change(quantityInput, { target: { value: 'abc' } });
    expect(quantityInput.value).toBe('1'); // Should remain unchanged
    
    fireEvent.change(quantityInput, { target: { value: '0' } });
    expect(quantityInput.value).toBe('1'); // Should remain unchanged
    
    fireEvent.change(quantityInput, { target: { value: '-5' } });
    expect(quantityInput.value).toBe('1'); // Should remain unchanged
  });

  it('has proper CSS classes and styling', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const container = screen.getByDisplayValue('1').parentElement;
    const quantityInput = screen.getByDisplayValue('1');
    const decreaseButton = screen.getByText('-');
    const increaseButton = screen.getByText('+');
    
    expect(container).toHaveClass('flex', 'items-center', 'border', 'border-gray-300', 'rounded-md');
    expect(quantityInput).toHaveClass('w-16', 'px-2', 'py-2', 'text-center', 'border-0');
    expect(decreaseButton).toHaveClass('px-3', 'py-2', 'text-gray-600');
    expect(increaseButton).toHaveClass('px-3', 'py-2', 'text-gray-600');
  });

  it('has proper input attributes', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1');
    
    expect(quantityInput).toHaveAttribute('type', 'number');
    expect(quantityInput).toHaveAttribute('min', '1');
    expect(quantityInput).toHaveAttribute('id', 'quantity');
  });

  it('disables decrease button when quantity is 1', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const decreaseButton = screen.getByText('-');
    
    expect(decreaseButton).toBeDisabled();
    expect(decreaseButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('enables decrease button when quantity is greater than 1', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const increaseButton = screen.getByText('+');
    const decreaseButton = screen.getByText('-');
    
    // Increase quantity first
    fireEvent.click(increaseButton);
    
    expect(decreaseButton).toBeEnabled();
  });

  it('handles multiple rapid clicks correctly', () => {
    renderWithProvider(<QuantitySpinner />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByText('+');
    
    // Click multiple times rapidly
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    expect(quantityInput.value).toBe('4');
  });
});