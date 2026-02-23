'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCryptoAuth } from '@/hooks/use-crypto-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecoveryPhrases } from '@/lib/recovery-phrases';
import {
  LogOut, Key, Shield, Lock, Zap, Database, AlertCircle, RotateCcw, Copy, Check,
} from 'lucide-react';

export function Dashboard() {
  const router = useRouter();
  const { user, logout, loading } = useCryptoAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [recoveryPhrases, setRecoveryPhrases] = useState<string[] | null>(null);
  const [showRecoveryPhrases, setShowRecoveryPhrases] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else {
      // Fetching from your local recovery-phrases utility
      const phrases = getRecoveryPhrases(user.username);
      setRecoveryPhrases(phrases || null);
    }
  }, [loading, user, router]);

  const copyToClipboard = async () => {
    if (!recoveryPhrases) return;
    const fullPhrase = recoveryPhrases.join(' ');
    await navigator.clipboard.writeText(fullPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Syncing identity...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Secure Dashboard</h1>
            <p className="text-muted-foreground font-mono text-sm">Identified as: @{user.username}</p>
          </div>
          <div>
            {!showLogoutConfirm ? (
              <Button onClick={() => setShowLogoutConfirm(true)} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleLogout} variant="destructive" size="sm" disabled={isLoggingOut}>
                  Confirm
                </Button>
                <Button onClick={() => setShowLogoutConfirm(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Phrases Card */}
        {recoveryPhrases && (
          <Card className="border-primary/20 bg-primary/5 mb-8 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Master Recovery Phrase</CardTitle>
                </div>
                {showRecoveryPhrases && (
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2">{copied ? 'Copied' : 'Copy All'}</span>
                  </Button>
                )}
              </div>
              <CardDescription>
                These 12 words allow you to recover your account on any new device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showRecoveryPhrases ? (
                <Button onClick={() => setShowRecoveryPhrases(true)} variant="default" className="w-full">
                  Reveal Recovery Phrases
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {recoveryPhrases.map((phrase, idx) => (
                      <div key={idx} className="bg-background border border-primary/10 p-2 rounded-md flex items-center gap-2 shadow-sm">
                        <span className="text-[10px] text-muted-foreground w-4">{idx + 1}</span>
                        <span className="text-sm font-mono font-medium">{phrase}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setShowRecoveryPhrases(false)} variant="outline" className="w-full text-xs">
                    Hide Sensitive Phrases
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Security Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-semibold text-green-600">Ed25519 (Edwards Curve)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-semibold">SQLite (Persistent)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Key Location</span>
                <span className="font-semibold text-primary">Local IndexedDB</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Active Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-muted rounded text-[10px] font-mono break-all border">
                TOKEN: {user.sessionToken}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
             <Lock className="w-5 h-5 text-primary mb-2" />
             <h4 className="font-bold text-sm mb-1">Zero-Knowledge</h4>
             <p className="text-xs text-muted-foreground">The server never sees your 12 phrases or your private key.</p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
             <Zap className="w-5 h-5 text-primary mb-2" />
             <h4 className="font-bold text-sm mb-1">Deterministic</h4>
             <p className="text-xs text-muted-foreground">Your 12 words will always generate the same unique identity.</p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
             <Database className="w-5 h-5 text-primary mb-2" />
             <h4 className="font-bold text-sm mb-1">SQLite Storage</h4>
             <p className="text-xs text-muted-foreground">Sessions and challenges are stored in a persistent server database.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
/* 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCryptoAuth } from '@/hooks/use-crypto-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecoveryPhrases } from '@/lib/recovery-phrases';
import {
  LogOut, Key, Shield, Lock, Zap, Database, AlertCircle, RotateCcw,
} from 'lucide-react';

export function Dashboard() {
  const router = useRouter();
  const { user, logout, loading } = useCryptoAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [recoveryPhrases, setRecoveryPhrases] = useState<string[] | null>(null);
  const [showRecoveryPhrases, setShowRecoveryPhrases] = useState(false);

  useEffect(() => {
    // Only decide once loading is finished
    if (loading) return;

    // If we finished loading and there's still no user → definitely redirect
    if (!user) {
      router.replace('/login'); // replace → cleaner history, avoids back-button issues
    } else {
      // Load recovery phrases for this user
const phrases = getRecoveryPhrases(user.username);
    // If phrases is null, the card won't show. 
    // Let's ensure we at least see the state.
    setRecoveryPhrases(phrases || null); 
    
    if (!phrases) {
      console.warn(`No recovery phrases found for user: ${user.username}`);
    }
  }
  }, [loading, user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout failed', err);
      // Optionally show error to user
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ────────────────────────────────────────────────
  // Show loading state **only while actually loading**
  // Once loading=false we either have user or we already redirected
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // At this point we know: !loading && user exists (else we redirected)
  // But we still guard with early return just to satisfy TypeScript
  if (!user) {
    return null; // or a minimal fallback — should never reach here
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        {/* Header 
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
          <div>
            {!showLogoutConfirm ? (
              <Button
                onClick={() => setShowLogoutConfirm(true)}
                variant="outline"
                size="sm"
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                  disabled={isLoggingOut}
                >
                  Confirm Logout
                </Button>
                <Button
                  onClick={() => setShowLogoutConfirm(false)}
                  variant="outline"
                  size="sm"
                  disabled={isLoggingOut}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Phrases Alert 
        {recoveryPhrases && (
          <Card className="border-0 mb-8 border border-accent/20 bg-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg">Recovery Phrases</CardTitle>
                </div>
              </div>
              <CardDescription>
                Keep these safe for account recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showRecoveryPhrases ? (
                <Button
                  onClick={() => setShowRecoveryPhrases(true)}
                  variant="outline"
                  size="sm"
                >
                  View Recovery Phrases
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
                    <p className="text-xs text-destructive font-semibold">
                      ⚠️ Never share these with anyone
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {recoveryPhrases.map((phrase, idx) => (
                      <div key={idx} className="bg-muted p-2 rounded flex items-center gap-2">
                        <span className="text-muted-foreground font-semibold w-4">{idx + 1}.</span>
                        <span>{phrase}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowRecoveryPhrases(false)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Hide Recovery Phrases
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Security Status 
          <Card className="border-0">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-accent" />
                <CardTitle>Security Status</CardTitle>
              </div>
              <CardDescription>Your authentication is secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm">RSA-PSS 2048-bit encryption</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm">Private key stored locally</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm">Challenge-response authentication</span>
              </div>
            </CardContent>
          </Card>

          {/* Session Info 
          <Card className="border-0">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-accent" />
                <CardTitle>Session Info</CardTitle>
              </div>
              <CardDescription>Your current authentication session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                  {user.id}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Session Token (first 32 chars)</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {user.sessionToken?.substring(0, 32) ?? '—'}...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works 
        <Card className="border-0 mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-accent" />
              <CardTitle>How Crypto Auth Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="flex w-6 h-6 items-center justify-center rounded-full bg-accent text-background text-xs font-bold">
                    1
                  </span>
                  Key Generation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your device generates a unique RSA key pair. The private key stays with you.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="flex w-6 h-6 items-center justify-center rounded-full bg-accent text-background text-xs font-bold">
                    2
                  </span>
                  Challenge-Response
                </h3>
                <p className="text-sm text-muted-foreground">
                  Server sends a random nonce. You sign it with your private key to prove ownership.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="flex w-6 h-6 items-center justify-center rounded-full bg-accent text-background text-xs font-bold">
                    3
                  </span>
                  Verification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Server verifies your signature using your public key. No password needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features 
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-accent" />
              <CardTitle>Security Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <Database className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">No Password Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Servers never store passwords. Only public keys are kept.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Replay Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Each challenge is unique and expires after use.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Breach Resistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Database breaches won't compromise user credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Key className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Device-Based Auth</h3>
                  <p className="text-sm text-muted-foreground">
                    Private keys are secured on your device using IndexedDB.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
 */