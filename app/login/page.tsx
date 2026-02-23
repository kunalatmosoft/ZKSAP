import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export const metadata = {
  title: 'Login - Crypto Auth',
  description: 'Login with your cryptographic key',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Crypto Auth</h1>
          <p className="text-muted-foreground">
            Passwordless security powered by cryptography
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent hover:underline font-medium">
              Register here
            </Link>
          </p>
          <p className="text-muted-foreground">
            Lost access to this device?{' '}
            <Link href="/recover" className="text-accent hover:underline font-medium">
              Use recovery phrases
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>No passwords to remember or reset</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>Resistant to phishing and database breaches</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>Your device is the only authentication factor needed</span>
          </div>
        </div>
      </div>
    </main>
  );
}
