import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

// Environment variables for encryption keys
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');
const NEURAL_DATA_KEY = process.env.NEURAL_DATA_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');
const DNA_DATA_KEY = process.env.DNA_DATA_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');
const QUANTUM_DATA_KEY = process.env.QUANTUM_DATA_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  tag: string;
  algorithm: string;
}

export interface DecryptionResult {
  decrypted: any;
  success: boolean;
  error?: string;
}

export class DataEncryption {
  private static instance: DataEncryption;
  private keyCache: Map<string, Buffer> = new Map();

  static getInstance(): DataEncryption {
    if (!DataEncryption.instance) {
      DataEncryption.instance = new DataEncryption();
    }
    return DataEncryption.instance;
  }

  // Derive encryption key from master key and salt
  private deriveKey(masterKey: string, salt: Buffer): Buffer {
    const cacheKey = `${masterKey}-${salt.toString('hex')}`;
    
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    const key = crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
    this.keyCache.set(cacheKey, key);
    return key;
  }

  // Encrypt sensitive data
  encrypt(data: any, dataType: 'neural' | 'dna' | 'quantum' | 'general' = 'general'): EncryptionResult {
    try {
      const jsonString = JSON.stringify(data);
      const dataBuffer = Buffer.from(jsonString, 'utf8');

      // Select appropriate key based on data type
      let key: string;
      switch (dataType) {
        case 'neural':
          key = NEURAL_DATA_KEY;
          break;
        case 'dna':
          key = DNA_DATA_KEY;
          break;
        case 'quantum':
          key = QUANTUM_DATA_KEY;
          break;
        default:
          key = MASTER_KEY;
      }

      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const derivedKey = this.deriveKey(key, salt);

      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
      cipher.setAAD(Buffer.from(dataType, 'utf8')); // Additional authenticated data

      let encrypted = cipher.update(dataBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const tag = cipher.getAuthTag();

      return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: ENCRYPTION_ALGORITHM
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData: EncryptionResult, dataType: 'neural' | 'dna' | 'quantum' | 'general' = 'general'): DecryptionResult {
    try {
      // Select appropriate key based on data type
      let key: string;
      switch (dataType) {
        case 'neural':
          key = NEURAL_DATA_KEY;
          break;
        case 'dna':
          key = DNA_DATA_KEY;
          break;
        case 'quantum':
          key = QUANTUM_DATA_KEY;
          break;
        default:
          key = MASTER_KEY;
      }

      const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const salt = Buffer.from(encryptedData.salt, 'base64');
      const tag = Buffer.from(encryptedData.tag, 'base64');

      const derivedKey = this.deriveKey(key, salt);

      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
      decipher.setAAD(Buffer.from(dataType, 'utf8'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const jsonString = decrypted.toString('utf8');
      const data = JSON.parse(jsonString);

      return {
        decrypted: data,
        success: true
      };
    } catch (error) {
      console.error('Decryption error:', error);
      return {
        decrypted: null,
        success: false,
        error: 'Failed to decrypt data'
      };
    }
  }

  // Encrypt neural profile data
  encryptNeuralProfile(profile: any): EncryptionResult {
    return this.encrypt(profile, 'neural');
  }

  // Decrypt neural profile data
  decryptNeuralProfile(encryptedData: EncryptionResult): DecryptionResult {
    return this.decrypt(encryptedData, 'neural');
  }

  // Encrypt DNA profile data
  encryptDNAProfile(profile: any): EncryptionResult {
    return this.encrypt(profile, 'dna');
  }

  // Decrypt DNA profile data
  decryptDNAProfile(encryptedData: EncryptionResult): DecryptionResult {
    return this.decrypt(encryptedData, 'dna');
  }

  // Encrypt quantum data
  encryptQuantumData(data: any): EncryptionResult {
    return this.encrypt(data, 'quantum');
  }

  // Decrypt quantum data
  decryptQuantumData(encryptedData: EncryptionResult): DecryptionResult {
    return this.decrypt(encryptedData, 'quantum');
  }

  // Hash sensitive identifiers
  hashIdentifier(identifier: string, salt?: string): string {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(identifier, saltBuffer, 100000, 64, 'sha512');
    return hash.toString('hex');
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Verify data integrity
  verifyIntegrity(data: any, signature: string, publicKey?: string): boolean {
    try {
      const dataString = JSON.stringify(data);
      const dataBuffer = Buffer.from(dataString, 'utf8');
      const signatureBuffer = Buffer.from(signature, 'base64');
      
      // In a real implementation, this would use asymmetric cryptography
      // For now, we'll use a simple HMAC verification
      const hmac = crypto.createHmac('sha256', MASTER_KEY);
      hmac.update(dataBuffer);
      const expectedSignature = hmac.digest();
      
      return crypto.timingSafeEqual(signatureBuffer, expectedSignature);
    } catch (error) {
      console.error('Integrity verification error:', error);
      return false;
    }
  }

  // Sign data for integrity verification
  signData(data: any): string {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString, 'utf8');
    
    const hmac = crypto.createHmac('sha256', MASTER_KEY);
    hmac.update(dataBuffer);
    return hmac.digest().toString('base64');
  }

  // Clear key cache (for security)
  clearKeyCache(): void {
    this.keyCache.clear();
  }

  // Rotate encryption keys
  rotateKeys(): void {
    this.clearKeyCache();
    // In a real implementation, this would generate new keys and re-encrypt data
    console.log('Encryption keys rotated');
  }
}

// Export singleton instance
export const encryption = DataEncryption.getInstance();

// Middleware for encrypting sensitive API responses
export function encryptSensitiveResponse(data: any, dataType: string) {
  if (!data) return data;

  // Check if data contains sensitive information
  const sensitiveFields = [
    'neuralData', 'brainwavePatterns', 'emotionalSignatures',
    'geneticMarkers', 'healthFactors', 'personalityTraits',
    'quantumState', 'biometricData', 'personalData'
  ];

  const hasSensitiveData = sensitiveFields.some(field => 
    data.hasOwnProperty(field) || 
    (typeof data === 'object' && Object.keys(data).some(key => key.includes(field)))
  );

  if (!hasSensitiveData) {
    return data;
  }

  // Encrypt sensitive portions
  const encryptedData = { ...data };
  sensitiveFields.forEach(field => {
    if (data[field]) {
      const encryptionResult = encryption.encrypt(data[field], dataType as any);
      encryptedData[field] = encryptionResult;
      encryptedData[`${field}_encrypted`] = true;
    }
  });

  return encryptedData;
}

// Utility function to check if data is encrypted
export function isEncrypted(data: any): boolean {
  return data && 
         typeof data === 'object' && 
         data.encrypted && 
         data.iv && 
         data.salt && 
         data.tag && 
         data.algorithm;
}
