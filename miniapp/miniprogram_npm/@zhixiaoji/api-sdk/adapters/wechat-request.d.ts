import type { RequestAdapter } from '../client/http-client';
export interface WechatRequestConfig {
    timeout?: number;
}
export declare function createWechatRequestAdapter(config?: WechatRequestConfig): RequestAdapter;
