import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * ProtectedRoute component that checks if user is authenticated
 * before rendering the protected content. Redirects to login if not authenticated.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    if (!authService.isAuthenticated()) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
