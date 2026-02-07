// TypeScript interfaces for API requests and responses
interface SignupRequest {
    username: string
    email: string
    password: string
    role: 'RIDER' | 'DRIVER' | 'ADMIN' | 'EMPLOYEE'
    vehicle?: VehicleDTO
}

interface VehicleDTO {
    vehicleType: string
    model: string
    seatCount: number
    registrationNumber: string
}

interface LoginRequest {
    identifier: string
    password: string
}

interface AuthResponse {
    success: boolean
    message: string
    jwtToken?: string
    refreshToken?: string
    tokenType?: string
    expiresIn?: number
    timestamp?: string
    data?: UserData
}

interface UserData {
    userId: number
    username: string
    email: string
    role: string
    enabled: boolean
}

const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/auth'

export const authService = {
    /**
     * Register a new user with email/password
     */
    signup: async (
        username: string,
        email: string,
        password: string,
        role: 'RIDER' | 'DRIVER' = 'RIDER'
    ): Promise<AuthResponse> => {
        try {
            const requestBody: SignupRequest = {
                username,
                email,
                password,
                role
            }

            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            const data: AuthResponse = await response.json()

            if (data.success && data.jwtToken) {
                // Store authentication data
                localStorage.setItem('jwtToken', data.jwtToken)
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken)
                }
                if (data.data) {
                    localStorage.setItem('user', JSON.stringify(data.data))
                }
            }

            return data
        } catch (error) {
            console.error('Signup error:', error)
            throw new Error('Network error. Please check your connection and try again.')
        }
    },

    /**
     * Login existing user with username/email and password
     */
    login: async (identifier: string, password: string): Promise<AuthResponse> => {
        try {
            const requestBody: LoginRequest = {
                identifier,
                password
            }

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            const data: AuthResponse = await response.json()

            if (data.success && data.jwtToken) {
                // Store authentication data
                localStorage.setItem('jwtToken', data.jwtToken)
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken)
                }
                if (data.data) {
                    localStorage.setItem('user', JSON.stringify(data.data))
                }
            }

            return data
        } catch (error) {
            console.error('Login error:', error)
            throw new Error('Network error. Please check your connection and try again.')
        }
    },

    /**
     * Initiate Google OAuth login flow
     * @param redirectPath - Path to redirect to after successful login (default: '/')
     */
    googleLogin: (redirectPath: string = '/') => {
        // Encode the redirect path to pass to backend
        const encodedRedirect = encodeURIComponent(redirectPath)
        window.location.href = `${API_BASE_URL}/google/login?redirect=${encodedRedirect}`
    },

    /**
     * Initiate Google OAuth signup flow
     * @param redirectPath - Path to redirect to after successful signup (default: '/')
     */
    googleSignup: (redirectPath: string = '/') => {
        // Encode the redirect path to pass to backend
        const encodedRedirect = encodeURIComponent(redirectPath)
        window.location.href = `${API_BASE_URL}/google/signup?redirect=${encodedRedirect}`
    },

    /**
     * Logout user and clear stored data
     */
    logout: () => {
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: (): UserData | null => {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('jwtToken')
    },

    /**
     * Get authorization header for API requests
     */
    getAuthHeader: (): { Authorization: string } | {} => {
        const token = localStorage.getItem('jwtToken')
        return token ? { Authorization: `Bearer ${token}` } : {}
    }
}

