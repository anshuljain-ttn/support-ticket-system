'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/common/error-state';
import { PageContainer } from '@/components/layout/page-container';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer
      title="Something went wrong"
      description="An unexpected error occurred while rendering this page."
    >
      <ErrorState
        message={error.message || 'Please try again or return to the dashboard.'}
        onRetry={reset}
      />
    </PageContainer>
  );
}
