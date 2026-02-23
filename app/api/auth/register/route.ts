import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, publicKey } = body;

    // 1. Validation: Ensure both fields exist
    if (!username || !publicKey) {
      return NextResponse.json(
        { error: 'Username and public key are required' },
        { status: 400 }
      );
    }

    // 2. Format Validation: Username
    if (typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // 3. Format Validation: Ed25519 Public Key (must be 64-char Hex)
    const hexRegex = /^[0-9a-fA-F]{64}$/;
    if (typeof publicKey !== 'string' || !hexRegex.test(publicKey)) {
      return NextResponse.json(
        { error: 'Invalid public key format. Expected 64-character hex.' },
        { status: 400 }
      );
    }

    // 4. Duplicate Check: Username
    const existingUser = db.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // 5. Duplicate Check: Public Key (The 12-phrase Mapping)
    // This prevents a user from creating two different usernames with the same 12 words
    const existingKeyOwner = db.getUserByPublicKey(publicKey);
    if (existingKeyOwner) {
      return NextResponse.json(
        { 
          error: 'This recovery phrase is already linked to an account.', 
          suggestion: 'Please use the Recovery page to access your existing account.' 
        }, 
        { status: 409 }
      );
    }

    // 6. Create User in SQLite
    // The public key is stored as a raw hex string for fast indexing
    const user = db.createUser(username.trim(), publicKey);

    // 7. Create Session
    const sessionToken = generateSessionToken();
    db.createSession(user.id, sessionToken);

    console.log(`[Register API] Success: User ${username} registered with Public Key ${publicKey.substring(0, 8)}...`);

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        username: user.username,
        sessionToken,
        message: 'Registration successful. Secure your phrases immediately.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
/* import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Register API: Parsing request body');
    const body = await request.json();
    const { username, publicKey } = body;

    // 1. Basic Presence Validation
    if (!username || !publicKey) {
      return NextResponse.json(
        { error: 'Username and public key are required' },
        { status: 400 }
      );
    }

    // 2. Username Format Validation
    if (typeof username !== 'string' || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // 3. Ed25519 Public Key Validation (Hex String)
    // Ed25519 public keys are 32 bytes, which equals 64 hex characters
    const hexRegex = /^[0-9a-fA-F]{64}$/;
    if (typeof publicKey !== 'string' || !hexRegex.test(publicKey)) {
      console.log('[v0] Register API: Invalid hex format for Ed25519 key');
      return NextResponse.json(
        { error: 'Invalid public key format. Expected a 64-character hex string.' },
        { status: 400 }
      );
    }

    // 4. Check if User or Public Key already exists
    // (We check publicKey too to prevent multiple accounts per 12-phrase set)
    const existingUser = db.getUserByUsername(username);
    const existingKey = db.getUserByPublicKey(publicKey);

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    
    if (existingKey) {
      return NextResponse.json(
        { error: 'This recovery phrase is already linked to an account. Use Recovery instead.' },
        { status: 409 }
      );
    }

    // 5. Create user in SQLite
    // We store the publicKey directly as a string, no need for JSON.stringify()
    console.log('[v0] Register API: Creating user');
    const user = db.createUser(username, publicKey);

    // 6. Create Initial Session
    const sessionToken = generateSessionToken();
    db.createSession(user.id, sessionToken);

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        username: user.username,
        sessionToken,
        message: 'Registration successful. Please save your 12 phrases safely.',
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Register API error:', errorMessage);
    return NextResponse.json(
      { error: 'Registration failed due to server error' },
      { status: 500 }
    );
  }
} */
/* import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken } from '@/lib/crypto-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Register API: Parsing request body');
    const body = await request.json();
    const { username, publicKey } = body;

    console.log('[v0] Register API: Received username:', username, 'Public key exists:', !!publicKey);

    if (!username || !publicKey) {
      console.log('[v0] Register API: Missing username or publicKey');
      return NextResponse.json(
        { error: 'Username and public key are required' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string' || username.length < 3) {
      console.log('[v0] Register API: Invalid username format');
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.getUserByUsername(username);
    if (existingUser) {
      console.log('[v0] Register API: Username already exists');
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Validate public key format (should be a valid JWK)
    console.log('[v0] Register API: Validating public key format', {
      kty: publicKey.kty,
      n: !!publicKey.n,
      e: !!publicKey.e,
    });

    if (!publicKey.kty || !publicKey.n || !publicKey.e) {
      console.log('[v0] Register API: Invalid public key format');
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      );
    }

    // Create user with public key
    console.log('[v0] Register API: Creating user with public key');
    const user = db.createUser(username, JSON.stringify(publicKey));
    console.log('[v0] Register API: User created:', user.id);

    const sessionToken = generateSessionToken();
    const session = db.createSession(user.id, sessionToken);
    console.log('[v0] Register API: Session created');

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        username: user.username,
        sessionToken,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Register API error:', errorMessage, error);
    return NextResponse.json(
      { error: `Registration failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
 */