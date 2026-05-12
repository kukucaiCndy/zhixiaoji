"use strict";
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
