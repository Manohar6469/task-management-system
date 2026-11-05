/**
 * CRYPTOGRAPHIC SECURITY UTILITIES
 * Implements client-side SHA-256 password hashing with salt using the standard Web Crypto API.
 * Ensures zero plaintext passwords are stored in LocalStorage.
 */

const DEFAULT_SALT = 'taskflow_secure_salt_2026';

/**
 * Hashes a plaintext password using SHA-256 with salt
 * @param {string} password
 * @param {string} salt
 * @returns {Promise<string>} hex-encoded SHA-256 hash
 */
export async function hashPassword(password, salt = DEFAULT_SALT) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a plaintext password against a stored SHA-256 hash
 * @param {string} inputPassword
 * @param {string} storedHash
 * @param {string} salt
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(inputPassword, storedHash, salt = DEFAULT_SALT) {
  if (!inputPassword || !storedHash) return false;
  const inputHash = await hashPassword(inputPassword, salt);
  return inputHash === storedHash;
}
