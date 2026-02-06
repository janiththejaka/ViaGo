import React, { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button, Form, Card, Modal, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
// Icons
import { FaMapMarkerAlt, FaTimes, FaCar, FaSearch, FaLocationArrow } from 'react-icons/fa';

interface BookingPanelProps {
    pickupText: string;
    setPickupText: (text: string) => void;
    dropText: string;
    setDropText: (text: string) => void;
    onPlaceSelected: (type: 'pickup' | 'drop', place: google.maps.places.PlaceResult) => void;
    onSelectOnMap: (mode: 'pickup' | 'drop') => void;
    calculateRoute: () => void;
    tripDetails: { distance: string; duration: string; price: number } | null;
    loading: boolean;
}

export default function BookingPanel({
    pickupText, setPickupText, dropText, setDropText,
    onPlaceSelected, onSelectOnMap, calculateRoute, tripDetails, loading
}: BookingPanelProps) {

    // State
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [activeField, setActiveField] = useState<'pickup' | 'drop'>('pickup');

    const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
    const dropRef = useRef<google.maps.places.Autocomplete | null>(null);

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

                    {!tripDetails && (
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

                    {tripDetails && (
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
                            <Button className="w-100 py-3 fs-5 fw-bold rounded-pill" variant="success">
                                REQUEST VIAGO
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* --- MOBILE VIEW --- */}
            {!tripDetails && (
                <div className="d-md-none fixed-bottom bg-white p-3 rounded-top-4 shadow-lg" style={{ zIndex: 100 }}>
                    <h5 className="mb-3 fw-bold">Where to?</h5>
                    <div
                        className="bg-light p-3 rounded-3 text-muted d-flex align-items-center gap-2 border"
                        onClick={() => handleInputClick('drop')}
                    >
                        <FaSearch /> Search Destination...
                    </div>
                </div>
            )}

            {tripDetails && (
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
                    <Button className="w-100 py-3 fw-bold fs-5" variant="success">CONFIRM VIAGO</Button>
                    <Button variant="link" className="w-100 text-muted mt-2 text-decoration-none" onClick={() => setShowMobileSearch(true)}>Change Destination</Button>
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