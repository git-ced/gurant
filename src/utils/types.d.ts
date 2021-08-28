// SECTION: Util Endpoints
export interface VerifyTokenQueryInterface {
  token: string;
  token_type_hint: 'access_token' | 'refresh_token';
}

// SECTION: User Endpoints

export interface CreateUserPayloadInterface {
  redirect_uri?: string;
}

export interface UpdateClientParamsInterface {
  client_id: string;
}

// SECTION: OAuth 2.0 Authorize Endpoints
export interface AuthorizationQueryInterface {
  response_type: string;
  state: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
}

// SECTION: OAuth 2.0 Token Endpoints
export interface TokenQueryInterface {
  grant_type: string;
  code: string;
  redirect_uri: string;
  refresh_token: string;
}

// SECTION: OAuth 2.0 Revoke Endpoints
export interface RevokeQueryInterface {
  token: string;
  token_type_hint: string;
}
