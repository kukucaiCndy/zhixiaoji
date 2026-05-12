import type { ApiResponse } from '../types/common';
export interface StorageAdapter {
    getItem(key: string): string | null | Promise<string | null>;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
}
export interface RequestAdapter {
    <T>(options: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        headers?: Record<string, string>;
        data?: any;
    }): Promise<ApiResponse<T>>;
}
export interface HttpClientConfig {
    baseURL: string;
    storage: StorageAdapter;
    requestAdapter?: RequestAdapter;
    onAuthError?: () => void;
}
export declare class HttpClient {
    private readonly baseURL;
    private readonly storage;
    private readonly requestAdapter;
    private readonly onAuthError?;
    constructor(config: HttpClientConfig);
    private getToken;
    setToken(token: string): void | Promise<void>;
    clearToken(): void | Promise<void>;
    private defaultRequestAdapter;
    private request;
    get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    post<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    patch<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    delete<T>(path: string): Promise<ApiResponse<T>>;
}
