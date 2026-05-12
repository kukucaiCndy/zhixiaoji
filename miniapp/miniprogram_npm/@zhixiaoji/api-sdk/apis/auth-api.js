"use strict";
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
