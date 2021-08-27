//
export interface User {
  id: string;
  created_at: Date;
  updated_at: Date;
  display_name: string;
  email: string;
  client_live: Client;
  client_test: Client;
}

export interface Client {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  is_live: boolean;
  secret: string;
  redirect_uri?: string;
}

export interface OauthAuthorizationCode {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  client_id: string;
  expires_in: number;
  is_active: string;
  state: string;
  redirect_uri: string;
  scope: string[];
}

export interface OauthAccessToken {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  client_id: string;
  expires_in: number;
  scope: string[];
  token_type: string;
  is_active: string;
}
