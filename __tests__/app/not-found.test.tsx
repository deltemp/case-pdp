import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';

// Mock window.history.back
const mockHistoryBack = jest.fn();

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, className, ...props }: any) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

describe('App NotFound Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: {
        back: mockHistoryBack,
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering and UI Elements', () => {
    it('renders the main container with proper styling', () => {
      render(<NotFound />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center', 'px-4');
    });

    it('renders the 404 error code', () => {
      render(<NotFound />);

      const errorCode = screen.getByRole('heading', { level: 1 });
      expect(errorCode).toBeInTheDocument();
      expect(errorCode).toHaveTextContent('404');
      expect(errorCode).toHaveClass('text-4xl', 'font-bold', 'text-gray-900', 'mb-4');
    });

    it('renders the error title', () => {
      render(<NotFound />);

      const errorTitle = screen.getByRole('heading', { level: 2 });
      expect(errorTitle).toBeInTheDocument();
      expect(errorTitle).toHaveTextContent('Produto não encontrado');
      expect(errorTitle).toHaveClass('text-xl', 'font-semibold', 'text-gray-700', 'mb-2');
    });

    it('renders the error description', () => {
      render(<NotFound />);

      const description = screen.getByText(/O produto que você está procurando não existe ou foi removido do nosso catálogo/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-gray-600', 'leading-relaxed');
    });

    it('renders the error icon SVG', () => {
      render(<NotFound />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('mx-auto', 'h-24', 'w-24', 'text-gray-400');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders navigation buttons', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      const backButton = screen.getByText('Voltar à página anterior');

      expect(homeButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('renders suggestions section', () => {
      render(<NotFound />);

      const suggestionsTitle = screen.getByText('Sugestões:');
      expect(suggestionsTitle).toBeInTheDocument();
      expect(suggestionsTitle).toHaveClass('text-sm', 'font-medium', 'text-blue-800', 'mb-2');

      expect(screen.getByText('• Verifique se o link está correto')).toBeInTheDocument();
      expect(screen.getByText('• Navegue pelo nosso catálogo')).toBeInTheDocument();
      expect(screen.getByText('• Use a busca para encontrar produtos')).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('home button links to root path', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      expect(homeButton.closest('a')).toHaveAttribute('href', '/');
    });

    it('calls window.history.back when back button is clicked', () => {
      render(<NotFound />);

      const backButton = screen.getByText('Voltar à página anterior');
      fireEvent.click(backButton);

      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
    });

    it('home button has proper styling', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      expect(homeButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'w-full',
        'px-6',
        'py-3',
        'border',
        'border-transparent',
        'text-base',
        'font-medium',
        'rounded-md',
        'text-white',
        'bg-blue-600',
        'hover:bg-blue-700',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-blue-500',
        'transition-colors'
      );
    });

    it('back button has proper styling', () => {
      render(<NotFound />);

      const backButton = screen.getByText('Voltar à página anterior');
      expect(backButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'w-full',
        'px-6',
        'py-3',
        'border',
        'border-gray-300',
        'text-base',
        'font-medium',
        'rounded-md',
        'text-gray-700',
        'bg-white',
        'hover:bg-gray-50',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-blue-500',
        'transition-colors',
        'cursor-pointer'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<NotFound />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });

      expect(h1).toHaveTextContent('404');
      expect(h2).toHaveTextContent('Produto não encontrado');
      expect(h3).toHaveTextContent('Sugestões:');
    });

    it('has focusable navigation elements', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      const backButton = screen.getByText('Voltar à página anterior');

      // Links and buttons are focusable by default, no need to check tabIndex
      expect(homeButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('has proper focus management', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      const backButton = screen.getByText('Voltar à página anterior');

      homeButton.focus();
      expect(document.activeElement).toBe(homeButton);

      backButton.focus();
      expect(document.activeElement).toBe(backButton);
    });

    it('SVG has proper accessibility attributes', () => {
      render(<NotFound />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Responsive Design', () => {
    it('has responsive container classes', () => {
      render(<NotFound />);

      const container = screen.getByText('404').closest('div')?.parentElement;
      expect(container).toHaveClass('max-w-md', 'w-full', 'text-center');
    });

    it('has responsive spacing classes', () => {
      render(<NotFound />);

      const buttonContainer = screen.getByText('Voltar ao início').parentElement;
      expect(buttonContainer).toHaveClass('space-y-4');
    });

    it('has responsive padding on main container', () => {
      render(<NotFound />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('px-4');
    });
  });

  describe('Content Structure', () => {
    it('has proper content hierarchy and spacing', () => {
      render(<NotFound />);

      // Check icon section
      const iconSection = document.querySelector('.mb-8');
      expect(iconSection).toBeInTheDocument();

      // Check suggestions section
      const suggestionsSection = screen.getByText('Sugestões:').closest('div');
      expect(suggestionsSection).toHaveClass('mt-8', 'p-4', 'bg-blue-50', 'rounded-lg');
    });

    it('displays all suggestion items', () => {
      render(<NotFound />);

      const suggestionsList = screen.getByText('• Verifique se o link está correto').closest('ul');
      expect(suggestionsList).toHaveClass('text-sm', 'text-blue-700', 'space-y-1');

      const suggestions = [
        '• Verifique se o link está correto',
        '• Navegue pelo nosso catálogo',
        '• Use a busca para encontrar produtos'
      ];

      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  describe('Button Icons', () => {
    it('home button contains home icon SVG', () => {
      render(<NotFound />);

      const homeButton = screen.getByText('Voltar ao início');
      const homeSvg = homeButton.querySelector('svg');
      
      expect(homeSvg).toBeInTheDocument();
      expect(homeSvg).toHaveClass('mr-2', 'h-5', 'w-5');
    });

    it('back button contains arrow icon SVG', () => {
      render(<NotFound />);

      const backButton = screen.getByText('Voltar à página anterior');
      const backSvg = backButton.querySelector('svg');
      
      expect(backSvg).toBeInTheDocument();
      expect(backSvg).toHaveClass('mr-2', 'h-5', 'w-5');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing window.history gracefully', () => {
      // Mock window.history to be undefined
      const originalHistory = window.history;
      delete (window as any).history;

      render(<NotFound />);
      const backButton = screen.getByText('Voltar à página anterior');
      
      // Should not throw when clicking the button
      expect(() => {
        fireEvent.click(backButton);
      }).not.toThrow();

      // Restore window.history
      window.history = originalHistory;
    });

    it('should render without crashing', () => {
      expect(() => render(<NotFound />)).not.toThrow();
    });
  });
});