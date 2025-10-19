import React from 'react';
import { LogoutButton } from '@/components/LogoutButton';
import { getServerSession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="bg-card p-6 rounded-lg">
        <p className="mb-2">
          <strong>Welcome:</strong> {session.user.name}
        </p>
        <p>
          <strong>Email:</strong> {session.user.email}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
