'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCryptoAuth } from '@/hooks/use-crypto-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecoveryPhrasesDisplay } from './recovery-phrases-display';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
// Import the getter from your utility
import { getRecoveryPhrases } from '@/lib/recovery-phrases';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'input' | 'generating' | 'recovery' | 'success'>('input');
  const [recoveryPhrases, setRecoveryPhrases] = useState<string[]>([]);
  const { register, error, loading } = useCryptoAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStep('generating');
    
    // Register generates the mnemonic AND saves it to local storage internally
    const success = await register(username);

    if (success) {
      // ✅ FIX: Use the specific utility to get the phrases mapped to this username
      const phrases = getRecoveryPhrases(username);
      
      if (phrases) {
        setRecoveryPhrases(phrases);
        setStep('recovery');
      } else {
        // Fallback if storage failed
        setStep('success');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } else {
      setStep('input');
    }
  };

  const handleRecoveryConfirmed = () => {
    setStep('success');
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (step === 'recovery' && recoveryPhrases.length > 0) {
    return (
      <RecoveryPhrasesDisplay
        phrases={recoveryPhrases}
        username={username}
        onContinue={handleRecoveryConfirmed}
      />
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
           <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
           </div>
        </div>
        <CardTitle className="text-2xl">Create Identity</CardTitle>
        <CardDescription>
          No passwords. Just pure cryptography.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold ml-1">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                minLength={3}
                required
                className="h-12 focus-visible:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={!username.trim() || username.length < 3 || loading}
              className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Identity'
              )}
            </Button>
          </form>
        )}

        {step === 'generating' && (
          <div className="space-y-4 text-center py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <p className="font-bold text-lg">Creating Secure Keys</p>
              <p className="text-sm text-muted-foreground mt-2">
                Deriving your <strong>Ed25519</strong> identity from a random 128-bit seed.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-bold text-lg">Setup Complete!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to your secure dashboard...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}