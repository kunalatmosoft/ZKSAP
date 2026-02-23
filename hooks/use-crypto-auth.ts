'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  generateNewIdentity,
  recoverIdentityFromMnemonic,
  signChallenge,
  storeIdentity,
  getLocalIdentity,
} from '@/lib/crypto';
import { storeRecoveryPhrases } from '@/lib/recovery-phrases';

interface AuthUser {
  id: string;
  username: string;
  sessionToken: string;
  mnemonic?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useCryptoAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // 1. Session Persistence & Validation
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      const savedUsername = localStorage.getItem('username');

      if (!sessionToken || !savedUsername) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setState({
            user: { 
              id: data.userId, 
              username: data.username, 
              sessionToken: sessionToken 
            },
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Session invalid');
        }
      } catch (error) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('username');
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    checkSession();
  }, []);

  // 2. Registration Logic (Unique phrases generated here)
  const register = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Create identity (12 words + Ed25519 keys)
      const identity = await generateNewIdentity();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          publicKey: identity.publicKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();

      // --- THE MAPPING HANDSHAKE ---
      // Store keys in IndexedDB
      await storeIdentity(username, identity);
      
      // Store 12 phrases as array for the Dashboard mapping
      storeRecoveryPhrases(username, identity.mnemonic.split(' '));

      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('username', username);

      setState({
        user: { 
          id: data.userId, 
          username: data.username, 
          sessionToken: data.sessionToken,
          mnemonic: identity.mnemonic 
        },
        loading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  }, []);

  // 3. Standard Login (Existing Device)
  const login = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const identity = await getLocalIdentity(username);
      if (!identity) throw new Error('No local identity found. Please recover your account.');

      // Get challenge nonce from server
      const challengeReq = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      
      if (!challengeReq.ok) throw new Error('Account not found');
      const { challengeId, nonce, userId } = await challengeReq.json();

      // Sign & Verify
      const signature = await signChallenge(identity.privateKey, nonce);
      const verifyReq = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature, userId }),
      });

      if (!verifyReq.ok) throw new Error('Authentication failed');
      const verifyData = await verifyReq.json();

      localStorage.setItem('sessionToken', verifyData.sessionToken);
      localStorage.setItem('username', username);

      setState({
        user: { 
          id: verifyData.user.id, 
          username: verifyData.user.username, 
          sessionToken: verifyData.sessionToken 
        },
        loading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  }, []);

  // 4. Recovery Logic (Restore identity on new device)
  const recover = useCallback(async (mnemonic: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const identity = await recoverIdentityFromMnemonic(mnemonic);

      // Search for account by derived Public Key
      const challengeReq = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: identity.publicKey }),
      });
      
      if (!challengeReq.ok) throw new Error('No account linked to these phrases');
      const { challengeId, nonce, userId, username } = await challengeReq.json();

      const signature = await signChallenge(identity.privateKey, nonce);
      const verifyReq = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature, userId }),
      });

      if (!verifyReq.ok) throw new Error('Recovery verification failed');
      const verifyData = await verifyReq.json();

      // --- RE-MAP THE NEW DEVICE ---
      await storeIdentity(username, identity);
      storeRecoveryPhrases(username, mnemonic.split(' '));

      localStorage.setItem('sessionToken', verifyData.sessionToken);
      localStorage.setItem('username', username);

      setState({
        user: { 
          id: verifyData.user.id, 
          username: verifyData.user.username, 
          sessionToken: verifyData.sessionToken 
        },
        loading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    try {
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        });
      }
    } finally {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('username');
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  return { ...state, register, login, recover, logout, isAuthenticated: !!state.user };
}

/* 'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  generateKeyPair,
  storePrivateKeySecurely,
  retrievePrivateKey,
  signChallenge,
} from '@/lib/crypto';
import { 
  generateRecoveryPhrases, 
  storeRecoveryPhrases, 
  getRecoveryPhrases 
} from '@/lib/recovery-phrases';

interface AuthUser {
  id: string;
  username: string;
  sessionToken: string;
  recoveryPhrases?: string[];
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useCryptoAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true, // Start as true to wait for checkSession
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      const savedUsername = localStorage.getItem('username');

      if (!sessionToken || !savedUsername) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        });

        if (response.ok) {
          const data = await response.json();
          // Also try to grab phrases from local storage if they exist
          const localPhrases = getRecoveryPhrases(savedUsername);
          
          setState({
            user: { 
              id: data.userId, 
              username: data.username, 
              sessionToken,
              recoveryPhrases: localPhrases || undefined
            },
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Session invalid');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('sessionToken');
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();
  }, []);

  const register = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const keyPair = await generateKeyPair();
      const recoveryPhrases = generateRecoveryPhrases();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          publicKey: keyPair.publicKeyJwk,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();

      // Secure storage
      await storePrivateKeySecurely(keyPair.privateKey, username);
      storeRecoveryPhrases(username, recoveryPhrases);

      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('username', username);

      setState({
        user: {
          id: data.userId,
          username: data.username,
          sessionToken: data.sessionToken,
          recoveryPhrases,
        },
        loading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  }, []);

  const login = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Get Challenge
      const challengeReq = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!challengeReq.ok) throw new Error('User not found');
      const { challengeId, nonce, userId } = await challengeReq.json();

      // 2. Sign Challenge
      const privateKey = await retrievePrivateKey(username);
      if (!privateKey) throw new Error('Private key missing. Use recovery phrases.');

      const signature = await signChallenge(privateKey, nonce);

      // 3. Verify
      const verifyReq = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature, userId }),
      });

      if (!verifyReq.ok) throw new Error('Identity verification failed');
      const verifyData = await verifyReq.json();

      // Success - Save and Sync
      localStorage.setItem('sessionToken', verifyData.sessionToken);
      localStorage.setItem('username', username);
      const localPhrases = getRecoveryPhrases(username);

      setState({
        user: {
          id: verifyData.userId,
          username: verifyData.username,
          sessionToken: verifyData.sessionToken,
          recoveryPhrases: localPhrases || undefined
        },
        loading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        });
      }
    } finally {
      // Always clear local state even if the network request fails
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('username');
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  return {
    ...state,
    register,
    login,
    logout,
    isAuthenticated: !!state.user,
  };
} */