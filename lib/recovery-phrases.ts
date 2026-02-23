/**
 * RECOVERY PHRASES PERSISTENCE UTILITY
 * This handles saving/loading the 12 words to LocalStorage 
 * so the Dashboard can display them.
 */

/**
 * Join recovery phrases into a single string
 */
export function phraseArrayToString(phrases: string[]): string {
  return phrases.join(' ');
}

/**
 * Store recovery phrases in localStorage
 * We map these by username so the Dashboard knows which phrases to show.
 */
export function storeRecoveryPhrases(username: string, phrases: string[]): void {
  if (!username) return;
  const key = `recovery_phrases_${username}`;
  localStorage.setItem(key, JSON.stringify(phrases));
  console.log('[v0] Mapping phrases to local user:', username);
}

/**
 * Retrieve recovery phrases from localStorage
 */
export function getRecoveryPhrases(username: string): string[] | null {
  if (!username) return null;
  const key = `recovery_phrases_${username}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    console.warn(`[v0] No phrase mapping found for ${username}`);
    return null;
  }
  
  return JSON.parse(stored);
}

/**
 * Clear recovery phrases (used on logout if you want a clean slate)
 */
export function clearRecoveryPhrases(username: string): void {
  localStorage.removeItem(`recovery_phrases_${username}`);
}