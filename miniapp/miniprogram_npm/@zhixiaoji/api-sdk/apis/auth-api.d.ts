import type { HttpClient } from '../client/http-client';
import type { MiniappLoginRequest, MiniappLoginResponse, TokenRefreshRequest, TokenRefreshResponse, AdminLoginRequest, AdminLoginResponse, UserProfile, UpdateUserRequest, UpdateUserResponse, AdminUserItem, UpdateUserStatusRequest, UpdateUserStatusResponse } from '../types/auth';
import type { ApiResponse, PaginatedData, AdminUserQueryParams } from '../types/common';
export declare class AuthApi {
    private readonly client;
    constructor(client: HttpClient);
    miniappLogin(data: MiniappLoginRequest): Promise<ApiResponse<MiniappLoginResponse>>;
    refreshToken(data: TokenRefreshRequest): Promise<ApiResponse<TokenRefreshResponse>>;
    adminLogin(data: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>>;
    logout(): Promise<ApiResponse<null>>;
    getProfile(): Promise<ApiResponse<UserProfile>>;
    getAdminProfile(): Promise<ApiResponse<AdminLoginResponse['admin']>>;
    updateProfile(userId: string, data: UpdateUserRequest): Promise<ApiResponse<UpdateUserResponse>>;
    getUsers(params?: AdminUserQueryParams): Promise<ApiResponse<PaginatedData<AdminUserItem>>>;
    updateUserStatus(userId: string, data: UpdateUserStatusRequest): Promise<ApiResponse<UpdateUserStatusResponse>>;
}
