import {
  getAuthBearerToken,
  getBasicCredentials,
  removeKeyPrefix,
} from '../src/functions/auth';

describe('Get Auth Bearer Token', () => {
  it('should return null', () => {
    const token = getAuthBearerToken();
    expect(token).toBeNull();
  });

  it('should return null due to not bearer', () => {
    const token = getAuthBearerToken('Basic 123');
    expect(token).toBeNull();
  });

  it('should return 123', () => {
    const token = getAuthBearerToken('Bearer 123');
    expect(token).toBe('123');
  });
});

describe('Get Auth Basic Credentials', () => {
  it('should return null', () => {
    const credentials = getBasicCredentials();
    expect(credentials).toBeNull();
  });

  it('should return null due to not basic', () => {
    const credentials = getBasicCredentials('Bearer 123');
    expect(credentials).toBeNull();
  });

  it('should return username:password', () => {
    const credentials = getBasicCredentials('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    expect(credentials?.client_id).toBe('username');
    expect(credentials?.client_secret).toBe('password');
  });

  it('should return a username of "username" but no password', () => {
    const credentials = getBasicCredentials('Basic dXNlcm5hbWU6');
    expect(credentials?.client_id).toBe('username');
    expect(credentials?.client_secret).toBe('');
  });

  it('should return a password of "password" but no username', () => {
    const credentials = getBasicCredentials('Basic OnBhc3N3b3Jk');
    expect(credentials?.client_id).toBe('');
    expect(credentials?.client_secret).toBe('password');
  });
});

describe('Remove Key Prefix', () => {
  it('should not change the string', () => {
    const result = removeKeyPrefix('sample-string');
    expect(result).toBe('sample-string');
  });

  it('should not change the sample-string', () => {
    const result = removeKeyPrefix('pk_live_sample-string');
    expect(result).toBe('sample-string');
  });

  it('should not change the sample-string', () => {
    const result = removeKeyPrefix('sk_live_sample-string');
    expect(result).toBe('sample-string');
  });

  it('should not change the sample-string', () => {
    const result = removeKeyPrefix('pk_test_sample-string');
    expect(result).toBe('sample-string');
  });

  it('should not change the sample-string', () => {
    const result = removeKeyPrefix('sk_test_sample-string');
    expect(result).toBe('sample-string');
  });
});
