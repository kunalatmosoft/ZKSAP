'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

// ✅ Fix: Use the correct client-side crypto file
import { 
  recoverIdentityFromMnemonic, 
  storeIdentity, 
  signChallenge 
} from '@/lib/crypto';

// ✅ Fix: Import the store utility to persist phrases on the new device
import { storeRecoveryPhrases } from '@/lib/recovery-phrases';

export function RecoverAccountForm() {
  const router = useRouter();
  const [mnemonicText, setMnemonicText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('processing');

    try {
      // Basic sanitization
      const mnemonic = mnemonicText.trim().toLowerCase();
      
      // 1. RE-DERIVE IDENTITY
      // Generates the deterministic Ed25519 keys from the 12 words
      const identity = await recoverIdentityFromMnemonic(mnemonic);

      // 2. FIND USER BY PUBLIC KEY
      const challengeReq = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: identity.publicKey }),
      });

      if (!challengeReq.ok) {
        throw new Error('No account found for these recovery phrases.');
      }

      const { challengeId, nonce, userId, username } = await challengeReq.json();

      // 3. SIGN CHALLENGE
      const signature = await signChallenge(identity.privateKey, nonce);

      const verifyReq = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature, userId }),
      });

      if (!verifyReq.ok) {
        throw new Error('Identity verification failed. Please try again.');
      }

      const verifyData = await verifyReq.json();

      // 4. SYNC LOCAL STORES
      // Save keys to IndexedDB
      await storeIdentity(username, identity);
      
      // ✅ Fix: Save phrases to LocalStorage so Dashboard can show them
      // We split the mnemonic back into an array to match your Dashboard's expected format
      const phraseArray = mnemonic.split(/\s+/);
      storeRecoveryPhrases(username, phraseArray);

      // Save session
      localStorage.setItem('sessionToken', verifyData.sessionToken);
      localStorage.setItem('username', username);
      
      setStep('success');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-500" />
          <CardTitle>Recover Account</CardTitle>
        </div>
        <CardDescription>
          Enter your 12-word secret phrase to restore your account access on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'input' && (
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Recovery Phrases</label>
              <Textarea
                placeholder="Ex: apple banana cherry..."
                value={mnemonicText}
                onChange={(e) => setMnemonicText(e.target.value)}
                className="min-h-[120px] font-mono text-sm resize-none focus:ring-blue-500"
                required
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Recover Identity'}
            </Button>
          </form>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <p className="font-medium">Searching for account...</p>
            <p className="text-sm text-muted-foreground">This only takes a moment.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-bold text-lg">Identity Restored!</p>
            <p className="text-sm text-muted-foreground">Welcome back, @{localStorage.getItem('username')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
/* 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

// Use the new deterministic crypto utilities
import { 
  recoverIdentityFromMnemonic, 
  storeIdentity, 
  signChallenge 
} from '@/lib/crypto';

export function RecoverAccountForm() {
  const router = useRouter();
  const [mnemonicText, setMnemonicText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('processing');

    try {
      const mnemonic = mnemonicText.trim().toLowerCase();
      
      // 1. RE-DERIVE IDENTITY
      // This generates the SAME publicKey and privateKey from the 12 words
      const identity = await recoverIdentityFromMnemonic(mnemonic);

      // 2. FIND USER BY PUBLIC KEY
      // We send the publicKey to the server to see which username it belongs to
      const challengeReq = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: identity.publicKey }),
      });

      if (!challengeReq.ok) {
        throw new Error('No account found for these recovery phrases.');
      }

      const { challengeId, nonce, userId, username } = await challengeReq.json();

      // 3. SIGN CHALLENGE TO PROVE OWNERSHIP
      // Even if someone found the phrases, this proves we can sign with them
      const signature = await signChallenge(identity.privateKey, nonce);

      const verifyReq = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature, userId }),
      });

      if (!verifyReq.ok) {
        throw new Error('Identity verification failed. Please try again.');
      }

      const verifyData = await verifyReq.json();

      // 4. STORE LOCALLY ON THIS DEVICE
      // We save the identity (keys) and the session token
      await storeIdentity(username, identity);
      localStorage.setItem('sessionToken', verifyData.sessionToken);
      localStorage.setItem('username', username);
      
      setStep('success');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-500" />
          <CardTitle>Recover Account</CardTitle>
        </div>
        <CardDescription>
          Enter your 12-word secret phrase to restore your account access on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'input' && (
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recovery Phrases</label>
              <Textarea
                placeholder="Ex: apple banana cherry..."
                value={mnemonicText}
                onChange={(e) => setMnemonicText(e.target.value)}
                className="min-h-[120px] font-mono text-sm resize-none focus:ring-blue-500"
                required
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Recover Identity'}
            </Button>
          </form>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <p className="font-medium">Searching for account...</p>
            <p className="text-sm text-muted-foreground">Reconstructing your cryptographic keys.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-bold text-lg">Identity Restored!</p>
            <p className="text-sm text-muted-foreground">We found your account. Redirecting you to the dashboard...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} */