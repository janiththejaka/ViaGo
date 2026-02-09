import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Modal, Badge, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaCar, FaHistory, FaWallet, FaSignOutAlt, FaMapMarkerAlt, FaBars, FaTimes, FaCheckCircle, FaTimesCircle, FaUserCircle } from 'react-icons/fa'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useRealLocation } from '../../hooks/useRealLocation'
import { API_CONFIG } from '../../config/apiConfig'

// Helper functions removed as they are no longer used


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
    const { user: authUser, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Get driver ID from auth context
    const driverId = authUser?.userId;
    const [driverData, setDriverData] = useState<any>(null);

    // Fetch driver data from backend
    useEffect(() => {
        const fetchDriverProfile = async () => {
            if (driverId) {
                try {
                    // TODO: Replace with actual API call to User Service
                    // const response = await fetch(`${API_CONFIG.USER_URL}/${driverId}`);
                    // const data = await response.json();

                    // For now, simulating fetch or using auth user data + placeholders
                    // We need the backend to provide vehicle details
                    setDriverData({
                        id: driverId,
                        name: authUser?.username || 'Unknown Driver',
                        vehicleNo: 'ABC-1234', // Placeholder until User Service provides this
                        vehicleModel: 'Tuk Tuk', // Placeholder
                        phone: '0771234567', // Placeholder
                        location: { lat: 6.9271, lng: 79.8612 } // Default Colombo
                    });
                } catch (error) {
                    console.error('Failed to fetch driver profile', error);
                }
            }
        };
        fetchDriverProfile();
    }, [driverId, authUser]);



    console.log('🚗 Driver Dashboard initialized for:', driverData?.name, '(ID:', driverId, ')');

    // WebSocket connection
    const { isConnected, error: wsError, subscribe, publish } = useWebSocket(API_CONFIG.WEBSOCKET_URL)

    // Driver online/offline state
    const [isOnline, setIsOnline] = useState(false)
    const [statusMessage, setStatusMessage] = useState('You are currently Offline')
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Ride offer state
    const [currentOffer, setCurrentOffer] = useState<RideOffer | null>(null)
    const currentOfferRef = useRef<RideOffer | null>(null) // Ref to avoid closure issues
    const [showOfferModal, setShowOfferModal] = useState(false)

    // Accepted ride state
    const [acceptedRide, setAcceptedRide] = useState<RideOffer | null>(null)
    const [rideStatus, setRideStatus] = useState<'IDLE' | 'ACCEPTED' | 'PICKED_UP' | 'ON_TRIP'>('IDLE')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Subscribe to driver offers ONLY when driver is online
    useEffect(() => {
        if (isConnected && isOnline) {
            console.log(`Driver ${driverId} (${driverData?.name}) is ONLINE - subscribing to offers...`);

            const subscription = subscribe(`/topic/driver-offers/${driverId}`, (message) => {
                console.log(`[Driver ${driverId}] RAW MESSAGE RECEIVED:`, message);
                console.log(`[Driver ${driverId}] MESSAGE BODY:`, message.body);
                try {
                    const offer: RideOffer = JSON.parse(message.body)
                    console.log(`[Driver ${driverId}] Parsed ride offer:`, offer)
                    currentOfferRef.current = offer // Store in ref
                    setCurrentOffer(offer)
                    setShowOfferModal(true)
                } catch (err) {
                    console.error(`[Driver ${driverId}] Error parsing ride offer:`, err)
                    console.error(`[Driver ${driverId}] Message body was:`, message.body)
                }
            })

            if (subscription) {
                console.log(`[Driver ${driverId}] Successfully subscribed to /topic/driver-offers/${driverId}`);
            } else {
                console.error(`[Driver ${driverId}] Failed to subscribe to /topic/driver-offers/${driverId}`);
            }

            return () => {
                console.log(`[Driver ${driverId}] Unsubscribing from driver offers`);
                subscription?.unsubscribe()
            }
        } else if (isConnected && !isOnline) {
            console.log(`[Driver ${driverId}] Driver is OFFLINE - not subscribing to offers`);
        } else {
            console.log(`[Driver ${driverId}] WebSocket not connected`);
        }
    }, [isConnected, isOnline, subscribe, driverId, driverData?.name])

    // Subscribe to driver notifications
    useEffect(() => {
        if (isConnected) {
            console.log(`[Driver ${driverId}] Subscribing to notifications...`);
            const notifySub = subscribe(`/topic/driver-notify/${driverId}`, (message) => {
                const msg = message.body;
                console.log(`[Driver ${driverId}] Notification received:`, msg);

                if (msg === "SUCCESS") {
                    console.log(`[Driver ${driverId}] Ride Accepted Successfully!`);

                    // IMPORTANT: Use the REF to get the latest offer data
                    if (currentOfferRef.current) {
                        console.log(`[Driver ${driverId}] Promoting offer to Accepted Ride:`, currentOfferRef.current);
                        setAcceptedRide(currentOfferRef.current);
                        setRideStatus('ON_TRIP');
                        setCurrentOffer(null); // Clear the offer modal
                        currentOfferRef.current = null; // Clear the ref
                    } else {
                        console.error(`[Driver ${driverId}] CRITICAL: Received SUCCESS but currentOfferRef is null!`);
                        // Fallback: Try to use state if ref is somehow empty (unlikely but safe)
                        if (currentOffer) {
                            console.warn(`[Driver ${driverId}] Fallback: Using state currentOffer`);
                            setAcceptedRide(currentOffer);
                            setRideStatus('ON_TRIP');
                            setCurrentOffer(null);
                        }
                    }
                } else if (msg === "RIDE_TAKEN") {
                    console.log(`[Driver ${driverId}] Ride already taken by another driver.`);
                    alert("This ride has already been taken by another driver.");
                    setShowOfferModal(false);
                    setCurrentOffer(null);
                    currentOfferRef.current = null;
                }
            });

            return () => {
                notifySub?.unsubscribe();
            }
        }
    }, [isConnected, subscribe, driverId, currentOffer]); // Added currentOffer to deps just in case, though ref is better

    // Handle going online/offline
    const toggleOnlineStatus = () => {
        if (isOnline) {
            // Going offline
            console.log(`[Driver ${driverId}] Going offline...`)
            setIsOnline(false)
            setStatusMessage('You are currently Offline')
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current)
                locationIntervalRef.current = null
            }
            console.log(`[Driver ${driverId}] Driver went offline`)
        } else {
            // Going online - DON'T start location broadcast yet!
            // The useEffect will handle starting location broadcast after subscription is ready
            console.log(`[Driver ${driverId}] Going online - waiting for subscription...`)
            setIsOnline(true)
            setStatusMessage('You are Online')
            // Location broadcasting will start in useEffect after subscription is confirmed
        }
    }

    // Real Location Hook
    const { location: realLocation, error: locationError, isTracking } = useRealLocation(isOnline);

    useEffect(() => {
        if (locationError) {
            console.error('GPS Error:', locationError);
        }
    }, [locationError]);

    // Effect: Broadcast location updates when online and tracking
    useEffect(() => {
        if (isOnline && isConnected && realLocation && isTracking) {
            // We rely on the interval for consistent updates to backend, 
            // but use the LATEST real location stored in the ref.
        }
    }, [isOnline, isConnected, realLocation, isTracking, driverId]);

    // Use a ref to store the latest location for the interval
    const latestLocationRef = useRef<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (realLocation) {
            latestLocationRef.current = realLocation;
        }
    }, [realLocation]);

    // Start/stop location broadcasting based on online status
    useEffect(() => {
        if (isOnline && isConnected) {
            console.log(`[Driver ${driverId}] Starting location broadcast...`)

            // Send initial location immediately if available
            if (latestLocationRef.current) {
                const initialLocation = {
                    driverId: driverId,
                    lat: latestLocationRef.current.lat,
                    lng: latestLocationRef.current.lng
                }
                console.log(`[Driver ${driverId}] Sending initial location:`, initialLocation)
                publish('/app/driver-update', initialLocation)
            }

            // Start interval for continuous updates
            locationIntervalRef.current = setInterval(() => {
                if (latestLocationRef.current) {
                    const locationUpdate = {
                        driverId: driverId,
                        lat: latestLocationRef.current.lat,
                        lng: latestLocationRef.current.lng
                    }
                    publish('/app/driver-update', locationUpdate)
                } else if (!isTracking && !latestLocationRef.current) {
                    // Fallback if no real location yet (optional: maybe send last known or default?)
                    // For now, doing nothing until GPS lock
                    console.warn(`[Driver ${driverId}] Waiting for GPS lock...`);
                }
            }, 3000) // Update location every 3 seconds

            console.log(`[Driver ${driverId}] Location broadcasting started`)

            return () => {
                if (locationIntervalRef.current) {
                    clearInterval(locationIntervalRef.current)
                    locationIntervalRef.current = null
                }
            }
        } else if (!isOnline && locationIntervalRef.current) {
            // Driver went offline
            clearInterval(locationIntervalRef.current)
            locationIntervalRef.current = null
            console.log(`[Driver ${driverId}] Location broadcasting stopped`)
        }
    }, [isOnline, isConnected, driverId, publish, isTracking]);

    // Cleanup
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
            driverId: driverId,
            status: 'ACCEPTED'
        }

        console.log(`[Driver ${driverId} - ${driverData?.name}] ACCEPTING RIDE:`, acceptPayload)
        console.log(`[Driver ${driverId}] Current offer:`, currentOffer)

        publish('/app/accept-ride', acceptPayload)
        setShowOfferModal(false)
        // Don't clear currentOffer here - let the SUCCESS notification handle it
        console.log(`[Driver ${driverId} - ${driverData?.name}] Ride acceptance sent to backend, waiting for confirmation`)
    }

    // Handle declining a ride
    const handleDeclineRide = () => {
        setShowOfferModal(false)
        setCurrentOffer(null)
        currentOfferRef.current = null
        console.log('Ride declined')
    }

    // Handle starting trip (passenger picked up)
    const handleStartTrip = () => {
        if (!acceptedRide) return

        const tripStartPayload = {
            rideId: acceptedRide.rideId,
            driverId: driverId,
            status: 'TRIP_STARTED'
        }

        publish('/app/trip-started', tripStartPayload)
        setRideStatus('PICKED_UP')
        console.log('Trip started:', tripStartPayload)
    }

    // Handle ending trip (reached destination)
    const handleEndTrip = () => {
        if (!acceptedRide) return

        const tripEndPayload = {
            rideId: acceptedRide.rideId,
            driverId: driverId,
            status: 'TRIP_ENDED'
        }

        publish('/app/trip-ended', tripEndPayload)
        console.log('Trip ended:', tripEndPayload)

        // Clear accepted ride after a short delay
        setTimeout(() => {
            setAcceptedRide(null)
            setRideStatus('IDLE')
        }, 2000)
    }

    // Show loading if driver data not ready
    if (!driverData) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
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
                            {/* Driver Profile Pill */}
                            <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <span className="fw-semibold text-white d-none d-sm-block">
                                    Hi, {authUser?.username || driverData.name}
                                </span>
                                <FaUserCircle size={24} className="text-white" />
                            </div>
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
                            <div className="text-white small mb-2">Welcome, {authUser?.username || driverData.name}</div>
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

                    {/* Active Ride Panel - Shows when driver has accepted a ride */}
                    {acceptedRide && (
                        <Col xs={12}>
                            <Card className="border-0 shadow-lg" style={{
                                borderLeft: '4px solid #10b981',
                                backgroundColor: '#f0fdf4'
                            }}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h4 className="mb-1 fw-bold text-success">Active Ride</h4>
                                            <Badge bg={rideStatus === 'PICKED_UP' ? 'primary' : 'success'} className="px-3 py-2">
                                                {rideStatus === 'PICKED_UP' ? 'Trip In Progress' : 'Heading to Pickup'}
                                            </Badge>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted d-block">FARE</small>
                                            <h3 className="mb-0 text-success fw-bold">LKR {acceptedRide.price}</h3>
                                        </div>
                                    </div>

                                    {/* Passenger Info */}
                                    <div className="mb-4 p-3 bg-white rounded-3 border">
                                        <small className="text-muted d-block mb-1">PASSENGER</small>
                                        <h5 className="mb-0 fw-bold">{acceptedRide.riderName}</h5>
                                    </div>

                                    {/* Route Info */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-start gap-3 mb-3 p-3 bg-white rounded-3 border">
                                            <div className="bg-success rounded-circle p-2 mt-1">
                                                <FaMapMarkerAlt className="text-white" size={16} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="text-muted d-block">PICKUP LOCATION</small>
                                                <strong>{acceptedRide.pickupAddress}</strong>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 border">
                                            <div className="bg-danger rounded-circle p-2 mt-1">
                                                <FaMapMarkerAlt className="text-white" size={16} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="text-muted d-block">DROP-OFF LOCATION</small>
                                                <strong>{acceptedRide.dropAddress}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {rideStatus === 'ACCEPTED' && (
                                        <Button
                                            onClick={handleStartTrip}
                                            className="w-100 py-3 fw-semibold border-0"
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
                                            <FaCheckCircle className="me-2" />
                                            Picked Up - Start Trip
                                        </Button>
                                    )}

                                    {rideStatus === 'PICKED_UP' && (
                                        <>
                                            <Alert variant="info" className="mb-3">
                                                <FaCar className="me-2" />
                                                Trip in progress. Navigate to drop-off location.
                                            </Alert>
                                            <Button
                                                onClick={handleEndTrip}
                                                className="w-100 py-3 fw-semibold border-0"
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#bb2d3b'
                                                    e.currentTarget.style.transform = 'scale(1.02)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#dc3545'
                                                    e.currentTarget.style.transform = 'scale(1)'
                                                }}
                                            >
                                                <FaCheckCircle className="me-2" />
                                                End Trip
                                            </Button>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    )}

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
