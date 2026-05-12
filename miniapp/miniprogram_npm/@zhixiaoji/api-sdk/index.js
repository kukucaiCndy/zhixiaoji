module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778568759540, function(require, module, exports) {

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

}, function(modId) {var map = {"./apis/auth-api":1778568759542,"./utils/storage":1778568759543,"./adapters/wechat-request":1778568759544,"./types":1778568759545}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759542, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthApi = void 0;
class AuthApi {
    constructor(client) {
        this.client = client;
    }
    async miniappLogin(data) {
        return this.client.post('/auth/miniapp/login', data);
    }
    async refreshToken(data) {
        return this.client.post('/auth/token/refresh', data);
    }
    async adminLogin(data) {
        return this.client.post('/auth/admin/login', data);
    }
    async logout() {
        return this.client.post('/auth/logout');
    }
    async getProfile() {
        return this.client.get('/auth/me');
    }
    async getAdminProfile() {
        return this.client.get('/auth/admin/me');
    }
    async updateProfile(userId, data) {
        return this.client.patch(`/auth/users/${userId}`, data);
    }
    async getUsers(params) {
        return this.client.get('/auth/admin/users', params);
    }
    async updateUserStatus(userId, data) {
        return this.client.patch(`/auth/admin/users/${userId}/status`, data);
    }
}
exports.AuthApi = AuthApi;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759543, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatStorageAdapter = exports.localStorageAdapter = void 0;
exports.createPiniaStorageAdapter = createPiniaStorageAdapter;
exports.createVuexStorageAdapter = createVuexStorageAdapter;
exports.localStorageAdapter = {
    getItem: (key) => {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key, value) => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key) => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
        }
    },
};
exports.wechatStorageAdapter = {
    getItem: (key) => {
        try {
            if (typeof wx !== 'undefined' && wx.getStorageSync) {
                const value = wx.getStorageSync(key);
                return value || null;
            }
        }
        catch (error) {
            console.error('微信存储读取失败:', error);
        }
        return null;
    },
    setItem: (key, value) => {
        try {
            if (typeof wx !== 'undefined' && wx.setStorageSync) {
                wx.setStorageSync(key, value);
            }
        }
        catch (error) {
            console.error('微信存储设置失败:', error);
        }
    },
    removeItem: (key) => {
        try {
            if (typeof wx !== 'undefined' && wx.removeStorageSync) {
                wx.removeStorageSync(key);
            }
        }
        catch (error) {
            console.error('微信存储删除失败:', error);
        }
    },
};
function createPiniaStorageAdapter(store, tokenKey = 'accessToken') {
    return {
        getItem: (key) => {
            try {
                return store.state[tokenKey] || null;
            }
            catch (error) {
                console.error('Pinia 存储读取失败:', error);
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                store.commit('SET_TOKEN', { key: tokenKey, value });
            }
            catch (error) {
                console.error('Pinia 存储设置失败:', error);
            }
        },
        removeItem: (key) => {
            try {
                store.commit('CLEAR_TOKEN', { key: tokenKey });
            }
            catch (error) {
                console.error('Pinia 存储删除失败:', error);
            }
        },
    };
}
function createVuexStorageAdapter(store, tokenKey = 'accessToken') {
    return {
        getItem: (key) => {
            try {
                return store.state[tokenKey] || null;
            }
            catch (error) {
                console.error('Vuex 存储读取失败:', error);
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                store.commit('SET_TOKEN', { key: tokenKey, value });
            }
            catch (error) {
                console.error('Vuex 存储设置失败:', error);
            }
        },
        removeItem: (key) => {
            try {
                store.commit('CLEAR_TOKEN', { key: tokenKey });
            }
            catch (error) {
                console.error('Vuex 存储删除失败:', error);
            }
        },
    };
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759544, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createWechatRequestAdapter = createWechatRequestAdapter;
function createWechatRequestAdapter(config = {}) {
    const { timeout = 60000 } = config;
    return async function wechatRequest(options) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: options.url,
                method: options.method,
                header: options.headers,
                data: options.data,
                timeout,
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    }
                    else {
                        reject(new Error(`请求失败：${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    const error = new Error(err.errMsg || '网络请求失败');
                    error.statusCode = err.statusCode;
                    reject(error);
                },
            });
        });
    };
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759545, function(require, module, exports) {

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
__exportStar(require("./common"), exports);
__exportStar(require("./auth"), exports);

}, function(modId) { var map = {"./common":1778568759546,"./auth":1778568759547}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759546, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778568759547, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778568759540);
})()
//# sourceMappingURL=index.js.map