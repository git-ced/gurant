// ANCHOR Node RSA
import crypto from 'crypto';

// ANCHOR UUID
import { v5 as uuidv5 } from 'uuid';

export const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY ?? '';
export const CRYPTO_INIT_VECTOR = process.env.CRYPTO_INIT_VECTOR ?? '';

const algorithm = 'aes-256-cbc';

export const encrypt = (message: string): string => {
  const cipher = crypto.createCipheriv(
    algorithm,
    CRYPTO_SECRET_KEY,
    CRYPTO_INIT_VECTOR,
  );

  const cipherData = cipher.update(message, 'utf-8', 'hex');

  return `${cipherData}${cipher.final('hex')}`;
};

export const decrypt = (encryptedData: string): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    CRYPTO_SECRET_KEY,
    CRYPTO_INIT_VECTOR,
  );

  const decipherData = decipher.update(encryptedData, 'hex', 'utf-8');

  return `${decipherData}${decipher.final('utf-8')}`;
};

export const removeKeyPrefix = (key: string): string => key
  .replace('pk_', '')
  .replace('sk_', '')
  .replace('live_', '')
  .replace('test_', '');

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
};

export const stringToBase64 = (text: string): string => (
  Buffer.from(text).toString('base64')
);

export const base64ToString = (base64: string): string => (
  Buffer.from(base64, 'base64').toString()
);

interface ClientCredentialsInterface {
  client_id: string;
  client_secret: string;
}

export const parseClientCredentials = (
  authorization?: string,
): ClientCredentialsInterface | null => {
  if (!authorization || !authorization.includes('Basic ')) {
    return null;
  }

  const base64Encoded = authorization.replace('Basic ', '');
  const decodedString = base64ToString(base64Encoded);
  const decodedCredentials = decodedString.split(':');

  if (decodedCredentials.length !== 2) {
    return null;
  }

  return {
    client_id: decodedCredentials[0],
    client_secret: decodedCredentials[1],
  };
};
