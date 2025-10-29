'use client';
import { authClient } from '@/lib/auth/auth-client';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

const PasswordVerificationPage = () => {
  const token = useSearchParams().get('token');

  useEffect(() => {
    if (!token || typeof token !== 'string') {
      return;
    }

    const verifyEmail = async () => {
      try {
        const { error, data } = await authClient.verifyEmail({
          query: {
            token,
          },
        });
        if (error) {
          console.error('Error verifying email:', error);
          // Handle error (e.g., show message to user)
        } else {
          // Email verified successfully, redirect to login or dashboard
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        // Handle error (e.g., show message to user)
      }
    };

    verifyEmail();
  }, [token]);

  return <h1 className="text-9xl text-center">Verifying your email...</h1>;
};

export default PasswordVerificationPage;
