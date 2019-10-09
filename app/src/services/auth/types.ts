export interface AuthenticatedUser {
    id: number | string
}

export interface AuthService {
    getCurrentUser(): Promise<AuthenticatedUser | null>
}
