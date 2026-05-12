"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
class HttpClient {
    constructor(config) {
        this.baseURL = config.baseURL.replace(/\/$/, '');
        this.storage = config.storage;
        this.onAuthError = config.onAuthError;
        this.requestAdapter = config.requestAdapter || this.defaultRequestAdapter.bind(this);
    }
    getToken() {
        return this.storage.getItem('accessToken');
    }
    setToken(token) {
        return this.storage.setItem('accessToken', token);
    }
    clearToken() {
        return this.storage.removeItem('accessToken');
    }
    async defaultRequestAdapter(options) {
        const url = new URL(options.url);
        const response = await fetch(url.toString(), {
            method: options.method,
            headers: options.headers,
            body: options.data ? JSON.stringify(options.data) : undefined,
        });
        return response.json();
    }
    async request(method, path, body, params) {
        let url = `${this.baseURL}${path}`;
        if (params) {
            const queryString = Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join('&');
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }
        const headers = {
            'Content-Type': 'application/json',
        };
        const token = await this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const response = await this.requestAdapter({
                url,
                method: method,
                headers,
                data: body,
            });
            if (response.code === 401 || response.statusCode === 401) {
                await this.clearToken();
                this.onAuthError?.();
            }
            return response;
        }
        catch (error) {
            if (error.statusCode === 401 || error.status === 401) {
                await this.clearToken();
                this.onAuthError?.();
            }
            throw error;
        }
    }
    async get(path, params) {
        return this.request('GET', path, undefined, params);
    }
    async post(path, body) {
        return this.request('POST', path, body);
    }
    async patch(path, body) {
        return this.request('PATCH', path, body);
    }
    async delete(path) {
        return this.request('DELETE', path);
    }
}
exports.HttpClient = HttpClient;
