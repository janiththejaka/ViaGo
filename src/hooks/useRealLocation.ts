import { useState, useEffect, useRef } from 'react';

interface Location {
    lat: number;
    lng: number;
}

interface RealLocationReturn {
    location: Location | null;
    error: string | null;
    isTracking: boolean;
}

export const useRealLocation = (enable: boolean = true): RealLocationReturn => {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enable) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setIsTracking(false);
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        // Success Handler
        const handleSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            setError(null);
            setIsTracking(true);
        };

        // Error Handler
        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
            setIsTracking(false);
        };

        // Options
        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        // Start Watching
        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            options
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [enable]);

    return { location, error, isTracking };
};
