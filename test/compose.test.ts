import {
  composeRedirectURI,
} from '../src/functions/compose';

describe('Compose Redirect URI', () => {
  const baseUri = 'http://sample.domain/';

  it('should return the same string', () => {
    const uri = composeRedirectURI(baseUri);
    expect(uri).toBe('http://sample.domain/');
  });

  it('should have hello and little query params', () => {
    const uri = composeRedirectURI(baseUri, {
      hello: 'world',
      little: 'prince',
    });
    expect(uri).toBe('http://sample.domain/?hello=world&little=prince');
  });

  it('should have boolean and number query params', () => {
    const uri = composeRedirectURI(baseUri, {
      boolean: true,
      number: 31,
    });
    expect(uri).toBe('http://sample.domain/?boolean=true&number=31');
  });
});
