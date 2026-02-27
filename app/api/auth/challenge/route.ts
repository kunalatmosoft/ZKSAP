import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateNonce } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, publicKey } = body;

    // 1. Validation: We need at least one way to find the user
    if (!username && !publicKey) {
      return NextResponse.json(
        { error: 'Username or Public Key is required' },
        { status: 400 }
      );
    }

    let user;

    // 2. Lookup Logic
    if (publicKey) {
      // Recovery Flow: User entered 12 phrases, client derived the Public Key
      console.log('[zksap] Challenge API: Looking up user by Public Key (Recovery)');
      user = db.getUserByPublicKey(publicKey);
    } else {
      // Standard Flow: User entered their username
      console.log('[zksap] Challenge API: Looking up user by username:', username);
      user = db.getUserByUsername(username);
    }

    // 3. Handle User Not Found
    if (!user) {
      console.log('[zksap] Challenge API: User not found');
      return NextResponse.json(
        { error: 'Account not found. Please check your details or phrases.' },
        { status: 404 }
      );
    }

    // 4. Generate Challenge (Nonce)
    console.log('[zksap] Challenge API: Generating challenge for user:', user.id);
    const nonce = generateNonce();

    // 5. Store in SQLite
    const challenge = db.createChallenge(user.id, nonce);

    // 6. Return to Client
    return NextResponse.json(
      {
        challengeId: challenge.id,
        nonce: challenge.nonce,
        userId: user.id,
        // We return the username so the client knows which account they just "recovered"
        username: user.username 
      },
      { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[zksap] Challenge API error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error during challenge generation' },
      { status: 500 }
    );
  }
}

/* import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateNonce } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[zksap] Challenge API: Parsing request');
    const body = await request.json();
    const { username } = body;

    if (!username) {
      console.log('[zksap] Challenge API: Missing username');
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find user by username
    console.log('[zksap] Challenge API: Looking up user:', username);
    const user = db.getUserByUsername(username);
    if (!user) {
      console.log('[zksap] Challenge API: User not found');
      // Don't reveal if user exists (security best practice)
      return NextResponse.json(
        { error: 'Invalid username or user not found' },
        { status: 404 }
      );
    }

    // Generate random nonce (challenge)
    console.log('[zksap] Challenge API: Generating nonce');
    const nonce = generateNonce();

    // Create challenge in database
    const challenge = db.createChallenge(user.id, nonce);
    console.log('[zksap] Challenge API: Challenge created:', challenge.id);

    return NextResponse.json(
      {
        challengeId: challenge.id,
        nonce: challenge.nonce,
        userId: user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[zksap] Challenge API error:', errorMessage, error);
    return NextResponse.json(
      { error: `Failed to generate challenge: ${errorMessage}` },
      { status: 500 }
    );
  }
}
 */