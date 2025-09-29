'use client';

import { useRouter } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produto não encontrado | E-commerce Móveis',
  description: 'O produto que você está procurando não foi encontrado. Navegue por nosso catálogo para descobrir outros produtos incríveis.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductNotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="mb-8">
          {/* 404 Illustration */}
          <svg
            className="mx-auto h-32 w-32 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Produto não encontrado
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          O produto que você está procurando não existe ou foi removido do nosso catálogo.
          Verifique se o link está correto ou navegue para outras seções da loja.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            Voltar à página inicial
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            Voltar à página anterior
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Código de erro: 404 - Produto não encontrado</p>
        </div>
      </div>
    </main>
  );
}