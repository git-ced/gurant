// ANCHOR Node RSA
import crypto from 'crypto';

// ANCHOR UUID
import { v5 as uuidv5 } from 'uuid';

export const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY ?? '';
export const CRYPTO_INIT_VECTOR = process.env.CRYPTO_INIT_VECTOR ?? '';

const algorithm = "aes-256-cbc";

export const encrypt = (message: string): string => {
  const cipher = crypto.createCipheriv(
    algorithm,
    CRYPTO_SECRET_KEY,
    CRYPTO_INIT_VECTOR,
  );

  const cipherData = cipher.update(message, "utf-8", "hex");

  return `${cipherData}${cipher.final('hex')}`;
}

export const decrypt = (encryptedData: string): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    CRYPTO_SECRET_KEY,
    CRYPTO_INIT_VECTOR,
  );

  const decipherData = decipher.update(encryptedData, "hex", "utf-8");
  
  return `${decipherData}${decipher.final('utf-8')}`
}

export const removeKeyPrefix = (key: string): string => {
  return key
    .replace('pk_', '')
    .replace('sk_', '')
    .replace('live_', '')
    .replace('test_', '')
}

export const isSecretValid = (
  clientId: string,
  clientSecret: string,
  userId: string,
): boolean => {
  const parsedClientId = removeKeyPrefix(clientId);
  const parsedClientSecret = removeKeyPrefix(clientSecret);
  const decryptedClientId = decrypt(parsedClientId);
  const decryptedClientSecret = decrypt(parsedClientSecret);

  const clientSecretReference = uuidv5(userId, decryptedClientId);
  
  return decryptedClientSecret === clientSecretReference;
}
