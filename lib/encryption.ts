import crypto from 'crypto';

// Use a secret key from environment variables or fallback to a default (not secure for production)
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'fallback_encryption_key_32_chars_min';
const ALGORITHM = 'aes-256-cbc';

// Encrypt data
export function encrypt(text: string): string {
  try {
    // Create an initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM, 
      Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32)), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
export function decrypt(text: string): string {
  try {
    // Split IV and encrypted data
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32)), 
      iv
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
