import { useState } from 'react'
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import Footer from '../../components/Footer'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(identifier, password)

            // Get user data to determine role-based redirect
            const user = authService.getCurrentUser()

            if (user) {
                // Redirect based on user role
                const redirectPath = user.role === 'DRIVER' ? '/driver-dashboard' : '/ride-request-page'
                navigate(redirectPath)
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        // Pass the redirect URL to navigate to after successful Google login
        // The backend should handle role-based redirects for Google login
        authService.googleLogin('/ride-request-page')
    }

    return (
        <div className="auth-background d-flex flex-column">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col xs={12} md={8} lg={6} xl={5} className="py-5">
                            <div className="mb-4 text-center">
                                <Link to="/" className="text-decoration-none">
                                    <h1 className="text-white fw-bold display-4">Via<span className="text-viago-green">GO</span></h1>
                                </Link>
                                <p className="text-white-50 fs-5">Welcome back to your journey</p>
                            </div>

                            <Card className="auth-card p-4">
                                <Card.Body>
                                    {error && <Alert variant="danger" className="bg-danger text-white border-0">{error}</Alert>}

                                    <Form onSubmit={handleLogin}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="text-white-50 small">Mobile Number or Email</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter email or mobile"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                className="form-control-viago"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="text-white-50 small">Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-control-viago"
                                                required
                                            />
                                        </Form.Group>

                                        <Button
                                            type="submit"
                                            className="btn-viago-primary w-100 mb-3"
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : 'Login'}
                                        </Button>

                                        <div className="text-center text-secondary mb-3 small">OR</div>

                                        <Button
                                            variant="outline-light"
                                            className="w-100 d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleGoogleLogin}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Continue with Google
                                        </Button>
                                    </Form>

                                    <div className="text-center mt-4 text-secondary small">
                                        Don't have an account? <Link to="/signup" className="text-viago-green text-decoration-none">Sign up</Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Footer />
        </div>
    )
}

export default Login
