'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCryptoAuth } from '@/hooks/use-crypto-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'input' | 'signing' | 'success'>('input');
  const { login, error, loading } = useCryptoAuth();
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username.trim()) return;

  setStep('signing'); // UI goes to loading screen
  
  try {
    const success = await login(username);
    if (success) {
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      // If login returns false, we MUST go back to 'input'
      setStep('input');
    }
  } catch (err) {
    setStep('input');
  }
};
  return (
    <Card className="w-full max-w-md border-0">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-accent" />
          <CardTitle>Login</CardTitle>
        </div>
        <CardDescription>
          Prove you own your private key without revealing it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="bg-input"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing Challenge...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We'll send you a challenge that you sign with your private key to prove you own it.
            </p>
          </form>
        )}

        {step === 'signing' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 flex items-center justify-center bg-accent/10 rounded-full">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            </div>
            <div>
              <p className="font-semibold">Verifying Identity</p>
              <p className="text-sm text-muted-foreground mt-2">
                Using your private key to prove ownership...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 flex items-center justify-center bg-accent/10 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div>
              <p className="font-semibold">Authentication Successful</p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
