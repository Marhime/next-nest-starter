import z from 'zod';

export type FormState =
  | {
      error?: {
        name?: string;
        email?: string;
        password?: string;
      };
      success?: boolean;
      email?: string; // ✅ Ajouter email
      name?: string; // ✅ Ajouter name
      message?: string;
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  | undefined;

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long.')
    .max(50, 'Name must be at most 50 characters long.')
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
});

export const LoginFormSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, {
    message: 'Password field must not be empty.',
  }),
});

export const ResetPasswordFormSchema = z
  .object({
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
      .min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const EmailRequestSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }),
});

export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  USER = 'USER',
}
