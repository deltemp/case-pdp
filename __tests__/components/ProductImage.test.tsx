import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductImage } from '@/components/ProductImage';

const mockImageProps = {
  src: 'https://example.com/sofa.jpg',
  alt: 'Sofá 3 Lugares Comfort',
  priority: false,
};

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, className, ...props }: any) {
    // Filter out Next.js specific props that are not valid HTML attributes
    const { fill, priority, sizes, ...validProps } = props;
    
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        className={className}
        {...validProps}
        data-testid="product-image"
      />
    );
  };
});

describe('ProductImage', () => {
  it('renders loading skeleton initially', () => {
    render(<ProductImage {...mockImageProps} />);
    
    const container = screen.getByTestId('product-image').parentElement;
    expect(container?.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows image after loading', async () => {
    render(<ProductImage {...mockImageProps} />);
    
    const image = screen.getByTestId('product-image');
    
    // Simulate image load
    fireEvent.load(image);
    
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
    });
    
    expect(image).toBeVisible();
    expect(image).toHaveAttribute('alt', mockImageProps.alt);
  });

  it('shows error state when image fails to load', async () => {
    render(<ProductImage {...mockImageProps} />);
    
    const image = screen.getByTestId('product-image');
    
    // Simulate image error
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByText('Imagem não disponível')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('product-image')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProductImage {...mockImageProps} />);
    
    const image = screen.getByTestId('product-image');
    expect(image).toHaveAttribute('alt', mockImageProps.alt);
  });

  it('applies correct CSS classes', () => {
    render(<ProductImage {...mockImageProps} />);
    
    const container = screen.getByTestId('product-image').parentElement;
    expect(container).toHaveClass('relative', 'aspect-[4/3]', 'w-full', 'overflow-hidden', 'rounded-lg', 'bg-gray-100');
  });

  it('handles missing imageUrl gracefully', async () => {
    const propsWithoutImage = { ...mockImageProps, src: '' };
    render(<ProductImage {...propsWithoutImage} />);
    
    // Component should automatically show error state for empty src
    await waitFor(() => {
      expect(screen.getByText('Imagem não disponível')).toBeInTheDocument();
    });
    
    // Image element should not be rendered when src is empty
     expect(screen.queryByTestId('product-image')).not.toBeInTheDocument();
   });

  it('initializes with loading state correctly', () => {
    render(<ProductImage {...mockImageProps} />);
    
    // Check that loading skeleton is present initially
    const container = screen.getByTestId('product-image').parentElement;
    const loadingSkeleton = container?.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
    expect(loadingSkeleton).toHaveClass('bg-gray-200');
    
    // Image should have opacity-0 initially (loading state)
    const image = screen.getByTestId('product-image');
    expect(image).toHaveClass('opacity-0');
  });
});