import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

interface UserData {
    userId: number
    username: string
    email: string
    role: string
    enabled: boolean
}

interface AuthContextType {
    user: UserData | null
    loading: boolean
    login: (identifier: string, password: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        setLoading(false)
    }, [])

    const login = async (identifier: string, password: string) => {
        const response = await authService.login(identifier, password)

        if (response.success && response.data) {
            setUser(response.data)
        } else {
            throw new Error(response.message || 'Login failed')
        }
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
