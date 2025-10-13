import React, { PropsWithChildren } from 'react';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return <div className="auth-layout min-h-screen">{children}</div>;
};

export default AuthLayout;
