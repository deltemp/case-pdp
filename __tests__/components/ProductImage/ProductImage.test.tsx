import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductImage } from '../../../src/components/ProductImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, fill, priority, className, sizes, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => {
          if (onLoad) onLoad();
        }}
        onError={() => {
          if (onError) onError();
        }}
        data-testid="product-image"
        data-fill={fill ? 'true' : 'false'}
        data-priority={priority ? 'true' : 'false'}
        data-sizes={sizes}
      />
    );
  };
});

describe('ProductImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test product image',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with valid src', () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.src);
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });

  it('shows loading skeleton initially', () => {
    render(<ProductImage {...defaultProps} />);
    
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
  });

  it('hides loading skeleton after image loads', async () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    
    // Trigger load event
    fireEvent.load(image);
    
    await waitFor(() => {
      const loadingSkeleton = document.querySelector('.animate-pulse');
      expect(loadingSkeleton).not.toBeInTheDocument();
    });
  });

  it('shows error state when src is empty string', () => {
    render(<ProductImage src="" alt="Test alt" />);
    
    const errorMessage = screen.getByText('Imagem não disponível');
    expect(errorMessage).toBeInTheDocument();
    
    const image = screen.queryByTestId('product-image');
    expect(image).not.toBeInTheDocument();
  });

  it('shows error state when src is only whitespace', () => {
    render(<ProductImage src="   " alt="Test alt" />);
    
    const errorMessage = screen.getByText('Imagem não disponível');
    expect(errorMessage).toBeInTheDocument();
    
    const image = screen.queryByTestId('product-image');
    expect(image).not.toBeInTheDocument();
  });

  it('shows error state when src is undefined', () => {
    render(<ProductImage src={undefined as any} alt="Test alt" />);
    
    const errorMessage = screen.getByText('Imagem não disponível');
    expect(errorMessage).toBeInTheDocument();
    
    const image = screen.queryByTestId('product-image');
    expect(image).not.toBeInTheDocument();
  });

  it('shows error state when image fails to load', async () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    
    // Trigger error event
    fireEvent.error(image);
    
    await waitFor(() => {
      const errorMessage = screen.getByText('Imagem não disponível');
      expect(errorMessage).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const loadingSkeleton = document.querySelector('.animate-pulse');
      expect(loadingSkeleton).not.toBeInTheDocument();
    });
  });

  it('renders with priority prop', () => {
    render(<ProductImage {...defaultProps} priority={true} />);
    
    const image = screen.getByTestId('product-image');
    expect(image).toBeInTheDocument();
  });

  it('renders without priority prop (defaults to false)', () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    expect(image).toBeInTheDocument();
  });

  it('applies correct CSS classes for loading state', () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    expect(image).toHaveClass('opacity-0');
  });

  it('applies correct CSS classes after loading', async () => {
    render(<ProductImage {...defaultProps} />);
    
    const image = screen.getByTestId('product-image');
    
    // Trigger load event
    fireEvent.load(image);
    
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
    });
  });

  it('renders error icon in error state', () => {
    render(<ProductImage src="" alt="Test alt" />);
    
    const errorIcon = document.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveClass('h-12', 'w-12');
  });

  it('has correct container styling', () => {
    const { container } = render(<ProductImage {...defaultProps} />);
    
    const imageContainer = container.firstChild;
    expect(imageContainer).toHaveClass(
      'relative',
      'aspect-[4/3]',
      'w-full',
      'overflow-hidden',
      'rounded-lg',
      'bg-gray-100'
    );
  });
});