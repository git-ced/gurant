// ANCHOR Axios
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const instance = axios.create();

const globalConfig: AxiosRequestConfig = {
  headers: {
    'content-type': 'application/json',
    'X-Hasura-Admin-Secret': String(process.env.HASURA_ADMIN_SECRET),
  },
};

export function GET<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return instance.get<T>(url, config ?? globalConfig);
}

export function POST<R, T>(
  url: string,
  data?: R,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return instance.post<T>(url, data, config ?? globalConfig);
}

export function PUT<R, T>(
  url: string,
  data?: R,
): Promise<AxiosResponse<T>> {
  return instance.put(url, data, globalConfig);
}

export function PATCH<R, T>(
  url: string,
  data?: R,
): Promise<AxiosResponse<T>> {
  return instance.patch(url, data, globalConfig);
}

export function DELETE<T>(
  url: string,
): Promise<AxiosResponse<T>> {
  return instance.delete(url, globalConfig);
}
