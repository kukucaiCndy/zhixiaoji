/**
 * @zhixiaoji/api-sdk v0.3.0 — miniprogram inline bundle
 * 手动内联构建，消除所有 require() 调用
 */
(function () {
  var exports = {};
  var http_client_exports = {};
  var auth_api_exports = {};
  var storage_exports = {};
  var wechat_request_exports = {};
  var types_exports = {};

  Object.defineProperty(http_client_exports, "__esModule", { value: true });

  // ==================== client/http-client.js ====================
  var HttpClient = /** @class */ (function () {
    function HttpClient(config) {
      this.baseURL = config.baseURL.replace(/\/$/, '');
      this.storage = config.storage;
      this.onAuthError = config.onAuthError;
      this.requestAdapter = config.requestAdapter || this.defaultRequestAdapter.bind(this);
    }
    HttpClient.prototype.getToken = function () {
      return this.storage.getItem('accessToken');
    };
    HttpClient.prototype.setToken = function (token) {
      return this.storage.setItem('accessToken', token);
    };
    HttpClient.prototype.clearToken = function () {
      return this.storage.removeItem('accessToken');
    };
    HttpClient.prototype.defaultRequestAdapter = function (options) {
      var url = options.url;
      return new Promise(function (resolve, reject) {
        wx.request({
          url: url,
          method: options.method || 'GET',
          header: options.headers,
          data: options.data,
          timeout: 60000,
          success: function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data);
            } else {
              reject({ statusCode: res.statusCode });
            }
          },
          fail: function (err) { reject(err); }
        });
      });
    };
    HttpClient.prototype.request = function (method, path, body, params) {
      var _this = this;
      return Promise.resolve().then(function () {
        var url = _this.baseURL + path;
        if (params) {
          var parts = [];
          Object.keys(params).forEach(function (key) {
            if (params[key] !== undefined && params[key] !== null) {
              parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])));
            }
          });
          if (parts.length > 0) {
            url += (url.indexOf('?') > -1 ? '&' : '?') + parts.join('&');
          }
        }
        var headers = { 'Content-Type': 'application/json' };
        return Promise.resolve(_this.getToken()).then(function (token) {
          if (token) {
            headers['Authorization'] = 'Bearer ' + token;
          }
          return _this.requestAdapter({ url: url, method: method, headers: headers, data: body });
        }).then(function (response) {
          if (response.code === 401 || response.statusCode === 401) {
            _this.clearToken();
            if (_this.onAuthError) _this.onAuthError();
          }
          return response;
        }).catch(function (error) {
          if (error && (error.statusCode === 401 || error.status === 401)) {
            _this.clearToken();
            if (_this.onAuthError) _this.onAuthError();
          }
          throw error;
        });
      });
    };
    HttpClient.prototype.get = function (path, params) {
      return this.request('GET', path, undefined, params);
    };
    HttpClient.prototype.post = function (path, body) {
      return this.request('POST', path, body);
    };
    HttpClient.prototype.patch = function (path, body) {
      return this.request('PATCH', path, body);
    };
    HttpClient.prototype.delete = function (path) {
      return this.request('DELETE', path);
    };
    return HttpClient;
  }());
  http_client_exports.HttpClient = HttpClient;

  // ==================== apis/auth-api.js ====================
  Object.defineProperty(auth_api_exports, "__esModule", { value: true });
  var AuthApi = /** @class */ (function () {
    function AuthApi(client) { this.client = client; }
    AuthApi.prototype.miniappLogin = function (data) { return this.client.post('/auth/miniapp/login', data); };
    AuthApi.prototype.refreshToken = function (data) { return this.client.post('/auth/token/refresh', data); };
    AuthApi.prototype.adminLogin = function (data) { return this.client.post('/auth/admin/login', data); };
    AuthApi.prototype.logout = function () { return this.client.post('/auth/logout'); };
    AuthApi.prototype.getProfile = function () { return this.client.get('/auth/me'); };
    AuthApi.prototype.getAdminProfile = function () { return this.client.get('/auth/admin/me'); };
    AuthApi.prototype.updateProfile = function (userId, data) { return this.client.patch('/auth/users/' + userId, data); };
    AuthApi.prototype.getUsers = function (params) { return this.client.get('/auth/admin/users', params); };
    AuthApi.prototype.updateUserStatus = function (userId, data) { return this.client.patch('/auth/admin/users/' + userId + '/status', data); };
    return AuthApi;
  }());
  auth_api_exports.AuthApi = AuthApi;

  // ==================== utils/storage.js ====================
  Object.defineProperty(storage_exports, "__esModule", { value: true });
  var wechatStorageAdapter = {
    getItem: function (key) {
      try { if (typeof wx !== 'undefined' && wx.getStorageSync) { var val = wx.getStorageSync(key); return val || null; } } catch (e) {}
      return null;
    },
    setItem: function (key, value) {
      try { if (typeof wx !== 'undefined' && wx.setStorageSync) { wx.setStorageSync(key, value); } } catch (e) {}
    },
    removeItem: function (key) {
      try { if (typeof wx !== 'undefined' && wx.removeStorageSync) { wx.removeStorageSync(key); } } catch (e) {}
    }
  };
  storage_exports.wechatStorageAdapter = wechatStorageAdapter;
  storage_exports.localStorageAdapter = {
    getItem: function (key) {
      try { if (typeof localStorage !== 'undefined') { return localStorage.getItem(key); } } catch (e) {}
      return null;
    },
    setItem: function (key, value) {
      try { if (typeof localStorage !== 'undefined') { localStorage.setItem(key, value); } } catch (e) {}
    },
    removeItem: function (key) {
      try { if (typeof localStorage !== 'undefined') { localStorage.removeItem(key); } } catch (e) {}
    }
  };

  // ==================== adapters/wechat-request.js ====================
  Object.defineProperty(wechat_request_exports, "__esModule", { value: true });
  function createWechatRequestAdapter(config) {
    if (config === void 0) { config = {}; }
    var timeout = config.timeout || 60000;
    return function wechatRequest(options) {
      return new Promise(function (resolve, reject) {
        wx.request({
          url: options.url,
          method: options.method,
          header: options.headers,
          data: options.data,
          timeout: timeout,
          success: function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) { resolve(res.data); }
            else { reject(new Error('请求失败：' + res.statusCode)); }
          },
          fail: function (err) {
            var error = new Error(err.errMsg || '网络请求失败');
            error.statusCode = err.statusCode;
            reject(error);
          }
        });
      });
    };
  }

  // ==================== types (empty placeholder) ====================
  Object.defineProperty(types_exports, "__esModule", { value: true });

  // ==================== Main: index.js ====================
  function createApiClient(config) {
    if (config === void 0) { config = {}; }
    var client = new HttpClient({
      baseURL: config.baseURL || '/api/v1',
      storage: config.storage || storage_exports.localStorageAdapter,
      requestAdapter: config.requestAdapter,
      onAuthError: config.onAuthError
    });
    return {
      client: client,
      auth: new AuthApi(client),
      setToken: function (token) { return client.setToken(token); },
      clearToken: function () { return client.clearToken(); }
    };
  }

  function createWechatApiClient(options) {
    return createApiClient({
      baseURL: options.baseURL,
      storage: storage_exports.wechatStorageAdapter,
      requestAdapter: createWechatRequestAdapter({ timeout: options.timeout }),
      onAuthError: options.onAuthError
    });
  }

  function createVue3ApiClient(options) {
    var storage = storage_exports.localStorageAdapter;
    return createApiClient({
      baseURL: options.baseURL,
      storage: storage,
      onAuthError: options.onAuthError
    });
  }

  module.exports = {
    HttpClient: HttpClient,
    AuthApi: AuthApi,
    createApiClient: createApiClient,
    createWechatApiClient: createWechatApiClient,
    createVue3ApiClient: createVue3ApiClient,
    createWechatRequestAdapter: createWechatRequestAdapter,
    wechatStorageAdapter: storage_exports.wechatStorageAdapter,
    localStorageAdapter: storage_exports.localStorageAdapter
  };
})();