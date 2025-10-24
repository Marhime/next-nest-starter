'use client';

import type {} from 'better-auth';
import { FormState, LoginFormSchema, SignupFormSchema } from './type';
import { authClient } from './auth-server';

export async function register(
  state: FormState,
  FormData: FormData,
): Promise<FormState> {
  const name = FormData.get('name') as string;
  const email = FormData.get('email') as string;
  const password = FormData.get('password') as string;

  const validationFiels = SignupFormSchema.safeParse({
    name,
    email,
    password,
  });

  if (!validationFiels.success) {
    const fieldErrors = validationFiels.error.flatten().fieldErrors;

    return {
      success: false,
      name,
      email,
      error: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  try {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      return {
        success: false,
        name,
        email,
        message: error.message || 'An error occurred during registration',
      };
    }

    // Redirection après succès
    return {
      success: true,
    };
  } catch (err) {
    console.error('Registration error:', err);
    return {
      success: false,
      name,
      email,
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

export async function login(
  state: FormState,
  FormData: FormData,
): Promise<FormState> {
  const email = FormData.get('email') as string;
  const password = FormData.get('password') as string;

  const validationFields = LoginFormSchema.safeParse({
    email,
    password,
  });

  if (!validationFields.success) {
    const fieldErrors = validationFields.error.flatten().fieldErrors;

    return {
      success: false,
      email,
      error: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  try {
    const { error } = await authClient.signIn.email({
      /**
       * The user email
       */
      email,
      /**
       * The user password
       */
      password,
      /**
       * remember the user session after the browser is closed.
       * @default true
       */
      rememberMe: true,
    });

    if (error) {
      return {
        success: false,
        email,
        message: error.message || 'An error occurred during login',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      success: false,
      email,
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}
