export interface VerifyTokenQueryInterface {
  token: string;
  token_type_hint: 'access_token' | 'refresh_token';
}

export interface CreateUserPayloadInterface {
  redirect_uri?: string;
}

export interface UpdateClientParamsInterface {
  client_id: string;
}
