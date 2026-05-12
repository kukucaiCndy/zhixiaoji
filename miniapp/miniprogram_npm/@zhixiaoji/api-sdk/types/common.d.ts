export interface ApiResponse<T = any> {
    code: number;
    data: T | null;
    message: string;
    details?: Record<string, any>;
}
export interface PaginatedData<T = any> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface AdminUserQueryParams extends PaginationParams {
    keyword?: string;
    status?: 'normal' | 'disabled';
    level?: number;
    startDate?: string;
    endDate?: string;
    lastActiveStartDate?: string;
    lastActiveEndDate?: string;
}
