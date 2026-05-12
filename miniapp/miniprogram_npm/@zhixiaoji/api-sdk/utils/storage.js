"use strict";
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
