import crypto from 'crypto';

// Get key from environment, fallback to a SHA-256 hash of JWT_SECRET to guarantee exactly 32 bytes
const rawKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-encryption-secret-key-32-chars';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(rawKey).digest(); // Exactly 32 bytes
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES-256-CBC, IV is 16 bytes

/**
 * Encrypt a plain text string using AES-256-CBC
 * @param {string} text - The plain text to encrypt
 * @returns {string} The encrypted text in the format "ivHex:encryptedHex"
 */
export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a cipher text string using AES-256-CBC
 * @param {string} encryptedText - The encrypted text in the format "ivHex:encryptedHex"
 * @returns {string} The decrypted plain text
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) return null;
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedTextBuffer = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Lỗi khi giải mã dữ liệu:', error);
    return null;
  }
}
