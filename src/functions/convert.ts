export const stringToBase64 = (text: string): string => (
  Buffer.from(text).toString('base64')
);

export const base64ToString = (base64: string): string => (
  Buffer.from(base64, 'base64').toString()
);
