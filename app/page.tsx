'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Key, Shield, Zap, Github, ArrowRight } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">Crypto Auth</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Passwordless Security Powered by Cryptography
              </h1>
              <p className="text-xl text-muted-foreground mt-4">
                Your keys stay with you. We never see your private key. No passwords. No databases full of credentials to breach.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required. Start securing your account in seconds.
            </p>
          </div>

          {/* Right Column - Feature Highlights */}
          <div className="space-y-4">
            <Card className="border-0 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">No Password Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    We never store passwords. Only public keys exist on servers.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-0 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Key className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Your Keys, Your Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Private keys are generated and stored securely on your device.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-0 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Breach Resistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Database breaches don't compromise user credentials.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-0 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Challenge-Response Auth</h3>
                  <p className="text-sm text-muted-foreground">
                    Unique nonce verification prevents replay attacks.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold tracking-tight text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to secure authentication with cryptography
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Key Generation',
                description:
                  'Your device generates a unique RSA-2048 key pair. Your private key never leaves your device.',
              },
              {
                number: '02',
                title: 'Challenge Received',
                description:
                  'During login, the server sends a random challenge (nonce). You sign it with your private key.',
              },
              {
                number: '03',
                title: 'Verified & Authenticated',
                description:
                  'Server verifies your signature using your public key. Success means you own the private key.',
              },
            ].map((step, index) => (
              <div key={index} className="space-y-4">
                <div className="text-5xl font-bold text-accent/30 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold tracking-tight text-center mb-4">
          Security Features
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Enterprise-grade security for every user
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'RSA-PSS Signing', description: 'Industry-standard 2048-bit RSA encryption' },
            { title: 'IndexedDB Storage', description: 'Private keys stored securely on your device' },
            { title: 'Nonce Verification', description: 'Unique challenges prevent replay attacks' },
            { title: 'Session Tokens', description: '24-hour authenticated sessions' },
            { title: 'No Passwords', description: 'Zero password-related security risks' },
            { title: 'Phishing Resistant', description: 'Cryptographic proof of identity' },
          ].map((feature, index) => (
            <Card key={index} className="border-0 p-6">
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Ready to go passwordless?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the cryptographic authentication revolution. Start in seconds.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              Create Your Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Lock className="w-5 h-5 text-accent" />
              <span className="font-semibold">Crypto Auth</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              A demonstration of passwordless authentication using cryptographic keys.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
