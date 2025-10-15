import z from 'zod';

export type FormState =
  | {
      error?: {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      };
      success?: boolean;
      message?: string;
    }
  | undefined;

export const SignupFormSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: 'Name must be at least 2 characters long.',
      })
      .trim(),
    email: z.email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(8, { message: 'Be at least 8 characters long' })
      .regex(/[a-zA-Z]/, {
        message: 'Contain at least one letter.',
      })
      .regex(/[0-9]/, {
        message: 'Contain at least one number.',
      })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Contain at least one special character.',
      })
      .trim(),
    confirmPassword: z
      .string()
      .min(1, { message: 'Confirm Password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LoginFormSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, {
    message: 'Password field must not be empty.',
  }),
});

export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  USER = 'USER',
}
