// ANCHOR JOSE
import { JWTPayload, SignJWT } from 'jose/jwt/sign';
import { jwtVerify, JWTVerifyResult } from 'jose/jwt/verify';

// ANCHOR Crypto
import { createPublicKey, createPrivateKey } from 'crypto';

const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY ?? '')
  .replace(/\\n/gm, '\n');
const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY ?? '')
  .replace(/\\n/gm, '\n');

const publicKey = createPublicKey({
  key: JWT_PUBLIC_KEY,
  format: 'pem',
  type: 'spki',
});

const privateKey = createPrivateKey({
  key: JWT_PRIVATE_KEY,
  format: 'pem',
  type: 'pkcs8',
});

export const signAccessToken = async (
  payload: JWTPayload,
): Promise<string> => new SignJWT(payload)
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(privateKey);

export const signRefreshToken = async (
  payload: JWTPayload,
): Promise<string> => new SignJWT(payload)
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuedAt()
  .sign(privateKey);

export const verifyAccessToken = async (
  jwt: string,
  issuer: string,
): Promise<JWTVerifyResult> => jwtVerify(jwt, publicKey, {
  issuer,
  maxTokenAge: '1h',
});

export const verifyRefreshToken = async (
  jwt: string,
  issuer: string,
): Promise<JWTVerifyResult> => jwtVerify(jwt, publicKey, {
  issuer,
});
