import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRole?: string
}

/**
 * ProtectedRoute component that checks if user is authenticated
 * and optionally verifies their role before rendering protected content.
 * Redirects to login if not authenticated, or to appropriate dashboard if wrong role.
 */
const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-viago-black">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // If a specific role is required, check if user has that role
    if (allowedRole && user.role !== allowedRole) {
        // Redirect to appropriate dashboard based on user's actual role
        const redirectPath = user.role === 'DRIVER' ? '/driver-dashboard' : '/ride-request-page'
        return <Navigate to={redirectPath} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
