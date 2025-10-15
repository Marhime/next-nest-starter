'use server';

import { redirect } from 'next/navigation';
import { BACKEND_URL } from '../constants';
import { FormState, SignupFormSchema } from './type';

export async function signUp(
  state: FormState,
  FormData: FormData,
): Promise<FormState> {
  const validationFiels = SignupFormSchema.safeParse({
    name: FormData.get('name'),
    email: FormData.get('email'),
    password: FormData.get('password'),
    confirmPassword: FormData.get('confirm-password'),
  });

  if (!validationFiels.success) {
    const fieldErrors = validationFiels.error.flatten().fieldErrors;

    return {
      success: false,
      error: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validationFiels.data),
  });

  if (response.ok) {
    redirect('/auth/login?signup=success');
  } else
    return {
      success: false,
      message:
        response.status === 409
          ? 'User with this email already exists'
          : response.statusText || 'Something went wrong',
    };
}
