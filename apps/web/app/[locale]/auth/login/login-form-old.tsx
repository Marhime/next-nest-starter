'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { redirect } from '@/i18n/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { useForm } from '@tanstack/react-form';
import { LoginFormSchema } from '@/lib/auth/type';
import { toast } from 'sonner';
import { useGlobalStore } from '../../store';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const session = authClient.useSession();
  const locale = useLocale();
  const t = useTranslations('LoginForm');
  const tErrors = useTranslations('Errors.LoginForm');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { passwordResetEmail, clearPasswordResetEmail } = useGlobalStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: passwordResetEmail || '',
      password: '',
    },
    validators: {
      onSubmit: LoginFormSchema,
    },
    onSubmit: async ({ value }) => {
      const loginPromise = authClient.signIn
        .email({
          email: value.email,
          password: value.password,
          rememberMe: true,
        })
        .then(({ error: authError, data }) => {
          if (authError) {
            setErrorMessage(authError.message || tErrors('loginFailed'));
            throw new Error(authError.message || tErrors('loginFailed'));
          }

          // Nettoyer l'email du store après une connexion réussie
          clearPasswordResetEmail?.();
          return data;
        });

      try {
        const data = await toast.promise(loginPromise, {
          loading: tErrors('loggingIn') || 'Connexion...',
          success: tErrors('loginSuccess'),
          error: (err) => err?.message || tErrors('loginFailed'),
        });

        const redirectTo = searchParams.get('redirectTo') || '/';

        router.push(redirectTo);

        return data;
      } catch (err) {
        console.error('Login error:', err);
      }
    },
  });

  const socialSignIn = async (provider: 'facebook' | 'google') => {
    console.log(`Signing in with ${provider}...`);
    const data = await authClient.signIn.social({
      provider,
    });
    if (data) {
      const redirectTo = searchParams.get('redirectTo') || '/';
      router.push(redirectTo);
    }
    console.log('Social sign-in data:', data);
  };

  const {
    pendingCreateIntent,
    setPendingCreateIntent,
    setIsPropertyTypeModalOpen,
    setIsLoginModalOpen,
  } = useGlobalStore();

  useEffect(() => {
    if (session?.data?.user) {
      // If the user was trying to create a property, resume that flow instead of redirecting
      if (pendingCreateIntent) {
        setPendingCreateIntent?.(false);
        // close login modal and open property type modal to continue creation
        setIsLoginModalOpen?.(false);
        setIsPropertyTypeModalOpen?.(true);
        return;
      }

      if (session?.data?.user.role === 'ADMIN') {
        redirect({ href: { pathname: '/dashboard' }, locale });
      } else {
        redirect({ href: { pathname: '/' }, locale });
      }
    }
  }, [
    session?.data?.user,
    locale,
    pendingCreateIntent,
    setPendingCreateIntent,
    setIsPropertyTypeModalOpen,
    setIsLoginModalOpen,
  ]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <Field>
                <Button
                  variant="default"
                  type="button"
                  className="bg-[#1877F2] text-white hover:bg-[#1877F2F5]"
                  onClick={() => socialSignIn('facebook')}
                >
                  <Image
                    src="/fb.svg"
                    alt="Login with Facebook"
                    width={24}
                    height={24}
                  />
                  Login with Facebook
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => socialSignIn('google')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('google')}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('continueWith')}
              </FieldSeparator>
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>{t('email')}</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={() => {
                          field.handleBlur();
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="m@example.com"
                        aria-invalid={isInvalid}
                        autoComplete="email"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>
                          {t('password')}
                        </FieldLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          {t('forgot')}
                        </Link>
                      </div>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={() => {
                          field.handleBlur();
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="Password"
                        aria-invalid={isInvalid}
                        autoComplete="current-password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      {errorMessage && (
                        <FieldError errors={[{ message: errorMessage }]} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <Field>
                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                  className="w-full"
                >
                  {form.state.isSubmitting ? t('submitting') : t('submit')}
                </Button>
                <FieldDescription className="text-center">
                  {t('signup')}{' '}
                  <Link
                    href="/auth/register"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {t('signupLinkText')}
                  </Link>
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
