import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySignature, generateSessionToken } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, signature, userId } = body;

    // 1. Validation
    if (!challengeId || !signature || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Lookup Challenge from SQLite
    const challenge = db.getChallenge(challengeId);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 });
    }

    // 3. Match User ID
    if (challenge.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID mismatch' }, { status: 403 });
    }

    // 4. Retrieve User Public Key (Stored as HEX in SQLite)
    const user = db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // --- DEBUG LOGS FOR SIGNATURE FAILURE ---
    console.log('[Verify API] Debug Info:');
    console.log(' - Stored Public Key (Hex):', user.publicKey);
    console.log(' - Challenge Nonce:', challenge.nonce);
    console.log(' - Received Signature (Hex):', signature);

    // 5. Verify the Ed25519 Signature
    // Ensure verifySignature treats challenge.nonce as the raw message signed by the client
    const isValid = verifySignature(user.publicKey, challenge.nonce, signature);

    if (!isValid) {
      console.error('[Verify API] CRYPTO FAILURE: Signature does not match Public Key');
      return NextResponse.json({ error: 'Invalid cryptographic signature' }, { status: 401 });
    }

    // 6. Success Logic
    console.log('[Verify API] Success: Identity verified for', user.username);
    
    // Crucial: Delete challenge immediately to prevent Replay Attacks
    db.deleteChallenge(challengeId);

    const sessionToken = generateSessionToken();
    db.createSession(user.id, sessionToken);

    return NextResponse.json({
      success: true,
      sessionToken,
      user: { id: user.id, username: user.username },
      message: 'Logged in successfully',
    });

  } catch (error) {
    console.error('[Verify API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySignature, generateSessionToken } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Verify API: Parsing request');
    const body = await request.json();
    const { challengeId, signature, userId } = body;

    if (!challengeId || !signature || !userId) {
      console.log('[v0] Verify API: Missing required fields');
      return NextResponse.json(
        { error: 'Challenge ID, signature, and user ID are required' },
        { status: 400 }
      );
    }

    // Retrieve the challenge
    console.log('[v0] Verify API: Looking up challenge:', challengeId);
    const challenge = db.getChallenge(challengeId);
    if (!challenge) {
      console.log('[v0] Verify API: Challenge not found or expired');
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      );
    }

    // Verify user ID matches
    if (challenge.userId !== userId) {
      console.log('[v0] Verify API: User ID mismatch');
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 400 }
      );
    }

    // Retrieve user
    console.log('[v0] Verify API: Looking up user:', userId);
    const user = db.getUserById(userId);
    if (!user) {
      console.log('[v0] Verify API: User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse public key
    let publicKeyJwk: JsonWebKey;
    try {
      publicKeyJwk = JSON.parse(user.publicKey);
      console.log('[v0] Verify API: Public key parsed');
    } catch {
      console.log('[v0] Verify API: Invalid stored public key');
      return NextResponse.json(
        { error: 'Invalid stored public key' },
        { status: 500 }
      );
    }

    // Verify the signature
    console.log('[v0] Verify API: Verifying signature');
    const isValid = verifySignature(publicKeyJwk, challenge.nonce, signature);

    if (!isValid) {
      console.log('[v0] Verify API: Signature verification failed');
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    console.log('[v0] Verify API: Signature valid');
    // Delete used challenge
    db.deleteChallenge(challengeId);

    // Create session
    const sessionToken = generateSessionToken();
    const session = db.createSession(user.id, sessionToken);
    console.log('[v0] Verify API: Session created');

    return NextResponse.json(
      {
        success: true,
        sessionToken,
        userId: user.id,
        username: user.username,
        message: 'Authentication successful',
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Verify API error:', errorMessage, error);
    return NextResponse.json(
      { error: `Verification failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
 */