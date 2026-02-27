import { NextRequest, NextResponse } from 'next/server';
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

    // 1. Check if the session exists in SQLite before deleting
    // This helps verify if the user was actually logged in
    const session = db.getSessionByToken(sessionToken);
    
    if (!session) {
      console.log('[zksap] Logout API: Session not found or already expired');
      return NextResponse.json(
        { success: true, message: 'Session already cleared' },
        { status: 200 }
      );
    }

    // 2. Perform the deletion in the database
    console.log('[zksap] Logout API: Deleting session for user:', session.userId);
    db.deleteSession(sessionToken);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[zksap] Logout API error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}