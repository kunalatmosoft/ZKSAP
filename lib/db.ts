import DatabaseConstructor, { Database as SqliteInstance } from 'better-sqlite3';
import path from 'path';

export interface User {
  id: string;
  username: string;
  publicKey: string; // This stores the Hex-encoded Ed25519 Public Key
  createdAt: string;
}

export interface Challenge {
  id: string;
  userId: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

class Database {
  private db: SqliteInstance;

  constructor(dbPath: string = 'auth.db') {
    // Ensuring the path is absolute for consistency in Node environments
    this.db = new DatabaseConstructor(path.resolve(process.cwd(), dbPath));
    this.init();
  }

  private init() {
    // Foreign keys are enabled by default in better-sqlite3, but let's be explicit
    this.db.pragma('foreign_keys = ON');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        publicKey TEXT UNIQUE NOT NULL, -- UNIQUE index is crucial for recovery lookups
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        nonce TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  // --- User Operations ---

createUser(username: string, publicKey: string): User {
  const id = `user_${Date.now()}`;
  const user: User = { id, username, publicKey, createdAt: new Date().toISOString() };
  
  const stmt = this.db.prepare('INSERT INTO users (id, username, publicKey, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(user.id, user.username, user.publicKey, user.createdAt);
  
  return user;
}

  getUserByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return (stmt.get(username) as User) || null;
  }

  /**
   * RECOVERY: Find a user based on the Public Key derived from their 12 phrases
   */
getUserByPublicKey(publicKey: string): User | null {
  const stmt = this.db.prepare('SELECT * FROM users WHERE publicKey = ?');
  return (stmt.get(publicKey) as User) || null;
}
  getUserById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return (stmt.get(id) as User) || null;
  }

  // --- Challenge Operations ---

