'use client';

import { signIn } from 'next-auth/react';
// import { AuthError } from 'next-auth/errors';

// ...

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    console.log(formData)
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.get('id'),
      password: formData.get('password'),
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
 console.log(error)
    if (error instanceof Error) {
      switch (error.message) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}