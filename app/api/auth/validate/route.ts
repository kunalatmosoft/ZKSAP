import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    // 1. Basic Presence Validation
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    // 2. Retrieve session from SQLite
    // Note: your db.getSessionByToken already checks if (new Date() < expiresAt)
    const session = db.getSessionByToken(sessionToken);
    
    if (!session) {
      console.log('[Validate API] Session invalid or expired');
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    // 3. Retrieve user associated with the session
    const user = db.getUserById(session.userId);
    if (!user) {
      // If user is missing but session exists, the data is inconsistent.
      // Clean up the "orphaned" session.
      db.deleteSession(sessionToken);
      return NextResponse.json(
        { error: 'Account no longer exists' },
        { status: 404 }
      );
    }

    // 4. Return user data for the frontend state
    return NextResponse.json(
      {
        valid: true,
        userId: user.id,
        username: user.username,
        expiresAt: session.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Validate API] Error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Session validation failed due to a server error' },
      { status: 500 }
    );
  }
}
/* import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    // Retrieve session
    const session = db.getSessionByToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Retrieve user
    const user = db.getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        userId: user.id,
        username: user.username,
        expiresAt: session.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
 */