  createChallenge(userId: string, nonce: string): Challenge {
    const id = `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const challenge: Challenge = {
      id,
      userId,
      nonce,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    };

    const stmt = this.db.prepare(
      'INSERT INTO challenges (id, userId, nonce, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(challenge.id, challenge.userId, challenge.nonce, challenge.createdAt, challenge.expiresAt);

    return challenge;
  }

  getChallenge(id: string): Challenge | null {
    const stmt = this.db.prepare('SELECT * FROM challenges WHERE id = ?');
    const challenge = stmt.get(id) as Challenge | undefined;

    if (!challenge) return null;

    // Auto-cleanup if expired during retrieval
    if (new Date() > new Date(challenge.expiresAt)) {
      this.deleteChallenge(id);
      return null;
    }

    return challenge;
  }

  deleteChallenge(id: string): void {
    this.db.prepare('DELETE FROM challenges WHERE id = ?').run(id);
  }

  // --- Session Operations ---

  createSession(userId: string, token: string): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const session: Session = {
      id,
      userId,
      token,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const stmt = this.db.prepare(
      'INSERT INTO sessions (id, userId, token, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(session.id, session.userId, session.token, session.createdAt, session.expiresAt);

    return session;
  }

  getSessionByToken(token: string): Session | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE token = ? AND expiresAt > ?');
    const now = new Date().toISOString();
    return (stmt.get(token, now) as Session) || null;
  }

  deleteSession(token: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
}

export const db = new Database();

/* import DatabaseConstructor, { Database as SqliteInstance } from 'better-sqlite3';
import path from 'path';

// Interfaces remain the same for consistency with your app logic
export interface User {
  id: string;
  username: string;
  publicKey: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  userId: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

class Database {
  private db: SqliteInstance;

  constructor(dbPath: string = 'auth.db') {
    this.db = new DatabaseConstructor(path.resolve(dbPath));
    this.init();
  }

  private init() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        publicKey TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        nonce TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  }

  // --- User Operations ---

  createUser(username: string, publicKey: string): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id,
      username,
      publicKey,
      createdAt: new Date().toISOString(),
    };

    const stmt = this.db.prepare(
      'INSERT INTO users (id, username, publicKey, createdAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(user.id, user.username, user.publicKey, user.createdAt);
    
    console.log('[SQLite] User created:', username);
    return user;
  }

  getUserByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return (stmt.get(username) as User) || null;
  }

  getUserById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return (stmt.get(id) as User) || null;
  }

  // --- Challenge Operations ---

  createChallenge(userId: string, nonce: string): Challenge {
    const id = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const challenge: Challenge = {
      id,
      userId,
      nonce,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    };

    const stmt = this.db.prepare(
      'INSERT INTO challenges (id, userId, nonce, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(challenge.id, challenge.userId, challenge.nonce, challenge.createdAt, challenge.expiresAt);

    return challenge;
  }

  getChallenge(id: string): Challenge | null {
    const stmt = this.db.prepare('SELECT * FROM challenges WHERE id = ?');
    const challenge = stmt.get(id) as Challenge | undefined;

    if (!challenge) return null;

    if (new Date() > new Date(challenge.expiresAt)) {
      this.deleteChallenge(id);
      return null;
    }

    return challenge;
  }

  deleteChallenge(id: string): void {
    this.db.prepare('DELETE FROM challenges WHERE id = ?').run(id);
  }

  // --- Session Operations ---

  createSession(userId: string, token: string): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const session: Session = {
      id,
      userId,
      token,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const stmt = this.db.prepare(
      'INSERT INTO sessions (id, userId, token, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(session.id, session.userId, session.token, session.createdAt, session.expiresAt);

    return session;
  }

  getSessionByToken(token: string): Session | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE token = ? AND expiresAt > ?');
    const now = new Date().toISOString();
    return (stmt.get(token, now) as Session) || null;
  }

  deleteSession(token: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
}

// Export a singleton instance
export const db = new Database();
 */
/* // localStorage-based database for cryptographic auth
interface User {
  id: string;
  username: string;
  publicKey: string;
  createdAt: string;
}

interface Challenge {
  id: string;
  userId: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

class Database {
  private readonly STORAGE_PREFIX = 'crypto_auth_';
  private readonly USERS_KEY = `${this.STORAGE_PREFIX}users`;
  private readonly CHALLENGES_KEY = `${this.STORAGE_PREFIX}challenges`;
  private readonly SESSIONS_KEY = `${this.STORAGE_PREFIX}sessions`;
  private readonly USERNAMES_KEY = `${this.STORAGE_PREFIX}usernames`;

  private isNode = typeof window === 'undefined';
  private nodeUsers: Map<string, User> = new Map();
  private nodeChallenges: Map<string, Challenge> = new Map();
  private nodeSessions: Map<string, Session> = new Map();
  private nodeUsernames: Map<string, string> = new Map();

  private getStorage() {
    if (this.isNode) return null;
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  // User operations
  createUser(username: string, publicKey: string): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id,
      username,
      publicKey,
      createdAt: new Date().toISOString(),
    };

    if (this.isNode) {
      this.nodeUsers.set(id, user);
      this.nodeUsernames.set(username, id);
    } else {
      const storage = this.getStorage();
      if (storage) {
        const users = JSON.parse(storage.getItem(this.USERS_KEY) || '{}');
        users[id] = user;
        storage.setItem(this.USERS_KEY, JSON.stringify(users));

        const usernames = JSON.parse(storage.getItem(this.USERNAMES_KEY) || '{}');
        usernames[username] = id;
        storage.setItem(this.USERNAMES_KEY, JSON.stringify(usernames));
      }
    }

    console.log('[v0] User created:', username, 'ID:', id);
    return user;
  }

  getUserByUsername(username: string): User | null {
    if (this.isNode) {
      const userId = this.nodeUsernames.get(username);
      return userId ? this.nodeUsers.get(userId) || null : null;
    }

    const storage = this.getStorage();
    if (!storage) return null;

    const usernames = JSON.parse(storage.getItem(this.USERNAMES_KEY) || '{}');
    const userId = usernames[username];
    if (!userId) {
      console.log('[v0] User not found:', username);
      return null;
    }

    const users = JSON.parse(storage.getItem(this.USERS_KEY) || '{}');
    const user = users[userId];
    console.log('[v0] User found:', username);
    return user || null;
  }

  getUserById(id: string): User | null {
    if (this.isNode) {
      return this.nodeUsers.get(id) || null;
    }

    const storage = this.getStorage();
    if (!storage) return null;

    const users = JSON.parse(storage.getItem(this.USERS_KEY) || '{}');
    return users[id] || null;
  }

  // Challenge operations
  createChallenge(userId: string, nonce: string): Challenge {
    const id = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const challenge: Challenge = {
      id,
      userId,
      nonce,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    if (this.isNode) {
      this.nodeChallenges.set(id, challenge);
    } else {
      const storage = this.getStorage();
      if (storage) {
        const challenges = JSON.parse(storage.getItem(this.CHALLENGES_KEY) || '{}');
        challenges[id] = challenge;
        storage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
      }
    }

    console.log('[v0] Challenge created:', id);
    return challenge;
  }

  getChallenge(id: string): Challenge | null {
    let challenge: Challenge | null = null;

    if (this.isNode) {
      challenge = this.nodeChallenges.get(id) || null;
    } else {
      const storage = this.getStorage();
      if (!storage) return null;
      const challenges = JSON.parse(storage.getItem(this.CHALLENGES_KEY) || '{}');
      challenge = challenges[id] || null;
    }

    if (!challenge) {
      console.log('[v0] Challenge not found:', id);
      return null;
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      console.log('[v0] Challenge expired:', id);
      this.deleteChallenge(id);
      return null;
    }

    return challenge;
  }

  deleteChallenge(id: string): void {
    if (this.isNode) {
      this.nodeChallenges.delete(id);
    } else {
      const storage = this.getStorage();
      if (storage) {
        const challenges = JSON.parse(storage.getItem(this.CHALLENGES_KEY) || '{}');
        delete challenges[id];
        storage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
      }
    }
  }

  // Session operations
  createSession(userId: string, token: string): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const session: Session = {
      id,
      userId,
      token,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    if (this.isNode) {
      this.nodeSessions.set(id, session);
    } else {
      const storage = this.getStorage();
      if (storage) {
        const sessions = JSON.parse(storage.getItem(this.SESSIONS_KEY) || '{}');
        sessions[id] = session;
        storage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      }
    }

    console.log('[v0] Session created:', id, 'Token:', token.substring(0, 10) + '...');
    return session;
  }

  getSessionByToken(token: string): Session | null {
    if (this.isNode) {
      for (const session of this.nodeSessions.values()) {
        if (session.token === token && new Date() < new Date(session.expiresAt)) {
          return session;
        }
      }
      return null;
    }

    const storage = this.getStorage();
    if (!storage) return null;

    const sessions = JSON.parse(storage.getItem(this.SESSIONS_KEY) || '{}');
    for (const session of Object.values(sessions) as Session[]) {
      if (session.token === token && new Date() < new Date(session.expiresAt)) {
        console.log('[v0] Session found:', session.id);
        return session;
      }
    }

    console.log('[v0] Session not found for token');
    return null;
  }

  deleteSession(token: string): void {
    if (this.isNode) {
      for (const [key, session] of this.nodeSessions.entries()) {
        if (session.token === token) {
          this.nodeSessions.delete(key);
          break;
        }
      }
    } else {
      const storage = this.getStorage();
      if (storage) {
        const sessions = JSON.parse(storage.getItem(this.SESSIONS_KEY) || '{}');
        for (const [key, session] of Object.entries(sessions) as [string, any][]) {
          if (session.token === token) {
            delete sessions[key];
            break;
          }
        }
        storage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      }
    }
  }
}

export const db = new Database();
export type { User, Challenge, Session };
 */