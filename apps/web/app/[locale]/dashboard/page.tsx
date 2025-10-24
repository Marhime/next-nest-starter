'use client';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

import data from './data.json';
import { redirect } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth/session';
import { useLocale } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';

export default function Page({}: {}) {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const locale = useLocale();

  if (isLoading) return null;
  if (!session?.user?.role && session?.user.role !== 'ADMIN') {
    redirect({ href: { pathname: '/' }, locale });
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
