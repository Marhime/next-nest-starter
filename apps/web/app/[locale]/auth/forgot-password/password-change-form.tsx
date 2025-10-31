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
import { ResetPasswordFormSchema } from '@/lib/auth/type';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import PasswordCheck from '@/components/PasswordCheck';
import { Link } from '@/i18n/navigation';
import { useGlobalStore } from '../../store';

const PasswordChangeForm = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const t = useTranslations('LoginForm');
  const tErrors = useTranslations('Errors.LoginForm');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { passwordResetEmail, clearPasswordResetEmail } = useGlobalStore();

  const token = useSearchParams().get('token');

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: ResetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error: authError, data } = await authClient.resetPassword({
          newPassword: value.password,
          token: token || '',
        });

        if (authError) {
          setErrorMessage(authError.message || tErrors('passwordResetFailed'));
          toast.error(authError.message || tErrors('passwordResetFailed'));
          return;
        }

        // Nettoyer l'email du store après un reset réussi
        clearPasswordResetEmail?.();

        toast.success(tErrors('passwordChangeSuccess'));
        setSuccess(true);
        return data;
      } catch (err) {
        console.error('Password reset error:', err);
        setErrorMessage(tErrors('unexpectedError'));
        toast.error(tErrors('unexpectedError'));
      }
    },
  });

  if (!token) {
    return null;
  }

  if (success) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {t('passwordResetSuccessTitle')}
            </CardTitle>
            <CardDescription>
              {t('passwordResetSuccessSubtitle')}
            </CardDescription>
            {/* link to login page */}
            <Link href="/auth/login" className="text-blue-500">
              {t('login')}
            </Link>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription>
            {passwordResetEmail && (
              <span className="block text-sm font-medium text-muted-foreground mt-2">
                {t('resettingPasswordFor')}:{' '}
                <span className="font-semibold">{passwordResetEmail}</span>
              </span>
            )}
            {!passwordResetEmail && t('resetPasswordSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="change-password-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t('newPassword')}
                      </FieldLabel>
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
                        placeholder={t('newPassword')}
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
                      />
                      <PasswordCheck password={field.state.value} />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="confirmPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>
                          {t('confirmNewPassword')}
                        </FieldLabel>
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
                        placeholder={t('confirmNewPassword')}
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
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
                  {form.state.isSubmitting
                    ? t('submitting')
                    : t('resetPasswordSubmit')}
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
