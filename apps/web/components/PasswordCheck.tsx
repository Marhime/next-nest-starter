'use client';
import React, { useState, useEffect } from 'react';
import { FieldDescription } from './ui/field';
import { useTranslations } from 'next-intl';

interface PasswordCriteria {
  test: boolean;
  message: string;
}

interface PasswordCheckProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

const PasswordCheck = ({
  password,
  onValidationChange,
}: PasswordCheckProps) => {
  const t = useTranslations('LoginForm.passwordCriteria');
  const [passwordCheckError, setPasswordCheckError] = useState<
    PasswordCriteria[]
  >([]);

  const validatePassword = React.useCallback(() => {
    const capitalCriteria = /[A-Z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const lengthCriteria = password.length >= 8;

    const criterias = [
      {
        test: lengthCriteria,
        message: t('length'),
      },
      {
        test: capitalCriteria,
        message: t('uppercase'),
      },
      {
        test: numberCriteria,
        message: t('number'),
      },
      {
        test: specialCriteria,
        message: t('special'),
      },
    ];
    setPasswordCheckError(criterias);

    // when all criterias are met, clear the error
    const allCriteriaMet = criterias.every((criteria) => criteria.test);

    if (allCriteriaMet) {
      setPasswordCheckError([
        {
          test: true,
          message: t('allMet'),
        },
      ]);
      onValidationChange?.(true);
    } else {
      onValidationChange?.(false);
    }
  }, [password, t, onValidationChange]);

  useEffect(() => {
    validatePassword();
  }, [validatePassword]);

  return (
    <FieldDescription>
      {passwordCheckError.map((criteria, index) => (
        <span
          key={index}
          className={`flex items-center gap-2 ${criteria.test ? 'text-green-700' : 'text-destructive'} mr-2`}
        >
          {!criteria.test ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              aria-label="Règle non acceptée"
              role="img"
              focusable="false"
              className="size-2.5 fill-current"
            >
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3 4L8 7 5 4 4 5l3 3-3 3 1 1 3-3 3 3 1-1-3-3 3-3-1-1z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              aria-label="Règle acceptée"
              role="img"
              focusable="false"
              className="size-2.5 fill-current"
            >
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.16 4.87L6.67 9.36 4.42 7.1 3.29 8.23l3.38 3.38L12.29 6z"></path>
            </svg>
          )}
          <span className="block text-xs">{criteria.message}</span>
        </span>
      ))}
    </FieldDescription>
  );
};

export default PasswordCheck;
