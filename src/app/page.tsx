import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página Inicial | E-commerce Móveis',
  description: 'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais. Entrega rápida e garantia de satisfação.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  },
  openGraph: {
    title: 'E-commerce Móveis - Qualidade e Conforto para sua Casa',
    description: 'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-commerce Móveis - Qualidade e Conforto para sua Casa',
    description: 'Descubra móveis de qualidade com os melhores preços. Sofás, cadeiras, mesas e muito mais.',
  },
};

export default function Home() {
  redirect('/product/sf-comfort-3l-bg');
}