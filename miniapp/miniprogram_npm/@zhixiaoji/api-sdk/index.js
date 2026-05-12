"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWechatRequestAdapter = exports.createVuexStorageAdapter = exports.createPiniaStorageAdapter = exports.wechatStorageAdapter = exports.localStorageAdapter = exports.AuthApi = exports.HttpClient = void 0;
exports.createApiClient = createApiClient;
exports.createWechatApiClient = createWechatApiClient;
exports.createVue3ApiClient = createVue3ApiClient;
const http_client_1 = require("./client/http-client");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return http_client_1.HttpClient; } });
const auth_api_1 = require("./apis/auth-api");
Object.defineProperty(exports, "AuthApi", { enumerable: true, get: function () { return auth_api_1.AuthApi; } });
const storage_1 = require("./utils/storage");
Object.defineProperty(exports, "localStorageAdapter", { enumerable: true, get: function () { return storage_1.localStorageAdapter; } });
Object.defineProperty(exports, "wechatStorageAdapter", { enumerable: true, get: function () { return storage_1.wechatStorageAdapter; } });
Object.defineProperty(exports, "createPiniaStorageAdapter", { enumerable: true, get: function () { return storage_1.createPiniaStorageAdapter; } });
Object.defineProperty(exports, "createVuexStorageAdapter", { enumerable: true, get: function () { return storage_1.createVuexStorageAdapter; } });
const wechat_request_1 = require("./adapters/wechat-request");
Object.defineProperty(exports, "createWechatRequestAdapter", { enumerable: true, get: function () { return wechat_request_1.createWechatRequestAdapter; } });
__exportStar(require("./types"), exports);
function createApiClient(config = {}) {
    const client = new http_client_1.HttpClient({
        baseURL: config.baseURL || '/api/v1',
        storage: config.storage || storage_1.localStorageAdapter,
        requestAdapter: config.requestAdapter,
        onAuthError: config.onAuthError,
    });
    return {
        client,
        auth: new auth_api_1.AuthApi(client),
        setToken: (token) => client.setToken(token),
        clearToken: () => client.clearToken(),
    };
}
function createWechatApiClient(options) {
    return createApiClient({
        baseURL: options.baseURL,
        storage: storage_1.wechatStorageAdapter,
        requestAdapter: (0, wechat_request_1.createWechatRequestAdapter)({ timeout: options.timeout }),
        onAuthError: options.onAuthError,
    });
}
function createVue3ApiClient(options) {
    let storage = storage_1.localStorageAdapter;
    if (options.storage === 'pinia' && options.store) {
        storage = (0, storage_1.createPiniaStorageAdapter)(options.store);
    }
    else if (options.storage === 'vuex' && options.store) {
        storage = (0, storage_1.createVuexStorageAdapter)(options.store);
    }
    return createApiClient({
        baseURL: options.baseURL,
        storage,
        onAuthError: options.onAuthError,
    });
}
