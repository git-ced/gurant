# gurant

Gurant is an OAuth 2.0 Provider, it is an authorization framework based on the [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749).

Additionally, it also has a built-in authentication using [Firebase](https://firebase.google.com/products/auth). Currently, its authentication is opinionated and will only support Firebase.

Lastly, this project uses [Hasura](https://hasura.io/)'s GrahpQL Engine for handling database and GraphQL communication. That would mean that this is database agnostic as long as Hasura supports it.
 
# Environment Variables

```bash
CRYPTO_SECRET_KEY=
CRYPTO_INIT_VECTOR=
FIREBASE_PROJECT_ID=
FIREBASE_DATABASE_URL=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GURANT_CLIENT_ID=
GURANT_CLIENT_SECRET=
GURANT_ACCOUNT_ID=
HASURA_ADMIN_SECRET=
JWT_PUBLIC_KEY=
JWT_PRIVATE_KEY=
```

# Endpoints

## Resource Owner Endpoints

### `GET /user`

Fetches the resource owner's profile details.

#### `Response Payload`

| property       | type      | description                            |
| -------------- | --------- | -------------------------------------- |
| `id`           | string    | the resource owner's identifier        |
| `created_at`   | timestamp | timestamp when the resource is created |
| `updated_at`   | timestamp | timestamp when the resource is updated |
| `display_name` | string    | the resource owner's display name      |
| `email`        | string    | the resource owner's email             |
| `client_live`  | object    | refer to the table below               |
| `client_test`  | object    | refer to the table below               |

#### `Client Object`
| property       | type      | description                                                                                  |
| -------------- | --------- | -------------------------------------------------------------------------------------------- |
| `id`           | string    | the [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2)           |
| `created_at`   | timestamp | timestamp when the resource is created                                                       |
| `updated_at`   | timestamp | timestamp when the resource is updated                                                       |
| `secret`       | string    | the [client secret](https://datatracker.ietf.org/doc/html/rfc6749#section-2.3.1)             |
| `is_live`      | boolean   | determines whether the credentias is for a live or test enviroment                           |
| `redirect_uri` | string    | the client's [redirect enpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) |

### `POST /user`

Register clients after the user has been registed. Requires the user's Firebase `token` to their info.

#### `Request Payload`
| property       | type   | description                                                                                        |
| -------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `redirect_uri` | string | the user specified [redirect enpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) |

#### `Response Payload`

| property         | type      | description                                                                                              |
| ---------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `id`             | string    | the resource owner's identifier                                                                          |
| `created_at`     | timestamp | timestamp when the resource is created                                                                   |
| `updated_at`     | timestamp | timestamp when the resource is updated                                                                   |
| `display_name`   | string    | the resource owner's display name                                                                        |
| `email`          | string    | the resource owner's email                                                                               |
| `client_live_id` | string    | the resource owner's live [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2) |
| `client_test_id` | string    | the resource owner's test [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2) |

### `PUT /user/clients/:client_id`

Update the specified client's redirect endpoint, requires Firebase `token` for authorization.

#### `Request Payload`
| property       | type     | description                                                                                            |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `redirect_uri` | string * | The new [redirect enpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) for the client |

#### `Response Payload`
| property       | type   | description                                                                                            |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `id`           | string | the updated client's [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2)    |
| `redirect_uri` | string | the new [redirect enpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) for the client |

## OAuth 2.0 Endpoints

### `GET /oauth2/authorize`

Retrieve the authrization code after the authorization grant, requires [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1) (HTTP Basic Auth).

Additionally, the client is required to pass the user's Firebase `token` in the headers as `user-token`.

#### `Request Parameters`
| property        | type     | description                                                                                                            |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `response_type` | string * | value MUST be [`code`](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1)                                    |
| `client_id`     | string * | the registered client's [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2)                 |
| `redirect_url`  | string * | value MUST be the same with the client's [`redirect_url`](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) |
| `scope`         | string * | the [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) of which the authorization is applicable        |
| `state`         | string   | additional [state](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1) to be passed, could be user info       |

#### `Response Parameters`

The response is the redirect url injected with the parameters below
| property | type   | description                                                                                                                        |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `code`   | string | the [authorization code](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1) that'll be exchanged to the access token     |
| `state`  | string | value MUST be the same with [`state`](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1) parameter passed in the request |

### `POST /oauth2/token?grant_type=authorization_code`

This endpoint is responsible for generating tokens using the previously generated authorization [`code`](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1).
This also requires [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1) (HTTP Basic Auth).

The generated access and refresh tokens comply with the [JSON Web Token (JWT) Specification](https://datatracker.ietf.org/doc/html/rfc7519).

#### `Request Parameter`

| property       | type     | description                                                                                                                    |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `grant_type`   | string * | the type of request in how the access token should be generated, value MUST be `authorization_code`                            |
| `code`         | string * | the [authorization code](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1) that'll be exchanged to the access token |
| `redirect_uri` | string * | the [redirect enpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2) used in the previous authorization grant   |
| `client_id`    | string * | the registered client's [client identifier](https://datatracker.ietf.org/doc/html/rfc6749#section-2.2)                         |


#### `Response Payload`

| property        | type   | description                                                                                                         |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `access_token`  | string | the [access token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.4) used to access protected resources    |
| `refresh_token` | string | the [refresh token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5) used to refresh an access token      |
| `scope`         | string | the [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) of which access is applicable                |
| `expires_in`    | number | the lifetime in seconds of the access token                                                                         |
| `token_type`    | string | the [type](https://datatracker.ietf.org/doc/html/rfc6749#section-7.1) of the access token, value is always `bearer` |

### `POST /oauth2/token?grant_type=refresh_token`

This endpoint is responsible for generating tokens using a [`refresh_token`](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5).
This also requires [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1) (HTTP Basic Auth).

#### `Request Parameter`

| property        | type     | description                                                                                                    |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `grant_type`    | string * | the type of request in how the access token should be generated, value MUST be `refresh_token`                 |
| `refresh_token` | string * | the [refresh token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5) used to refresh an access token |


#### `Response Payload`

| property        | type   | description                                                                                                         |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `access_token`  | string | the [access token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.4) used to access protected resources    |
| `refresh_token` | string | the [refresh token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5) used to refresh an access token      |
| `scope`         | string | the [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) of which access is applicable                |
| `expires_in`    | number | the lifetime in seconds of the access token                                                                         |
| `token_type`    | string | the [type](https://datatracker.ietf.org/doc/html/rfc6749#section-7.1) of the access token, value is always `bearer` |

### `POST /oauth2/revoke`

Revoke an access token, requires [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1) (HTTP Basic Auth).
This follows the [OAuth 2.0 Token Revocation Specification](https://datatracker.ietf.org/doc/html/rfc7009)

#### `Request Parameter`

| property          | type     | description                                                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `token`           | string * | The token the client wants to revoke                                                                        |
| `token_type_hint` | string * | A hint about the type of the token submitted for revocation. For now, the value MUST be `access_token` only |

#### Response Payload
| property     | type   | description          |
| ------------ | ------ | -------------------- |
| `status`     | string | the HTTP status      |
| `statusCode` | number | the HTTP status code |

## Utility Endpoints

### `GET /health`

This endpoint is used for health checks

#### Response Payload
| property     | type   | description          |
| ------------ | ------ | -------------------- |
| `status`     | string | the HTTP status      |
| `statusCode` | number | the HTTP status code |
### `GET /generate-crypto-keys`

This endpoint SHOULD NOT be exposed in production as it SHOULD only be used for debugging purposes.
Generates a `secret_key` and an `initialization vector`.

#### Response Payload
| property                | type   | description                                                     |
| ----------------------- | ------ | --------------------------------------------------------------- |
| `secret_key`            | string | the raw key used by the algorithm and the initialization vector |
| `initialization_vector` | string | a cryptographically random 16 byte string                       |

### `GET /generate-jwt-keys`

This endpoint SHOULD NOT be exposed in production as it SHOULD only be used for debugging purposes.
Generates a `public` and `private` signed with the [secp256r1 elliptic curve](https://datatracker.ietf.org/doc/html/rfc8422#section-5.1.1).

#### Response Payload
| property      | type   | description                                                                      |
| ------------- | ------ | -------------------------------------------------------------------------------- |
| `public_key`  | string | the public key in a [PEM format](https://datatracker.ietf.org/doc/html/rfc1421)  |
| `private_key` | string | the private key in a [PEM format](https://datatracker.ietf.org/doc/html/rfc1421) |

### `GET /verify-token`

This endpoint SHOULD NOT be exposed in production as it SHOULD only be used for debugging purposes.
Verifies and decodes a given [JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519).

#### Request Parameters
| property          | type     | description                                                              |
| ----------------- | -------- | ------------------------------------------------------------------------ |
| `token`           | string * | the token to be verified and decoded                                     |
| `token_type_hint` | string * | the token's type, value could eiher be `access_token` or `refresh_token` |

#### Response Payload
| property  | type   | description                    |
| --------- | ------ | ------------------------------ |
| `decoded` | object | the value of the decoded token |
