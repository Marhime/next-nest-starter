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
import { useState } from 'react';
import PasswordCheck from '@/components/PasswordCheck';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    name?: string;
    email?: string;
    password?: string;
    message?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError({});

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setError({ message: authError.message || 'Registration failed' });
        setLoading(false);
        return;
      }

      // Redirection après succès
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Registration error:', err);
      setError({
        message: 'Failed to connect to the server. Please try again.',
      });
      setLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  name="name"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
                {error.name && (
                  <FieldDescription className="text-destructive text-xs">
                    {error.name}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
                {error.email && (
                  <FieldDescription className="text-destructive text-xs">
                    {error.email}
                  </FieldDescription>
                )}
              </Field>
              <PasswordCheck setPasswordChecked={setPasswordChecked} />
              {error.password && (
                <FieldDescription className="text-destructive text-xs">
                  {error.password}
                </FieldDescription>
              )}
              {error.message && (
                <FieldDescription className="text-destructive text-xs">
                  {error.message}
                </FieldDescription>
              )}
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create an account'}
                </Button>
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
