// ANCHOR Firebase
import { auth } from 'firebase-admin';
import { firebaseAuth } from '../utils/firebase';

// ANCHOR Utils
import { getAuthBearerToken } from '../functions/auth';

export const getUserFromAuthorization = async (
  authorization?: string,
): Promise<auth.UserRecord | null> => {
  const bearerToken = getAuthBearerToken(authorization);

  if (!bearerToken) {
    return null;
  }

  const decodedIDToken = await firebaseAuth.verifyIdToken(bearerToken);

  const userId = decodedIDToken.uid;

  const user = await firebaseAuth.getUser(userId);

  return user;
};
