import { useRef, useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button, Form, Card, Modal, Spinner, OverlayTrigger, Tooltip, Alert, Badge } from 'react-bootstrap';
import { IMessage } from '@stomp/stompjs';
// Icons
import { FaMapMarkerAlt, FaTimes, FaCar, FaSearch, FaLocationArrow, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface DriverDetails {
    id: number;
    name: string;
    phone: string;
    vehicleNo: string;
    vehicleModel?: string;
}

interface BookingPanelProps {
    pickupText: string;
    setPickupText: (text: string) => void;
    dropText: string;
    setDropText: (text: string) => void;
    onPlaceSelected: (type: 'pickup' | 'drop', place: google.maps.places.PlaceResult) => void;
    onSelectOnMap: (mode: 'pickup' | 'drop') => void;
    calculateRoute: () => void;
    tripDetails: { distance: string; duration: string; price: number } | null;
    pickup: { lat: number; lng: number } | null;
    drop: { lat: number; lng: number } | null;
    loading: boolean;
    // WebSocket props
    isConnected: boolean;
    subscribe: (destination: string, callback: (message: IMessage) => void) => any;
    publish: (destination: string, body: any) => void;
}

export default function BookingPanel({
    pickupText, setPickupText, dropText, setDropText,
    onPlaceSelected, onSelectOnMap, calculateRoute, tripDetails, pickup, drop, loading,
    isConnected, subscribe, publish
}: BookingPanelProps) {

    const { user } = useAuth(); // Get authenticated user
    // State
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [activeField, setActiveField] = useState<'pickup' | 'drop'>('pickup');

    // Ride status state
    const [rideStatus, setRideStatus] = useState<'IDLE' | 'SEARCHING' | 'DRIVER_FOUND' | 'TRIP_STARTED' | 'TRIP_ENDED'>('IDLE');
    const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(null);

    const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
    const dropRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Subscribe to ride status updates
    useEffect(() => {
        if (isConnected && user?.userId) {
            const riderId = user.userId;
            console.log('Rider subscribing to /topic/ride-status/' + riderId);

            const subscription = subscribe(`/topic/ride-status/${riderId}`, (message) => {
                console.log('RAW RIDER MESSAGE RECEIVED:', message);
                console.log('RIDER MESSAGE BODY:', message.body);

                try {
                    const statusUpdate = JSON.parse(message.body);
                    console.log('Ride status update:', statusUpdate);
                    console.log('Keys:', Object.keys(statusUpdate));

                    if (statusUpdate.status === 'SEARCHING') {
                        console.log('Status: SEARCHING');
                        setRideStatus('SEARCHING');
                    } else if (statusUpdate.status === 'DRIVER_FOUND') {
                        // Backend might send 'data', 'driver', or 'driverDetails'
                        // Let's check what we actually got
                        const driverData = statusUpdate.data || statusUpdate.driver || statusUpdate.driverDetails;

                        console.log('Status: DRIVER_FOUND');
                        console.log('Driver Data Raw:', driverData);

                        if (driverData) {
                            setDriverDetails(driverData);
                        } else {
                            console.warn('DRIVER_FOUND received but no driver data! Using fallback.');
                            setDriverDetails({
                                id: 0,
                                name: 'Driver (Details N/A)',
                                phone: 'Check App',
                                vehicleNo: 'Unknown',
                                vehicleModel: 'Vehicle'
                            });
                        }
                        // Always transition to DRIVER_FOUND state so the UI updates
                        setRideStatus('DRIVER_FOUND');
                    } else if (statusUpdate.status === 'TRIP_STARTED') {
                        console.log('Status: TRIP_STARTED');
                        setRideStatus('TRIP_STARTED');
                    } else if (statusUpdate.status === 'TRIP_ENDED') {
                        console.log('Status: TRIP_ENDED');
                        setRideStatus('TRIP_ENDED');
                    }
                } catch (err) {
                    console.error('Error parsing ride status:', err);
                }
            });

            if (subscription) {
                console.log('Rider successfully subscribed to /topic/ride-status/' + riderId);
            }

            return () => {
                subscription?.unsubscribe();
            };
        }
    }, [isConnected, subscribe, user]);

    // Mobile Input Click
    const handleInputClick = (field: 'pickup' | 'drop') => {
        if (window.innerWidth < 768) {
            setActiveField(field);
            setShowMobileSearch(true);
        }
    };

    // Mobile Done Button
    const handleMobileDone = () => {
        setShowMobileSearch(false);
        setTimeout(() => calculateRoute(), 300);
    };

    // Helper: Focus Handler
    const handleFocus = (field: 'pickup' | 'drop') => {
        setActiveField(field);
    };

    // Handle ride request
    const handleRequestRide = () => {
        if (!pickup || !drop || !tripDetails || !user) return;

        const rideRequest = {
            riderId: user.userId,
            riderName: user.username, // Use real username
            pickupLat: pickup.lat,
            pickupLng: pickup.lng,
            pickupAddress: pickupText,
            dropAddress: dropText,
            price: tripDetails.price
        };

        publish('/app/request-ride', rideRequest);
        setRideStatus('SEARCHING');
        console.log('Ride requested:', rideRequest);
    };

    // Handle cancel search
    const handleCancelSearch = () => {
        setRideStatus('IDLE');
        setDriverDetails(null);
    };

    // --- RENDER INPUTS (Desktop & Mobile) ---
    const renderInputs = (isMobileModal = false) => (
        <div className="d-flex flex-column gap-4">

            {/* Pickup Section */}
            <div className="position-relative">
                <Form.Label className="text-muted small fw-bold mb-1">PICKUP</Form.Label>
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-success"><FaLocationArrow size={14} /></span>

                    <Autocomplete
                        onLoad={ref => pickupRef.current = ref}
                        onPlaceChanged={() => {
                            if (pickupRef.current) {
                                onPlaceSelected('pickup', pickupRef.current.getPlace());
                                if (isMobileModal && activeField === 'pickup') handleFocus('drop');
                            }
                        }}
                        className="flex-grow-1"
                    >
                        <Form.Control
                            type="text"
                            placeholder="Current Location"
                            value={pickupText}
                            onChange={(e) => setPickupText(e.target.value)}
                            onClick={() => !isMobileModal && handleInputClick('pickup')}
                            onFocus={() => isMobileModal && handleFocus('pickup')}
                            className="py-2 border-start-0 shadow-none bg-light"
                            style={{ borderRadius: '0' }}
                        />
                    </Autocomplete>

                    {/* Desktop "Select on Map" Button */}
                    {!isMobileModal && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>Select on Map</Tooltip>}>
                            <Button
                                variant="outline-secondary"
                                className="border-start-0 bg-light"
                                onClick={() => onSelectOnMap('pickup')}
                            >
                                <FaMapMarkerAlt />
                            </Button>
                        </OverlayTrigger>
                    )}
                </div>
            </div>

            {/* Drop Section */}
            <div className="position-relative">
                <Form.Label className="text-muted small fw-bold mb-1">DROP-OFF</Form.Label>
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-danger"><FaMapMarkerAlt size={14} /></span>

                    <Autocomplete
                        onLoad={ref => dropRef.current = ref}
                        onPlaceChanged={() => {
                            if (dropRef.current) {
                                onPlaceSelected('drop', dropRef.current.getPlace());
                            }
                        }}
                        className="flex-grow-1"
                    >
                        <Form.Control
                            type="text"
                            placeholder="Where to?"
                            value={dropText}
                            onChange={(e) => setDropText(e.target.value)}
                            onClick={() => !isMobileModal && handleInputClick('drop')}
                            onFocus={() => isMobileModal && handleFocus('drop')}
                            className="py-2 border-start-0 shadow-none bg-light"
                            style={{ borderRadius: '0' }}
                        />
                    </Autocomplete>

                    {/* Desktop "Select on Map" Button */}
                    {!isMobileModal && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>Select on Map</Tooltip>}>
                            <Button
                                variant="outline-secondary"
                                className="border-start-0 bg-light"
                                onClick={() => onSelectOnMap('drop')}
                            >
                                <FaMapMarkerAlt />
                            </Button>
                        </OverlayTrigger>
                    )}
                </div>
            </div>

            {/* Mobile Only: Big Select on Map Button */}
            {isMobileModal && (
                <div
                    className="d-flex align-items-center gap-3 mt-2 p-3 bg-white border rounded shadow-sm"
                    onClick={() => {
                        onSelectOnMap(activeField);
                        setShowMobileSearch(false);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="bg-light p-2 rounded-circle text-primary"><FaMapMarkerAlt /></div>
                    <span className="fw-semibold text-dark">Set location on map</span>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* --- DESKTOP VIEW (Fixed Styles) --- */}
            <Card className="shadow-lg border-0 d-none d-md-block" style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '40px',
                width: '450px',

                // --- NEW FIXES ---
                maxHeight: '90vh',       // Screen එකට වඩා ලොකු වීම වළක්වයි
                overflowY: 'auto',       // Content වැඩි වුනොත් Scroll වෙන්න දෙනවා
                scrollbarWidth: 'none',  // Scrollbar එක හංගනවා (Optional - Firefox)

                zIndex: 10,
                borderRadius: '20px',
                padding: '20px'
            }}>
                {/* Hide Scrollbar for Chrome/Safari/Edge */}
                <style type="text/css">
                    {`
                    .card::-webkit-scrollbar {
                        display: none;
                    }
                    `}
                </style>

                <Card.Body className="d-flex flex-column justify-content-center">
                    <h2 className="mb-4 fw-bold display-6">Get a ride</h2>

                    {renderInputs(false)}

                    {/* IDLE State - Show See Prices or Request Ride */}
                    {rideStatus === 'IDLE' && !tripDetails && (
                        <Button
                            className="w-100 mt-5 py-3 fw-bold rounded-pill"
                            variant="dark"
                            size="lg"
                            onClick={calculateRoute}
                            disabled={loading || !pickupText || !dropText}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'See Prices'}
                        </Button>
                    )}

                    {rideStatus === 'IDLE' && tripDetails && (
                        <div className="mt-4">
                            <div className="d-flex align-items-center justify-content-between p-4 border rounded-4 mb-4 bg-light">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-2 rounded-circle shadow-sm">
                                        <FaCar size={28} className="text-dark" />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 fw-bold">Viago Mini</h5>
                                        <small className="text-muted">{tripDetails.distance} • {tripDetails.duration}</small>
                                    </div>
                                </div>
                                <h3 className="mb-0 fw-bold">LKR {tripDetails.price}</h3>
                            </div>
                            <Button
                                className="w-100 py-3 fs-5 fw-bold rounded-pill"
                                variant="success"
                                onClick={handleRequestRide}
                                disabled={!isConnected}
                            >
                                REQUEST VIAGO
                            </Button>
                        </div>
                    )}

                    {/* SEARCHING State */}
                    {rideStatus === 'SEARCHING' && (
                        <div className="mt-4 text-center">
                            <Alert variant="info" className="mb-4">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <strong>Searching for nearby drivers...</strong>
                                <p className="mb-0 mt-2 small">This may take a few moments</p>
                            </Alert>
                            <Button
                                variant="outline-secondary"
                                className="w-100 py-3 rounded-pill"
                                onClick={handleCancelSearch}
                            >
                                Cancel Search
                            </Button>
                        </div>
                    )}

                    {/* DRIVER_FOUND State */}
                    {rideStatus === 'DRIVER_FOUND' && driverDetails && (
                        <div className="mt-4">
                            <Alert variant="success" className="mb-4">
                                <strong>Driver Found!</strong>
                            </Alert>

                            <Card className="border-0 bg-light mb-4">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-success rounded-circle p-3 text-white">
                                            <FaCar size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-bold">{driverDetails.name}</h5>
                                            <small className="text-muted">{driverDetails.vehicleModel || driverDetails.vehicleNo}</small>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded mb-2">
                                        <span className="text-muted small">Vehicle Number</span>
                                        <strong>{driverDetails.vehicleNo}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded">
                                        <span className="text-muted small">Phone</span>
                                        <strong>{driverDetails.phone}</strong>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Alert variant="info" className="small">
                                Your driver is on the way to pick you up!
                            </Alert>
                        </div>
                    )}

                    {/* TRIP_STARTED State */}
                    {rideStatus === 'TRIP_STARTED' && driverDetails && (
                        <div className="mt-4">
                            <Alert variant="primary" className="mb-4">
                                <strong>🚗 Trip Started!</strong>
                                <p className="mb-0 mt-2 small">Your driver has picked you up. Enjoy your ride!</p>
                            </Alert>

                            <Card className="border-0 bg-light mb-4">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-primary rounded-circle p-3 text-white">
                                            <FaCar size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-bold">{driverDetails.name}</h5>
                                            <small className="text-muted">{driverDetails.vehicleModel || driverDetails.vehicleNo}</small>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded mb-2">
                                        <span className="text-muted small">Vehicle Number</span>
                                        <strong>{driverDetails.vehicleNo}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded">
                                        <span className="text-muted small">Phone</span>
                                        <strong>{driverDetails.phone}</strong>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Alert variant="info" className="small">
                                <strong>En route to destination</strong>
                            </Alert>
                        </div>
                    )}

                    {/* TRIP_ENDED State */}
                    {rideStatus === 'TRIP_ENDED' && (
                        <div className="mt-4">
                            <Alert variant="success" className="mb-4 text-center">
                                <h4 className="mb-2">🏁 Trip Completed!</h4>
                                <p className="mb-0">Thank you for riding with ViaGO</p>
                            </Alert>

                            {driverDetails && (
                                <Card className="border-0 bg-light mb-4">
                                    <Card.Body className="text-center">
                                        <p className="text-muted mb-2">Your driver was</p>
                                        <h5 className="fw-bold mb-1">{driverDetails.name}</h5>
                                        <small className="text-muted">{driverDetails.vehicleNo}</small>
                                    </Card.Body>
                                </Card>
                            )}

                            <Button
                                className="w-100 py-3 fw-bold rounded-pill"
                                variant="dark"
                                onClick={() => {
                                    setRideStatus('IDLE');
                                    setDriverDetails(null);
                                }}
                            >
                                Book Another Ride
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* --- MOBILE VIEW --- */}
            {!tripDetails && (
                <div className="d-md-none fixed-bottom bg-white p-3 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <h5 className="mb-3 fw-bold">Select Location</h5>
                    <div
                        className="bg-light p-3 rounded-3 text-muted d-flex align-items-center gap-2 border"
                        onClick={() => handleInputClick('drop')}
                    >
                        <FaSearch /> Search Destination...
                    </div>
                </div>
            )}

            {tripDetails && rideStatus === 'IDLE' && (
                <div className="d-md-none fixed-bottom bg-white p-4 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div className="d-flex flex-column">
                            <span className="badge bg-dark mb-1 w-auto align-self-start">{tripDetails.duration}</span>
                            <small className="text-muted">{tripDetails.distance}</small>
                        </div>
                        <h3 className="fw-bold mb-0 text-success">LKR {tripDetails.price}</h3>
                    </div>
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="p-2 bg-light rounded-circle"><FaCar size={28} /></div>
                        <div>
                            <h5 className="fw-bold mb-0">Viago Mini</h5>
                            <small className="text-muted">Recommended</small>
                        </div>
                    </div>
                    <Button
                        className="w-100 py-3 fw-bold fs-5"
                        variant="success"
                        onClick={handleRequestRide}
                        disabled={!isConnected}
                    >
                        REQUEST VIAGO
                    </Button>
                    <Button variant="link" className="w-100 text-muted mt-2 text-decoration-none" onClick={() => setShowMobileSearch(true)}>Change Destination</Button>
                </div>
            )}

            {/* Mobile SEARCHING State */}
            {rideStatus === 'SEARCHING' && (
                <div className="d-md-none fixed-bottom bg-white p-4 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <div className="text-center">
                        <Spinner animation="border" variant="success" className="mb-3" />
                        <h5 className="fw-bold mb-2">Searching for nearby drivers...</h5>
                        <p className="text-muted mb-4">This may take a few moments</p>
                        <Button
                            variant="outline-secondary"
                            className="w-100 py-3 rounded-pill"
                            onClick={handleCancelSearch}
                        >
                            Cancel Search
                        </Button>
                    </div>
                </div>
            )}

            {/* Mobile DRIVER_FOUND State */}
            {rideStatus === 'DRIVER_FOUND' && driverDetails && (
                <div className="d-md-none fixed-bottom bg-white p-4 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <Alert variant="success" className="mb-3">
                        <strong>Driver Found!</strong>
                    </Alert>
                    <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                        <div className="bg-success rounded-circle p-3 text-white">
                            <FaCar size={24} />
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="mb-0 fw-bold">{driverDetails.name}</h5>
                            <small className="text-muted">{driverDetails.vehicleModel || driverDetails.vehicleNo}</small>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-2">
                        <small className="text-muted">Vehicle Number</small>
                        <strong>{driverDetails.vehicleNo}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                        <small className="text-muted">Phone</small>
                        <strong>{driverDetails.phone}</strong>
                    </div>
                    <p className="text-center text-muted mt-3 mb-0">Your driver is on the way to pick you up!</p>
                </div>
            )}

            {/* Mobile TRIP_STARTED State */}
            {rideStatus === 'TRIP_STARTED' && driverDetails && (
                <div className="d-md-none fixed-bottom bg-white p-4 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <Alert variant="primary" className="mb-3 text-center">
                        <strong>🚗 Trip Started!</strong>
                        <p className="mb-0 mt-1 small">Driver has picked you up</p>
                    </Alert>
                    <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                        <div className="bg-primary rounded-circle p-3 text-white">
                            <FaCar size={24} />
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="mb-0 fw-bold">{driverDetails.name}</h5>
                            <small className="text-muted">{driverDetails.vehicleModel || driverDetails.vehicleNo}</small>
                        </div>
                    </div>
                    <p className="text-center text-muted mb-0">En route to destination</p>
                </div>
            )}

            {/* Mobile TRIP_ENDED State */}
            {rideStatus === 'TRIP_ENDED' && (
                <div className="d-md-none fixed-bottom bg-white p-4 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <Alert variant="success" className="mb-3 text-center">
                        <h5 className="mb-1">🏁 Trip Completed!</h5>
                        <small>Thank you for riding with ViaGO</small>
                    </Alert>
                    {driverDetails && (
                        <div className="text-center mb-3 p-3 bg-light rounded-3">
                            <small className="text-muted d-block">Your driver was</small>
                            <h6 className="fw-bold mb-0">{driverDetails.name}</h6>
                            <small className="text-muted">{driverDetails.vehicleNo}</small>
                        </div>
                    )}
                    <Button
                        className="w-100 py-3 fw-bold"
                        variant="dark"
                        onClick={() => {
                            setRideStatus('IDLE');
                            setDriverDetails(null);
                        }}
                    >
                        Book Another Ride
                    </Button>
                </div>
            )}

            <Modal show={showMobileSearch} fullscreen onHide={() => setShowMobileSearch(false)} animation={false}>
                <Modal.Header className="border-0 pb-0 pt-3">
                    <Button variant="light" onClick={() => setShowMobileSearch(false)} className="rounded-circle p-2"><FaTimes size={20} /></Button>
                    <Modal.Title className="ms-3 fw-bold fs-5">Plan your ride</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    {renderInputs(true)}
                    <div className="fixed-bottom p-3 bg-white border-top">
                        <Button variant="dark" className="w-100 py-3 rounded-pill fw-bold" onClick={handleMobileDone} disabled={!pickupText || !dropText}>Done</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}