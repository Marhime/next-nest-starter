'use client';
import React, { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from './ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group';
import { EyeIcon, EyeOff } from 'lucide-react';

interface PasswordCriteria {
  test: boolean;
  message: string;
}

const PasswordCheck = ({
  setPasswordChecked,
}: {
  setPasswordChecked: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [passwordCheckError, setPasswordCheckError] = useState<
    PasswordCriteria[]
  >([]);

  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  const validatePassword = () => {
    if (!passwordInputRef.current) {
      return;
    }

    const password = passwordInputRef.current?.value;
    const capitalCriteria = /[A-Z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const lengthCriteria = password.length >= 8;

    const criterias = [
      {
        test: lengthCriteria,
        message: 'At least 8 characters long',
      },
      {
        test: capitalCriteria,
        message: 'At least one uppercase letter',
      },
      {
        test: numberCriteria,
        message: 'At least one number',
      },
      {
        test: specialCriteria,
        message: 'At least one special character',
      },
    ];
    setPasswordCheckError(criterias);

    // when all criterias are met, clear the error
    const allCriteriaMet = criterias.every((criteria) => criteria.test);

    if (allCriteriaMet) {
      setPasswordCheckError([
        {
          test: true,
          message: 'Password meets all criteria',
        },
      ]);
      setPasswordChecked(true);
    } else {
      setPasswordChecked(false);
    }
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <Field className="relative">
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <InputGroup>
          <InputGroupInput
            ref={passwordInputRef}
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Password"
            id="password"
            name="password"
            onFocus={validatePassword}
            onChange={validatePassword}
            required
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              title={passwordVisible ? 'Hide password' : 'Show password'}
              size="icon-xs"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff /> : <EyeIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>
          {passwordCheckError.map((criteria, index) => {
            console.log({ criteria });
            return (
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
            );
          })}
        </FieldDescription>
      </Field>
    </>
  );
};

export default PasswordCheck;
