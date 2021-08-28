// ANCHOR Firebase
import { auth } from 'firebase-admin';

// ANCHOR UUID
import { v5 as uuidv5 } from 'uuid';

import { firebaseAuth } from '../utils/firebase';
import { base64ToString } from './convert';
import { decrypt } from './encryption';

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

export const getUserFromToken = async (
  token: string,
): Promise<auth.UserRecord> => {
  const decodedToken = await firebaseAuth.verifyIdToken(token);

  const userId = decodedToken.uid;

  const user = await firebaseAuth.getUser(userId);

  return user;
};
