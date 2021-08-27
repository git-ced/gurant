declare module 'ecdsa-secp256r1' {
  interface GeneralKeyInterface {
    toPEM: () => string;
  }

  interface PrivateKeyInterface extends GeneralKeyInterface {
    asPublic: () => GeneralKeyInterface
  }

  function generateKey(): PrivateKeyInterface;
}
