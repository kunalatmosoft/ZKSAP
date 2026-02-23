import { RecoverAccountForm } from '@/components/recover-account-form';
import Link from 'next/link';

export const metadata = {
  title: 'Recover Account - Crypto Auth',
  description: 'Recover your account using recovery phrases',
};

export default function RecoverPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* The Form Component - ensure this file has 'use client' at the top */}
        <RecoverAccountForm />

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Lost your phrases? You'll need to create a new identity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create New Account
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
/* import { RecoverAccountForm } from '@/components/recover-account-form';
import Link from 'next/link';

export const metadata = {
  title: 'Recover Account - Crypto Auth',
  description: 'Recover your account using recovery phrases',
};

export default function RecoverPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <RecoverAccountForm />

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't have recovery phrases?
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Create New Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
 */