'use client';
import React, { PropsWithChildren } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

function SubmitButton({ children }: PropsWithChildren) {
  const { pending } = useFormStatus();

  console.log(pending);
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? <Spinner /> : children}
    </Button>
  );
}

export default SubmitButton;
