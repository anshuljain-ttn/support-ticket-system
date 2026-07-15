'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Ticket } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ApiClientError } from '@/services/api-client';
import { loginFormSchema, type LoginFormValues } from '@/schemas/auth.schema';

const inputClassName =
  'h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm outline-none backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login(values);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to sign in. Please try again.';
      setFormError(message);
    }
  });

  const nextPath = searchParams.get('next');

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-md">
            <Ticket className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage support tickets
            {nextPath ? ' and continue where you left off' : ''}.
          </p>
        </div>

        <form
          className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur-md"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClassName}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClassName}
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password?.message ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
