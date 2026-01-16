import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Header />
      {/* Main content with padding for mobile nav */}
      <div className="md:pb-0 pb-20">{children}</div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      <Footer />
    </QueryProvider>
  );
}
