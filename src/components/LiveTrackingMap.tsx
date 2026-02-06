// src/components/LiveTrackingMap.tsx
import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { locationService } from '../services/LocationService';

const containerStyle = { width: '100%', height: '100vh' };
const center = { lat: 6.9271, lng: 79.8612 }; // Default Colombo

export default function LiveTrackingMap() {
    const [carPosition, setCarPosition] = useState(center);

    // Google Maps API Key එක (.env file එකෙන් ගන්න)
    // නැත්නම් කෙලින්ම String එකක් විදියට දාලා Test කරන්න
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        // 1. WebSocket එකට Connect වෙනවා
        locationService.connect((data) => {
            // 2. Backend එකෙන් අලුත් Location එකක් ආපු ගමන් State එක Update කරනවා
            console.log("📍 New Location:", data);
            setCarPosition({ lat: data.latitude, lng: data.longitude });
        });

        return () => locationService.disconnect();
    }, []);

    // --- TESTING ONLY: මේ බොත්තමෙන් Driver ලොකේෂන් යවනවා වගේ බොරු කරමු ---
    const simulateDriverMovement = () => {
        // පොඩ්ඩක් එහාට මෙහාට ලොකේෂන් එක මාරු කරලා යවනවා
        const newLat = 6.9271 + (Math.random() - 0.5) * 0.01;
        const newLng = 79.8612 + (Math.random() - 0.5) * 0.01;
        locationService.sendLocation("ride_123", newLat, newLng);
    };

    return (
        <div>
            {/* Testing Button Overlay */}
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100, background: 'white', padding: 10 }}>
                <h5>🚦 Simulation Control</h5>
                <button onClick={simulateDriverMovement} className="btn btn-primary">
                    Move Car (Simulate Driver)
                </button>
            </div>

            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={carPosition} // කාර් එක මැදට ගන්නවා
                    zoom={15}
                >
                    {/* මේ තමයි කාර් එක */}
                    <Marker
                        position={carPosition}
                        label="🚕" // කාර් අයිකන් එකක් පස්සේ දාමු, දැනට Text
                    />
                </GoogleMap>
            </LoadScript>
        </div>
    );
}