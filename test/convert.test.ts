import {
  stringToBase64,
  base64ToString,
} from '../src/functions/convert';

describe('String to Base 64', () => {
  it('should return "dXNlcm5hbWU6cGFzc3dvcmQ="', () => {
    const string = stringToBase64('username:password');
    expect(string).toBe('dXNlcm5hbWU6cGFzc3dvcmQ=');
  });

  it('should return "dXNlcm5hbWU6"', () => {
    const string = stringToBase64('username:');
    expect(string).toBe('dXNlcm5hbWU6');
  });

  it('should return "OnBhc3N3b3Jk"', () => {
    const string = stringToBase64(':password');
    expect(string).toBe('OnBhc3N3b3Jk');
  });
});

describe('Base64 to String', () => {
  it('should return "username:password"', () => {
    const string = base64ToString('dXNlcm5hbWU6cGFzc3dvcmQ=');
    expect(string).toBe('username:password');
  });

  it('should return "username:"', () => {
    const string = base64ToString('dXNlcm5hbWU6');
    expect(string).toBe('username:');
  });

  it('should return ":password"', () => {
    const string = base64ToString('OnBhc3N3b3Jk');
    expect(string).toBe(':password');
  });
});
