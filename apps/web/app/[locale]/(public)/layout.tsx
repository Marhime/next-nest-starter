import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Header />
      {children}
      <Footer />
    </QueryProvider>
  );
}
