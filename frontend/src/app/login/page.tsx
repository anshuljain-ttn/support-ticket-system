import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={4} />}>
      <LoginForm />
    </Suspense>
  );
}
