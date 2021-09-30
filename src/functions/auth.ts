// ANCHOR Utils
import { base64ToString } from './convert';

export const removeKeyPrefix = (key: string): string => key
  .replace('pk_', '')
  .replace('sk_', '')
  .replace('live_', '')
  .replace('test_', '');

interface ClientCredentialsInterface {
  client_id: string;
  client_secret: string;
}

export const getBasicCredentials = (
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

export const getAuthBearerToken = (
  authorization?: string,
): string | null => {
  if (!authorization || !authorization.includes('Bearer ')) {
    return null;
  }

  return authorization.replace('Bearer ', '');
};
