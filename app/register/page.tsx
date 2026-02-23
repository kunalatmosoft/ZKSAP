import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

export const metadata = {
  title: 'Register - Crypto Auth',
  description: 'Create a secure account with cryptographic key authentication',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Crypto Auth</h1>
          <p className="text-muted-foreground">
            Passwordless security powered by cryptography
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>Your private key never leaves your device</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>We only store your public key on the server</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">✓</span>
            <span>Authentication uses challenge-response verification</span>
          </div>
        </div>
      </div>
    </main>
  );
}
