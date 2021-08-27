// ANCHOR JOSE
import { JWTPayload, SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify'

// ANCHOR Crypto
import { createPublicKey, createPrivateKey } from 'crypto';

const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY ?? '')
  .replace(/\\n/gm, '\n');
const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY ?? '')
  .replace(/\\n/gm, '\n');
const SAMPLE_CLIENT_ID = process.env.SAMPLE_CLIENT_ID ?? '';

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
) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer(SAMPLE_CLIENT_ID)
    .setExpirationTime('1h')
    .sign(privateKey)
}

export const signRefreshToken = async (
  payload: JWTPayload,
) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer(SAMPLE_CLIENT_ID)
    .sign(privateKey)
}

export const verifyAccessToken = async (
  jwt: string,
) => {
  return jwtVerify(jwt, publicKey, {
    issuer: SAMPLE_CLIENT_ID,
    maxTokenAge: '1h',
  })
}

export const verifyRefreshToken = async (
  jwt: string,
) => {
  return jwtVerify(jwt, publicKey, {
    issuer: SAMPLE_CLIENT_ID,
  })
}

