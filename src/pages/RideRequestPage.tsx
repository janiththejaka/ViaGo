import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import RideMap from '../components/RideMap';
import BookingPanel from '../components/BookingPanel';
import TopNavbar from '../components/TopNavbar';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { TEST_CONFIG } from '../config/testConfig';

import { API_CONFIG } from '../config/apiConfig';

const libraries: ("places")[] = ["places"];

export default function RideRequestPage() {
    // --- NAVIGATION ---
    const navigate = useNavigate();

    // --- USER DATA (Hardcoded for testing) ---
    // --- USER DATA (From Auth Context) ---
    const { user: authUser } = useAuth();
    const user = {
        name: authUser?.username || TEST_CONFIG.RIDER.name, // Fallback to test config if not logged in (or handle redirect)
        image: ""
    };

    // WebSocket connection
    const { isConnected, subscribe, publish } = useWebSocket(API_CONFIG.WEBSOCKET_URL);

    // State Management
    const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
    const [drop, setDrop] = useState<{ lat: number; lng: number } | null>(null);
    const [pickupText, setPickupText] = useState('');
    const [dropText, setDropText] = useState('');

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [tripDetails, setTripDetails] = useState<{ distance: string; duration: string; price: number } | null>(null);
    const [loading, setLoading] = useState(false);

    // "Select on Map" Mode State
    const [selectingMode, setSelectingMode] = useState<'pickup' | 'drop' | null>(null);

    // Effect: Set default pickup location from test config
    useEffect(() => {
        // Set default pickup location near driver for testing
        setPickup({
            lat: TEST_CONFIG.RIDER.defaultPickup.lat,
            lng: TEST_CONFIG.RIDER.defaultPickup.lng
        });
        setPickupText(TEST_CONFIG.RIDER.defaultPickup.address);

        // Optionally set default drop location
        // setDrop({
        //     lat: TEST_CONFIG.RIDER.defaultDrop.lat,
        //     lng: TEST_CONFIG.RIDER.defaultDrop.lng
        // });
        // setDropText(TEST_CONFIG.RIDER.defaultDrop.address);
    }, []);

    // Handler: Back Button Click කළාම Home එකට යනවා
    const handleBackClick = () => {
        navigate('/'); // Home page එකට redirect කරනවා
    };

    // 2. Logic: Map Click to Address (Reverse Geocoding)
    const onMapClick = useCallback((loc: { lat: number; lng: number }) => {
        if (!selectingMode) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: loc }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                if (selectingMode === 'pickup') {
                    setPickup(loc);
                    setPickupText(address);
                } else {
                    setDrop(loc);
                    setDropText(address);
                }
            } else {
                const coords = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
                if (selectingMode === 'pickup') { setPickup(loc); setPickupText(coords); }
                else { setDrop(loc); setDropText(coords); }
            }
            setSelectingMode(null);
        });
    }, [selectingMode]);

    // 3. Logic: Place Selection
    const onPlaceSelected = (type: 'pickup' | 'drop', place: google.maps.places.PlaceResult) => {
        if (!place.geometry || !place.geometry.location) return;

        const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        const address = place.formatted_address || place.name || '';

        if (type === 'pickup') {
            setPickup(loc);
            setPickupText(address);
        } else {
            setDrop(loc);
            setDropText(address);
        }
    };

    // 4. Logic: Calculate Route
    const calculateRoute = async () => {
        if (!pickup || !drop) return;
        setLoading(true);

        const service = new google.maps.DirectionsService();
        service.route({
            origin: pickup,
            destination: drop,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            setLoading(false);
            if (status === 'OK' && result) {
                setDirections(result);

                const leg = result.routes[0].legs[0];
                if (leg.distance && leg.duration) {
                    const distKm = leg.distance.value / 1000;
                    const price = Math.round(100 + (distKm * 120));

                    setTripDetails({
                        distance: leg.distance.text,
                        duration: leg.duration.text,
                        price: price
                    });
                }
            } else {
                alert("Could not find route: " + status);
            }
        });
    };

    return (
        <div style={{ height: '100dvh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

            {/* --- 1. TOP NAVBAR (Added Here) --- */}
            <TopNavbar
                userName={user.name}
                onBackClick={handleBackClick}
            />

            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>

                {/* 2. Map Layer */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                    <RideMap
                        pickup={pickup}
                        drop={drop}
                        directions={directions}
                        onMapClick={onMapClick}
                        selectingMode={selectingMode}
                    />
                </div>

                {/* 3. Booking Panel */}
                <BookingPanel
                    pickupText={pickupText}
                    setPickupText={setPickupText}
                    dropText={dropText}
                    setDropText={setDropText}
                    onPlaceSelected={onPlaceSelected}
                    onSelectOnMap={setSelectingMode}
                    calculateRoute={calculateRoute}
                    tripDetails={tripDetails}
                    pickup={pickup}
                    drop={drop}
                    loading={loading}
                    isConnected={isConnected}
                    subscribe={subscribe}
                    publish={publish}
                />

                {/* 4. Map Selection Hint Banner */}
                {selectingMode && (
                    <div className="position-absolute start-0 w-100 p-3 text-center animate__animated animate__slideInDown"
                        style={{ top: '70px', zIndex: 2000, background: 'rgba(33, 37, 41, 0.9)', color: 'white' }}>
                        <h6 className="mb-2">Tap map to set {selectingMode}</h6>
                        <button className="btn btn-sm btn-outline-light px-4 rounded-pill" onClick={() => setSelectingMode(null)}>
                            Cancel
                        </button>
                    </div>
                )}

            </LoadScript>
        </div>
    );
}