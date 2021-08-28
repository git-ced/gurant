// ANCHOR QueryString
import QueryString from 'query-string';

export const composeRedirectURI = (
  redirect_uri: string,
  paramObject?: Record<string, unknown>,
): string => {
  const params = paramObject
    ? `?${QueryString.stringify(paramObject)}`
    : '';

  return `${redirect_uri}${params}`;
};
