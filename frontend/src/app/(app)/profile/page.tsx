'use client';

import { PageContainer } from '@/components/layout/page-container';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/format';
import { UserRoles } from '@/types/user.types';

function formatRole(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <PageContainer title="Profile" description="Your account details and role.">
      <div className="max-w-2xl space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" className="size-16 rounded-full object-cover" />
              ) : (
                user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd className="font-medium">{formatRole(user.role)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="font-medium">{user.isActive ? 'Active' : 'Inactive'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Member since</dt>
              <dd className="font-medium">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">User ID</dt>
              <dd className="font-mono text-sm">{user._id}</dd>
            </div>
          </dl>
        </section>

        {user.role === UserRoles.SUPER_ADMIN ? (
          <p className="text-sm text-muted-foreground">
            Super admins have full visibility across users and tickets.
          </p>
        ) : null}
      </div>
    </PageContainer>
  );
}
