import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Modal, Badge, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaCar, FaHistory, FaWallet, FaSignOutAlt, FaMapMarkerAlt, FaBars, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useWebSocket } from '../../hooks/useWebSocket'
import { TEST_CONFIG } from '../../config/testConfig'

// TypeScript interfaces
interface RideOffer {
    rideId: number
    pickupAddress: string
    dropAddress: string
    price: number
    riderId: number
    riderName: string
}

const DriverDashboard = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // WebSocket connection
    const { isConnected, error: wsError, subscribe, publish } = useWebSocket(TEST_CONFIG.WEBSOCKET.url)

    // Driver online/offline state
    const [isOnline, setIsOnline] = useState(false)
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Ride offer state
    const [currentOffer, setCurrentOffer] = useState<RideOffer | null>(null)
    const [showOfferModal, setShowOfferModal] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Subscribe to driver offers when connected
    useEffect(() => {
        if (isConnected) {
            console.log('🔌 Driver WebSocket connected, subscribing to offers...');
            // Use topic-based subscription instead of user queue
            const driverId = TEST_CONFIG.DRIVER.id;
            const subscription = subscribe(`/topic/driver-offers/${driverId}`, (message) => {
                console.log('📨 RAW MESSAGE RECEIVED:', message);
                console.log('📨 MESSAGE BODY:', message.body);
                try {
                    const offer: RideOffer = JSON.parse(message.body)
                    console.log('🚗 Parsed ride offer:', offer)
                    setCurrentOffer(offer)
                    setShowOfferModal(true)
                } catch (err) {
                    console.error('❌ Error parsing ride offer:', err)
                    console.error('❌ Message body was:', message.body)
                }
            })

            if (subscription) {
                console.log(`✅ Successfully subscribed to /topic/driver-offers/${driverId}`);
            } else {
                console.error(`❌ Failed to subscribe to /topic/driver-offers/${driverId}`);
            }

            return () => {
                console.log('🔌 Unsubscribing from driver offers');
                subscription?.unsubscribe()
            }
        } else {
            console.log('⚠️ WebSocket not connected, cannot subscribe');
        }
    }, [isConnected, subscribe])

    // Handle going online/offline
    const toggleOnlineStatus = () => {
        if (isOnline) {
            // Going offline
            setIsOnline(false)
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current)
                locationIntervalRef.current = null
            }
            console.log('📴 Driver went offline')
        } else {
            // Going online
            setIsOnline(true)

            // Send location updates every 5 seconds
            locationIntervalRef.current = setInterval(() => {
                // Use hardcoded driver location from test config with small random variations
                const baseLat = TEST_CONFIG.DRIVER.location.lat
                const baseLng = TEST_CONFIG.DRIVER.location.lng
                const randomOffset = () => (Math.random() - 0.5) * 0.005 // ~250m radius

                const locationUpdate = {
                    driverId: TEST_CONFIG.DRIVER.id,
                    lat: baseLat + randomOffset(),
                    lng: baseLng + randomOffset()
                }

                publish('/app/driver-update', locationUpdate)
            }, TEST_CONFIG.LOCATION_UPDATE_INTERVAL)

            console.log('✅ Driver went online')
        }
    }

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current)
            }
        }
    }, [])

    // Handle accepting a ride
    const handleAcceptRide = () => {
        if (!currentOffer) return

        const acceptPayload = {
            rideId: currentOffer.rideId,
            driverId: TEST_CONFIG.DRIVER.id,
            status: 'ACCEPTED'
        }

        publish('/app/accept-ride', acceptPayload)
        setShowOfferModal(false)
        setCurrentOffer(null)
        console.log('✅ Ride accepted:', acceptPayload)
    }

    // Handle declining a ride
    const handleDeclineRide = () => {
        setShowOfferModal(false)
        setCurrentOffer(null)
        console.log('❌ Ride declined')
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

                    {/* WebSocket Connection Status */}
                    <Col xs={12}>
                        {wsError && (
                            <Alert variant="danger" className="mb-3">
                                <strong>Connection Error:</strong> {wsError}
                            </Alert>
                        )}
                        {!isConnected && !wsError && (
                            <Alert variant="warning" className="mb-3">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Connecting to server...
                            </Alert>
                        )}
                        {isConnected && (
                            <Alert variant="success" className="mb-3 d-flex align-items-center">
                                <FaCheckCircle className="me-2" />
                                Connected to ViaGO Network
                            </Alert>
                        )}
                    </Col>

                    {/* Go Online/Offline Section */}
                    <Col xs={12}>
                        <Card className="border" style={{ borderColor: '#e5e7eb' }}>
                            <Card.Body className="text-center py-4 py-md-5">
                                <div className="mb-3 mb-md-4">
                                    <div className="d-inline-flex p-3 p-md-4 rounded-circle" style={{
                                        backgroundColor: isOnline ? '#10b981' : '#000000'
                                    }}>
                                        <FaMapMarkerAlt style={{ color: isOnline ? '#000' : '#10b981' }} className="fs-3 fs-md-1" />
                                    </div>
                                </div>
                                <h4 className="mb-3 fw-bold fs-5 fs-md-4">
                                    {isOnline ? "You're online and ready!" : "You're currently offline"}
                                </h4>
                                <p className="text-muted mb-3 mb-md-4 small">
                                    {isOnline
                                        ? "Broadcasting your location. Waiting for ride requests..."
                                        : "Go online to start receiving ride requests from nearby passengers"
                                    }
                                </p>
                                {isOnline && (
                                    <Badge bg="success" className="mb-3 px-3 py-2">
                                        <Spinner animation="grow" size="sm" className="me-2" />
                                        Location Broadcasting Active
                                    </Badge>
                                )}
                                <div>
                                    <Button
                                        onClick={toggleOnlineStatus}
                                        disabled={!isConnected}
                                        className="px-4 px-md-5 py-2 py-md-3 fw-semibold border-0"
                                        style={{
                                            backgroundColor: isOnline ? '#dc3545' : '#10b981',
                                            color: isOnline ? '#fff' : '#000',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = isOnline ? '#bb2d3b' : '#059669'
                                            e.currentTarget.style.transform = 'scale(1.02)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = isOnline ? '#dc3545' : '#10b981'
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                    >
                                        {isOnline ? 'Go Offline' : 'Go Online'}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Ride Offer Modal */}
                    <Modal show={showOfferModal} onHide={handleDeclineRide} centered size="lg">
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="fw-bold">New Ride Request</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="px-4 py-4">
                            {currentOffer && (
                                <>
                                    <div className="mb-4 p-4 bg-light rounded-3">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-success rounded-circle p-2 me-3">
                                                <FaMapMarkerAlt className="text-white" size={20} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="text-muted d-block">PICKUP</small>
                                                <strong>{currentOffer.pickupAddress}</strong>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-danger rounded-circle p-2 me-3">
                                                <FaMapMarkerAlt className="text-white" size={20} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="text-muted d-block">DROP-OFF</small>
                                                <strong>{currentOffer.dropAddress}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-success bg-opacity-10 rounded-3">
                                        <div>
                                            <small className="text-muted d-block">PASSENGER</small>
                                            <strong>{currentOffer.riderName}</strong>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted d-block">FARE</small>
                                            <h3 className="mb-0 text-success fw-bold">LKR {currentOffer.price}</h3>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3">
                                        <Button
                                            variant="outline-secondary"
                                            className="flex-grow-1 py-3 fw-semibold"
                                            onClick={handleDeclineRide}
                                        >
                                            <FaTimesCircle className="me-2" />
                                            Decline
                                        </Button>
                                        <Button
                                            variant="success"
                                            className="flex-grow-1 py-3 fw-semibold"
                                            onClick={handleAcceptRide}
                                        >
                                            <FaCheckCircle className="me-2" />
                                            Accept Ride
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Modal.Body>
                    </Modal>

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
