import React, { memo } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
};

interface RideMapProps {
    pickup: { lat: number; lng: number } | null;
    drop: { lat: number; lng: number } | null;
    directions: google.maps.DirectionsResult | null;
    onMapClick: (loc: { lat: number; lng: number }) => void;
    selectingMode: 'pickup' | 'drop' | null;
}

const RideMap: React.FC<RideMapProps> = ({ pickup, drop, directions, onMapClick, selectingMode }) => {
    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={pickup || defaultCenter}
            zoom={15}
            options={mapOptions}
            onClick={(e) => {
                // Map එක Click කළාම Parent ට කියනවා
                if (selectingMode && e.latLng) {
                    onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
            }}
        >
            {/* Pickup Marker (Green) */}
            {pickup && <Marker position={pickup} icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" />}

            {/* Drop Marker (Red) */}
            {drop && <Marker position={drop} icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" />}

            {/* Route Line */}
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true, // අපේම මාකර් දාන නිසා Google ඒවා එපා
                        polylineOptions: { strokeColor: '#28a745', strokeWeight: 5 }
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default memo(RideMap);