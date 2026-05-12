import { HttpClient } from './client/http-client';
import type { HttpClientConfig } from './client/http-client';
import { AuthApi } from './apis/auth-api';
import { localStorageAdapter, wechatStorageAdapter, createPiniaStorageAdapter, createVuexStorageAdapter } from './utils/storage';
import { createWechatRequestAdapter } from './adapters/wechat-request';
export * from './types';
export { HttpClient, AuthApi, localStorageAdapter, wechatStorageAdapter, createPiniaStorageAdapter, createVuexStorageAdapter, createWechatRequestAdapter, };
export type { HttpClientConfig, StorageAdapter, RequestAdapter } from './client/http-client';
export type { WechatRequestConfig } from './adapters/wechat-request';
export declare function createApiClient(config?: Partial<HttpClientConfig>): {
    client: HttpClient;
    auth: AuthApi;
    setToken: (token: string) => void | Promise<void>;
    clearToken: () => void | Promise<void>;
};
export declare function createWechatApiClient(options: {
    baseURL: string;
    timeout?: number;
    onAuthError?: () => void;
}): {
    client: HttpClient;
    auth: AuthApi;
    setToken: (token: string) => void | Promise<void>;
    clearToken: () => void | Promise<void>;
};
export declare function createVue3ApiClient(options: {
    baseURL: string;
    storage?: 'localStorage' | 'pinia' | 'vuex';
    store?: any;
    onAuthError?: () => void;
}): {
    client: HttpClient;
    auth: AuthApi;
    setToken: (token: string) => void | Promise<void>;
    clearToken: () => void | Promise<void>;
};
