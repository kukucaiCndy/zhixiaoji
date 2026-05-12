import type { StorageAdapter } from '../client/http-client';
export declare const localStorageAdapter: StorageAdapter;
export declare const wechatStorageAdapter: StorageAdapter;
export declare function createPiniaStorageAdapter(store: any, tokenKey?: string): StorageAdapter;
export declare function createVuexStorageAdapter(store: any, tokenKey?: string): StorageAdapter;
