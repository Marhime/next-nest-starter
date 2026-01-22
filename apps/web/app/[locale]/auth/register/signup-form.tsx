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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { useForm } from '@tanstack/react-form';
import { SignupFormSchema } from '@/lib/auth/type';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('SignupForm');
  const tErrors = useTranslations('Errors.LoginForm');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: SignupFormSchema,
    },
    onSubmit: async ({ value }) => {
      const signupPromise = authClient.signUp
        .email({
          email: value.email,
          password: value.password,
          name: value.name,
        })
        .then(({ error: authError }) => {
          if (authError) {
            throw new Error(authError.message || tErrors('registrationFailed'));
          }
          return true;
        });

      try {
        await toast.promise(signupPromise, {
          loading: tErrors('registering') || 'Inscription...',
          success: tErrors('registrationSuccess'),
          error: (err) => err?.message || tErrors('registrationFailed'),
        });

        router.push('/auth/verify-email');
      } catch (err) {
        console.error('Registration error:', err);
      }
    },
  });

  const socialSignIn = async (provider: 'facebook' | 'google') => {
    console.log(`Signing up with ${provider}...`);
    const data = await authClient.signIn.social({
      provider,
    });
    if (data) {
      const redirectTo = searchParams.get('redirectTo') || '/';
      router.push(redirectTo);
    }
    console.log('Social sign-up data:', data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className={className}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {/* Social Signup Buttons - Primary */}
            <Field>
              <Button
                variant="default"
                type="button"
                size="lg"
                className="w-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
                onClick={() => socialSignIn('facebook')}
              >
                <Image
                  src="/fb.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {t('continueWith') || 'Continuar con'} Facebook
              </Button>
              <Button
                onClick={() => socialSignIn('google')}
                variant="outline"
                type="button"
                size="lg"
                className="w-full bg-gray-50"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  className="block"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                {t('continueWith')} Google
              </Button>
            </Field>

            {/* Email Form Toggle - Secondary */}
            <Collapsible open={showEmailForm} onOpenChange={setShowEmailForm}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {showEmailForm ? t('hideEmailForm') : t('continueWithEmail')}
                  {showEmailForm ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 mt-4">
                <form
                  id="signup-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                >
                  <FieldGroup>
                    <form.Field name="name">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t('fullName')}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={t('fullNamePlaceholder')}
                              aria-invalid={isInvalid}
                              autoComplete="name"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>

                    <form.Field name="email">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t('email')}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="email"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={t('emailPlaceholder')}
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
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t('password')}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="password"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={t('passwordPlaceholder')}
                              aria-invalid={isInvalid}
                              autoComplete="new-password"
                            />
                            <FieldDescription className="text-xs">
                              {t('passwordDescription')}
                            </FieldDescription>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
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
                        {form.state.isSubmitting
                          ? t('submitting')
                          : t('submit')}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CollapsibleContent>
            </Collapsible>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
