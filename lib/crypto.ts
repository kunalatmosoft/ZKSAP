import * as bip39 from 'bip39';
import { ed25519 } from '@noble/curves/ed25519.js';

const DB_NAME = 'auth_system_db';
const STORE_NAME = 'user_identity';

export interface KeyPair {
  publicKey: string;  // Hex string
  privateKey: string; // Hex string
  mnemonic: string;   // 12 words
}

// --- Helper: Convert Uint8Array to Hex (Standard Browser Way) ---
const toHex = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const fromHex = (hexString: string) => {
  const matches = hexString.match(/.{1,2}/g);
  return new Uint8Array(matches ? matches.map((byte) => parseInt(byte, 16)) : []);
};

/**
 * 1. Generate new 12-phrase identity
 */
export async function generateNewIdentity(): Promise<KeyPair> {
  const mnemonic = bip39.generateMnemonic(128);
  return recoverIdentityFromMnemonic(mnemonic);
}

/**
 * 2. Derive keys from mnemonic
 */
export async function recoverIdentityFromMnemonic(mnemonic: string): Promise<KeyPair> {
  const cleanMnemonic = mnemonic.trim().toLowerCase();
  
  if (!bip39.validateMnemonic(cleanMnemonic)) {
    throw new Error('Invalid recovery phrase. Please check the 12 words.');
  }

  // Convert mnemonic to 64-byte seed
  const seed = await bip39.mnemonicToSeed(cleanMnemonic);
  
  // ed25519 uses the first 32 bytes of the seed as the private key
  const privKeyBytes = new Uint8Array(seed.slice(0, 32));
  const pubKeyBytes = ed25519.getPublicKey(privKeyBytes);

  return {
    mnemonic: cleanMnemonic,
    privateKey: toHex(privKeyBytes),
    publicKey: toHex(pubKeyBytes),
  };
}

/**
 * 3. Sign a challenge (nonce)
 */
export async function signChallenge(privateKeyHex: string, nonce: string): Promise<string> {
  // Ensure the message is encoded exactly as the server expects (UTF-8)
  const message = new TextEncoder().encode(nonce);
  const privKeyBytes = fromHex(privateKeyHex);
  
  // ed25519.sign returns a Uint8Array signature
  const signature = ed25519.sign(message, privKeyBytes);
  
  return toHex(signature);
}

/**
 * 4. Database Helper
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'username' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 5. Store Identity
 */
export async function storeIdentity(username: string, keyPair: Partial<KeyPair>): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((res, rej) => {
    const req = store.put({
      username,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      updatedAt: new Date().toISOString()
    });
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

/**
 * 6. Get Identity
 */
export async function getLocalIdentity(username: string): Promise<{ publicKey: string, privateKey: string } | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((res) => {
    const req = store.get(username);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => res(null);
  });
}

/**
 * 7. Clear Identity
 */
export async function clearLocalIdentity(username: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(username);
}

/* // Cryptographic utilities for key generation, signing, and verification

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
}

/**
 * Generate an RSA key pair using Web Crypto API
 * Uses RSA-PSS for signing and verification
 
export async function generateKeyPair(): Promise<KeyPair> {
  console.log('[v0] Generating RSA-2048 key pair...');
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['sign', 'verify']
  );

  // Export public key as JWK for storage
  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  console.log('[v0] Key pair generated successfully. Public key:', publicKeyJwk.kid);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk,
  };
}

/**
 * Store the private key securely in IndexedDB
 
export async function storePrivateKeySecurely(
  privateKey: CryptoKey,
  username: string
): Promise<void> {
  console.log('[v0] Storing private key for:', username);
  const db = await openIndexedDB();
  const transaction = db.transaction(['keys'], 'readwrite');
  const store = transaction.objectStore('keys');

  // Export as JWK for storage (in production, consider using more secure storage)
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', privateKey);
  console.log('[v0] Private key exported as JWK');

  await new Promise((resolve, reject) => {
    const request = store.put({
      username,
      privateKey: privateKeyJwk,
      createdAt: new Date().toISOString(),
    });
    request.onerror = () => {
      console.error('[v0] Failed to store private key:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('[v0] Private key stored successfully in IndexedDB');
      resolve(undefined);
    };
  });
}

/**
 * Retrieve the private key from IndexedDB
 
export async function retrievePrivateKey(username: string): Promise<CryptoKey | null> {
  console.log('[v0] Retrieving private key for:', username);
  const db = await openIndexedDB();
  const transaction = db.transaction(['keys'], 'readonly');
  const store = transaction.objectStore('keys');

  return new Promise((resolve, reject) => {
    const request = store.get(username);
    request.onerror = () => {
      console.error('[v0] Failed to retrieve private key:', request.error);
      reject(request.error);
    };
    request.onsuccess = async () => {
      const result = request.result;
      if (!result) {
        console.log('[v0] No private key found for:', username);
        resolve(null);
        return;
      }

      try {
        console.log('[v0] Importing private key from JWK');
        const privateKey = await window.crypto.subtle.importKey(
          'jwk',
          result.privateKey,
          {
            name: 'RSA-PSS',
            hash: 'SHA-256',
          },
          true,
          ['sign']
        );
        console.log('[v0] Private key imported successfully');
        resolve(privateKey);
      } catch (error) {
        console.error('[v0] Error importing private key:', error);
        reject(error);
      }
    };
  });
}

/**
 * Sign a nonce (challenge) with the private key
 
export async function signChallenge(privateKey: CryptoKey, nonce: string): Promise<string> {
  console.log('[v0] signChallenge: Encoding nonce:', nonce.substring(0, 20) + '...');
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  console.log('[v0] signChallenge: Encoded data length:', data.length);

  console.log('[v0] signChallenge: Signing with RSA-PSS...');
  const signature = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateKey,
    data
  );

  const base64Sig = bufferToBase64(signature);
  console.log('[v0] signChallenge: Signature created, base64 length:', base64Sig.length);
  return base64Sig;
}

/**
 * Verify a signature using the public key (server-side)
 
export async function verifySignature(
  publicKeyJwk: JsonWebKey,
  nonce: string,
  signature: string
): Promise<boolean> {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(nonce);
    const signatureBuffer = base64ToBuffer(signature);

    const isValid = await window.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      publicKey,
      signatureBuffer,
      data
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Generate a random nonce for challenge-response authentication
 
export function generateNonce(): string {
  const buffer = new Uint8Array(32);
  window.crypto.getRandomValues(buffer);
  return bufferToBase64(buffer);
}

// Note: generateSessionToken and generateNonce are only available on the server
// Import them from lib/crypto-server.ts when needed in API routes

// Helper functions
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Initialize IndexedDB for secure key storage
 
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cryptoAuthDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'username' });
      }
    };
  });
}

/**
 * Clear stored credentials (logout)
 
export async function clearStoredCredentials(username: string): Promise<void> {
  const db = await openIndexedDB();
  const transaction = db.transaction(['keys'], 'readwrite');
  const store = transaction.objectStore('keys');

  return new Promise((resolve, reject) => {
    const request = store.delete(username);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(undefined);
  });
}
 */