import { useState } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaCar, FaHistory, FaWallet, FaSignOutAlt, FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa'

const DriverDashboard = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#ffffff' }}>
            {/* Minimalistic Header */}
            <div style={{
                backgroundColor: '#000000',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <Container>
                    {/* Top Bar */}
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0 text-white fw-bold fs-4">
                            Via<span style={{ color: '#10b981' }}>GO</span>
                        </h2>

                        {/* Desktop Menu */}
                        <div className="d-none d-md-flex align-items-center gap-3">
                            <span className="text-white small">
                                {user?.username}
                            </span>
                            <Button
                                onClick={handleLogout}
                                size="sm"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid #10b981',
                                    color: '#10b981',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981'
                                    e.currentTarget.style.color = '#000'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = '#10b981'
                                }}
                            >
                                <FaSignOutAlt className="me-2" />
                                Logout
                            </Button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="d-md-none border-0 bg-transparent text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="d-md-none pb-3">
                            <div className="text-white small mb-2">Welcome, {user?.username}</div>
                            <Button
                                onClick={handleLogout}
                                size="sm"
                                className="w-100"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid #10b981',
                                    color: '#10b981'
                                }}
                            >
                                <FaSignOutAlt className="me-2" />
                                Logout
                            </Button>
                        </div>
                    )}

                    {/* Navigation Tabs - Desktop */}
                    <div className="d-none d-md-flex gap-3 pb-3 border-top border-secondary pt-3">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="border-0 px-4 py-2 fw-semibold"
                            style={{
                                backgroundColor: activeTab === 'dashboard' ? '#10b981' : 'transparent',
                                color: activeTab === 'dashboard' ? '#000' : '#fff',
                                transition: 'all 0.2s ease',
                                borderBottom: activeTab === 'dashboard' ? '2px solid #10b981' : '2px solid transparent'
                            }}
                        >
                            <FaCar className="me-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/driver-history')}
                            className="border-0 px-4 py-2 fw-semibold"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                        >
                            <FaHistory className="me-2" />
                            History
                        </button>
                        <button
                            onClick={() => navigate('/driver-earnings')}
                            className="border-0 px-4 py-2 fw-semibold"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                        >
                            <FaWallet className="me-2" />
                            Earnings
                        </button>
                    </div>

                    {/* Navigation Tabs - Mobile */}
                    <div className="d-md-none d-flex gap-2 pb-3 overflow-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="border-0 px-3 py-2 fw-semibold text-nowrap"
                            style={{
                                backgroundColor: activeTab === 'dashboard' ? '#10b981' : '#1a1a1a',
                                color: activeTab === 'dashboard' ? '#000' : '#fff',
                                fontSize: '0.875rem'
                            }}
                        >
                            <FaCar className="me-1" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/driver-history')}
                            className="border-0 px-3 py-2 fw-semibold text-nowrap"
                            style={{
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                fontSize: '0.875rem'
                            }}
                        >
                            <FaHistory className="me-1" />
                            History
                        </button>
                        <button
                            onClick={() => navigate('/driver-earnings')}
                            className="border-0 px-3 py-2 fw-semibold text-nowrap"
                            style={{
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                fontSize: '0.875rem'
                            }}
                        >
                            <FaWallet className="me-1" />
                            Earnings
                        </button>
                    </div>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="py-4">
                <Row className="g-3 g-md-4">
                    {/* Stats Cards - Commented out for now */}
                    {/* <Col xs={12} sm={6} md={4}>
                        <Card className="border h-100" style={{
                            borderColor: '#e5e7eb',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#10b981'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#f3f4f6' }}>
                                        <FaCar style={{ color: '#10b981' }} className="fs-4" />
                                    </div>
                                    <div>
                                        <div className="text-muted small">Today's Rides</div>
                                        <h3 className="mb-0 fw-bold">0</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} md={4}>
                        <Card className="border h-100" style={{
                            borderColor: '#e5e7eb',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#10b981'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#f3f4f6' }}>
                                        <FaWallet style={{ color: '#10b981' }} className="fs-4" />
                                    </div>
                                    <div>
                                        <div className="text-muted small">Today's Earnings</div>
                                        <h3 className="mb-0 fw-bold">LKR 0</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} md={4}>
                        <Card className="border h-100" style={{
                            borderColor: '#e5e7eb',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#10b981'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#f3f4f6' }}>
                                        <FaHistory style={{ color: '#10b981' }} className="fs-4" />
                                    </div>
                                    <div>
                                        <div className="text-muted small">Total Rides</div>
                                        <h3 className="mb-0 fw-bold">0</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col> */}

                    {/* Go Online Section */}
                    <Col xs={12}>
                        <Card className="border" style={{ borderColor: '#e5e7eb' }}>
                            <Card.Body className="text-center py-4 py-md-5">
                                <div className="mb-3 mb-md-4">
                                    <div className="d-inline-flex p-3 p-md-4 rounded-circle" style={{
                                        backgroundColor: '#000000'
                                    }}>
                                        <FaMapMarkerAlt style={{ color: '#10b981' }} className="fs-3 fs-md-1" />
                                    </div>
                                </div>
                                <h4 className="mb-3 fw-bold fs-5 fs-md-4">You're currently offline</h4>
                                <p className="text-muted mb-3 mb-md-4 small">
                                    Go online to start receiving ride requests from nearby passengers
                                </p>
                                <Button
                                    className="px-4 px-md-5 py-2 py-md-3 fw-semibold border-0"
                                    style={{
                                        backgroundColor: '#10b981',
                                        color: '#000',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#059669'
                                        e.currentTarget.style.transform = 'scale(1.02)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#10b981'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                                >
                                    Go Online
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Recent Activity - Commented out for now */}
                    {/* <Col xs={12}>
                        <Card className="border" style={{ borderColor: '#e5e7eb' }}>
                            <Card.Header className="bg-white border-bottom" style={{ borderColor: '#e5e7eb' }}>
                                <h5 className="mb-0 fw-bold fs-6 fs-md-5">Recent Activity</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="text-center py-4 py-md-5">
                                    <FaHistory className="fs-2 fs-md-1 mb-3" style={{ color: '#d1d5db' }} />
                                    <p className="text-muted small mb-0">No recent activity. Go online to start earning!</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col> */}
                </Row>
            </Container>
        </div>
    )
}

export default DriverDashboard
