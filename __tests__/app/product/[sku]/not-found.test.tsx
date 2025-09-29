import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '@/app/product/[sku]/not-found';

// Mock Next.js router
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('Product NotFound Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders not found message and navigation options', () => {
    render(<NotFound />);

    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
    expect(screen.getByText(/O produto que você está procurando não existe ou foi removido/)).toBeInTheDocument();
    expect(screen.getByText('Voltar à página inicial')).toBeInTheDocument();
    expect(screen.getByText('Voltar à página anterior')).toBeInTheDocument();
  });

  it('has proper heading structure', () => {
    render(<NotFound />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Produto não encontrado');
  });

  it('displays SVG illustration', () => {
    render(<NotFound />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('navigates to home page when home button is clicked', () => {
    render(<NotFound />);

    const homeButton = screen.getByText('Voltar à página inicial');
    fireEvent.click(homeButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('navigates back when back button is clicked', () => {
    render(<NotFound />);

    const backButton = screen.getByText('Voltar à página anterior');
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('has proper button styling and accessibility', () => {
    render(<NotFound />);

    const homeButton = screen.getByText('Voltar à página inicial');
    const backButton = screen.getByText('Voltar à página anterior');

    expect(homeButton).toHaveClass('bg-blue-600', 'text-white');
    expect(backButton).toHaveClass('bg-white', 'text-gray-700', 'border-gray-300');

    // Check if buttons are focusable
    expect(homeButton).toHaveAttribute('type', 'button');
    expect(backButton).toHaveAttribute('type', 'button');
  });

  it('has responsive layout classes', () => {
    render(<NotFound />);

    const container = screen.getByText('Produto não encontrado').closest('div');
    expect(container?.parentElement).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('displays helpful error message', () => {
    render(<NotFound />);

    const errorMessage = screen.getByText(/O produto que você está procurando não existe ou foi removido/);
    expect(errorMessage).toBeInTheDocument();
    
    const suggestionMessage = screen.getByText(/Verifique se o link está correto ou navegue para outras seções/);
    expect(suggestionMessage).toBeInTheDocument();
  });

  it('has proper spacing and layout structure', () => {
    render(<NotFound />);

    const mainContainer = screen.getByText('Produto não encontrado').closest('div');
    expect(mainContainer).toHaveClass('text-center', 'space-y-6', 'px-4');

    const buttonContainer = screen.getByText('Voltar à página inicial').closest('div');
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'justify-center');
  });
});