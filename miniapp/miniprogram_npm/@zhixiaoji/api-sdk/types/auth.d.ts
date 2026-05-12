export interface MiniappLoginRequest {
    code: string;
}
export interface TokenRefreshRequest {
    refreshToken: string;
}
export interface AdminLoginRequest {
    username: string;
    password: string;
}
export interface UpdateUserRequest {
    nickname?: string;
    avatarUrl?: string;
}
export interface UpdateUserStatusRequest {
    status: 'normal' | 'disabled';
}
export interface UserInfo {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
}
export interface AdminInfo {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface MiniappLoginResponse extends LoginResponse {
    user: UserInfo;
}
export interface AdminLoginResponse extends LoginResponse {
    admin: AdminInfo;
}
export interface TokenRefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface UserProfile {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    level: number;
    points: number;
    learnedCards: number;
    createdAt: string;
    lastActiveAt: string | null;
}
export interface AdminUserItem {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    level: number;
    points: number;
    learnedCards: number;
    status: string;
    registeredAt: string;
    lastActiveAt: string | null;
}
export interface UpdateUserResponse {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
}
export interface UpdateUserStatusResponse {
    id: string;
    status: string;
}
