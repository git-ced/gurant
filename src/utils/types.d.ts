export interface VerifyTokenQueryInterface {
  token: string;
  token_type_hint: 'access_token' | 'refresh_token';
}
