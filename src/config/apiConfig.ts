/**
 * Centralized API Configuration for ViaGo
 * Reads from environment variables with fallbacks to localhost
 */

export const API_CONFIG = {
    // Service Endpoints
    AUTH_URL: import.meta.env.VITE_AUTH_API_URL || 'http://13.219.25.1:8080/auth',
    USER_URL: import.meta.env.VITE_USER_API_URL || 'http://13.219.25.1:8082/users',
    RIDE_URL: import.meta.env.VITE_RIDE_API_URL || 'http://13.219.25.1:8084/api/rides',
    LOCATION_URL: import.meta.env.VITE_LOCATION_API_URL || 'http://13.219.25.1:8085/api/location',

    // WebSocket
    WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://13.219.25.1:8084/ws-ride',

    // External APIs
    GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

    // Feature Flags
    ENABLE_REAL_LOCATION: true,
    ENABLE_PAYMENTS: false // Set true when payment service is ready
};
