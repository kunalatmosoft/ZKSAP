import crypto from 'crypto';
import { ed25519 } from '@noble/curves/ed25519.js';

/**
 * Generate a random 32-byte session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random 32-byte nonce (challenge)
 */
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verifies an Ed25519 signature using @noble/curves
 * This is much more reliable across Node.js versions than the native crypto module.
 * * @param publicKeyHex - 64 character hex string
 * @param nonce - The utf-8 string challenge
 * @param signatureHex - 128 character hex string
 */
export function verifySignature(
  publicKeyHex: string,
  nonce: string,
  signatureHex: string
): boolean {
  try {
    // 1. Prepare data (Matches exactly what the client did)
    const message = new TextEncoder().encode(nonce);
    
    // 2. Convert hex strings to Uint8Array
    const signature = new Uint8Array(Buffer.from(signatureHex, 'hex'));
    const publicKey = new Uint8Array(Buffer.from(publicKeyHex, 'hex'));
    
    // 3. Perform verification
    const isValid = ed25519.verify(signature, message, publicKey);

    console.log('[Crypto-Server] Verification Result:', isValid);
    return isValid;
  } catch (error) {
    console.error('[Crypto-Server] Critical Verification Failure:', error);
    return false;
  }
}
/* import crypto from 'crypto';

/**
 * Generate a session token (server-side version)

export function generateSessionToken(): string {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('base64');
}

/**
 * Generate a nonce for challenges (server-side version)

export function generateNonce(): string {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('base64');
}

/**
 * Verify a cryptographic signature (server-side)
 * Expects RSA-PSS signature made with SHA-256 and salt length 32

export function verifySignature(
  publicKeyJwk: any,
  nonce: string,
  signature: string
): boolean {
  try {
    console.log('[v0] Server: Verifying signature');
    console.log('[v0] Server: Nonce:', nonce.substring(0, 20) + '...');
    console.log('[v0] Server: Signature length:', signature.length);

    // Create public key from JWK
    const keyObject = crypto.createPublicKey({
      key: publicKeyJwk,
      format: 'jwk',
    });
    console.log('[v0] Server: Public key created, type:', keyObject.asymmetricKeyType);

    // Decode the signature from base64
    const signatureBuffer = Buffer.from(signature, 'base64');
    console.log('[v0] Server: Signature buffer length:', signatureBuffer.length);

    // Convert message to buffer using TextEncoder to match client-side
    const messageBuffer = Buffer.from(new TextEncoder().encode(nonce));
    console.log('[v0] Server: Message buffer length:', messageBuffer.length);

    // Create a verifier for RSA-PSS with SHA-256
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(messageBuffer);
    verifier.setDefaultEncoding('base64');

    // Verify the signature
    const isValid = verifier.verify(
      {
        key: keyObject,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      },
      signatureBuffer
    );

    console.log('[v0] Server: Signature verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('[v0] Server: Signature verification failed:', error);
    return false;
  }
}
*/