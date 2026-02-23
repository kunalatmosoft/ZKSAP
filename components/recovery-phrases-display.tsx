'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RecoveryPhrasesDisplayProps {
  phrases: string[];
  username: string;
  onContinue: () => void;
}

export function RecoveryPhrasesDisplay({
  phrases,
  username,
  onContinue,
}: RecoveryPhrasesDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopyPhrases = () => {
    const phrasesText = phrases.join(' ');
    navigator.clipboard.writeText(phrasesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPhrases = () => {
    const phrasesText = phrases.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(phrasesText));
    element.setAttribute('download', `recovery-phrases-${username}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Save Your Recovery Phrases</h1>
            <p className="text-muted-foreground">
              These 12 words can recover your account if you lose access to this device
            </p>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm text-destructive font-semibold">
              ⚠️ Never share these phrases with anyone. Store them safely offline.
            </p>
          </div>

          {/* Recovery Phrases Display */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <div className="grid grid-cols-3 gap-3">
              {phrases.map((phrase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {phrase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCopyPhrases}
              variant="outline"
              className="flex-1"
            >
              {copied ? '✓ Copied' : 'Copy Phrases'}
            </Button>
            <Button
              onClick={handleDownloadPhrases}
              variant="outline"
              className="flex-1"
            >
              Download
            </Button>
          </div>

          {/* Acknowledgment */}
          <div className="border-t pt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border bg-background cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                I have securely saved my recovery phrases and understand they cannot be recovered if lost
              </span>
            </label>

            <Button
              onClick={onContinue}
              disabled={!acknowledged}
              className="w-full"
              size="lg"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
