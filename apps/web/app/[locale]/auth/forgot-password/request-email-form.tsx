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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { useForm } from '@tanstack/react-form';
import { EmailRequestSchema } from '@/lib/auth/type';
import { toast } from 'sonner';
import { useGlobalStore } from '../../store';

const PasswordChangeForm = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const t = useTranslations('LoginForm');
  const tErrors = useTranslations('Errors.LoginForm');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { setPasswordResetEmail, passwordResetEmail } = useGlobalStore();

  const form = useForm({
    defaultValues: {
      email: passwordResetEmail || '',
    },
    validators: {
      onSubmit: EmailRequestSchema,
    },
    onSubmit: async ({ value }) => {
      const resetPromise = authClient
        .requestPasswordReset({
          email: value.email,
        })
        .then(({ data, error }) => {
          if (error) {
            setErrorMessage(error.message || tErrors('requestFailed'));
            throw new Error(error.message || tErrors('requestFailed'));
          }

          // Sauvegarder l'email dans le store pour une meilleure UX
          setPasswordResetEmail?.(value.email);
          setSuccess(true);
          return data;
        });

      try {
        const data = await toast.promise(resetPromise, {
          loading: tErrors('sendingEmail') || 'Envoi...',
          success: tErrors('passwordResetSuccess'),
          error: (err) => err?.message || tErrors('requestFailed'),
        });

        return data;
      } catch (err) {
        console.error('Request error:', err);
      }
    },
  });

  if (success) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('mailSentTitle')}</CardTitle>
            <CardDescription>{t('mailSentSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            {/* resend email link */}
            <Button
              onClick={() => {
                setSuccess(false);
              }}
              className="w-full"
            >
              {t('resendEmail')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('requestResetTitle')}</CardTitle>
          <CardDescription>{t('requestResetSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="email-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
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
                        placeholder={t('email')}
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

              <Field>
                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                  className="w-full"
                >
                  {form.state.isSubmitting
                    ? t('submitting')
                    : t('sendResetLink')}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordChangeForm;
