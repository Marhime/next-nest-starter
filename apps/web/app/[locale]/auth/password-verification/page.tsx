import React from 'react';

const PasswordVerificationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const token = (await searchParams).token;
  return <h1 className="text-9xl text-center">Password Verification Page</h1>;
};

export default PasswordVerificationPage;
