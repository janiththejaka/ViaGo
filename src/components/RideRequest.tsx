import React, { useState, useRef } from 'react';
import {
    GoogleMap,
    LoadScript,
    Autocomplete,
    DirectionsRenderer,
    Marker
} from '@react-google-maps/api';

// Map එකේ පෙනුම
const containerStyle = { width: '100%', height: '100vh' };
const center = { lat: 6.9271, lng: 79.8612 }; // Default Colombo

// Google Maps Libraries (Places අනිවාර්යයි)
const libraries: ("places")[] = ["places"];

export default function RideRequest() {
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState<number | null>(null);

    // Search Box වලට References
    const originRef = useRef<HTMLInputElement>(null);
    const destinationRef = useRef<HTMLInputElement>(null);

    // 1. පාර සහ දුර සොයන Function එක
    async function calculateRoute() {
        if (originRef.current?.value === '' || destinationRef.current?.value === '') {
            return;
        }

        const directionsService = new google.maps.DirectionsService();

        try {
            const results = await directionsService.route({
                origin: originRef.current!.value,
                destination: destinationRef.current!.value,
                travelMode: google.maps.TravelMode.DRIVING,
            });

            setDirections(results);

            // දුර සහ කාලය ලබාගැනීම
            const trip = results.routes[0].legs[0];
            setDistance(trip.distance?.text || '');
            setDuration(trip.duration?.text || '');

            // --- සරල මිල ගණනය කිරීම (Logic) ---
            // උදා: Base = 100 Rs + (Km x 120 Rs)
            if (trip.distance?.value) {
                const km = trip.distance.value / 1000;
                const estimatedPrice = 100 + (km * 120);
                setPrice(Math.round(estimatedPrice));
            }

        } catch (error) {
            console.error("Error calculating route:", error);
            alert("පාර සොයාගැනීමට නොහැක. කරුණාකර නිවැරදි ස්ථාන ඇතුලත් කරන්න.");
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>

            {/* --- වම් පැත්තේ පාලක පුවරුව (Sidebar) --- */}
            <div style={{ width: '400px', padding: '20px', background: '#f8f9fa', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <h2 className="mb-4">🚖 Find a Ride</h2>

                <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                >
                    <div className="mb-3">
                        <label>Pickup Location</label>
                        <Autocomplete>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="කොහෙන්ද පටන් ගන්නේ?"
                                ref={originRef}
                            />
                        </Autocomplete>
                    </div>

                    <div className="mb-3">
                        <label>Drop Location</label>
                        <Autocomplete>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="කොහාටද යන්නේ?"
                                ref={destinationRef}
                            />
                        </Autocomplete>
                    </div>

                    <button className="btn btn-primary w-100" onClick={calculateRoute}>
                        ගාස්තුව බලන්න (Check Price)
                    </button>

                    {/* ප්‍රතිඵල පෙන්වන කොටස */}
                    {distance && (
                        <div className="mt-4 p-3 bg-white border rounded">
                            <h5>Trip Details</h5>
                            <p>📏 දුර: <strong>{distance}</strong></p>
                            <p>⏱️ කාලය: <strong>{duration}</strong></p>
                            <hr />
                            <h3 className="text-success text-center">LKR {price}</h3>
                            <button className="btn btn-success w-100 mt-2">
                                BOOK NOW
                            </button>
                        </div>
                    )}

                    {/* --- Map Component එක Sidebar එක ඇතුලෙම Load වෙන විදියට හැදුවා --- */}
                    {/* Note: LoadScript එක පාරක් විතරක් පාවිච්චි කරන්න ඕන නිසා Map එක මෙතනම දානවා */}
                    <div style={{ position: 'fixed', top: 0, left: 400, right: 0, bottom: 0 }}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={center}
                            zoom={14}
                            options={{ zoomControl: false, streetViewControl: false }}
                        >
                            {/* මාර්ගය ඇඳීම */}
                            {directions && <DirectionsRenderer directions={directions} />}

                            {/* Route එකක් නැත්නම් නිකන් Marker එකක් පෙන්නන්න */}
                            {!directions && <Marker position={center} />}
                        </GoogleMap>
                    </div>

                </LoadScript>
            </div>
        </div>
    );
}