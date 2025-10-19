'use client';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/SubmitButton';
import { register } from '@/lib/auth';
import { useActionState, useEffect, useState } from 'react';
import PasswordCheck from '@/components/PasswordCheck';
import { redirect } from 'next/navigation';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [state, action] = useActionState(register, undefined);
  const [passwordChecked, setPasswordChecked] = useState(false);

  useEffect(() => {
    if (state?.success) {
      redirect('/dashboard');
    }
  }, [state?.success]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  name="name"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  defaultValue={state?.name}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  defaultValue={state?.email}
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription className="text-destructive text-xs">
                  {state?.error?.email}
                </FieldDescription>
              </Field>
              <PasswordCheck setPasswordChecked={setPasswordChecked} />
              <Field>
                <SubmitButton>Create an account</SubmitButton>
                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  <a href="/auth/login">Connect here</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
