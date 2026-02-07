// Test data configuration for WebSocket testing without user service

export const TEST_CONFIG = {
    // Driver test data
    DRIVER: {
        id: 1,
        name: "Kamal Perera",
        phone: "+94771234567",
        vehicleType: "Toyota Aqua",
        vehicleNumber: "CAB-1234",
        rating: 4.8,
        // Driver location near Colombo Fort
        location: {
            lat: 6.9271,
            lng: 79.8612,
            address: "Fort Railway Station, Colombo"
        }
    },

    // Rider test data
    RIDER: {
        id: 101,
        name: "Nimal Silva",
        phone: "+94777654321",
        // Pickup location near driver (within 2km)
        defaultPickup: {
            lat: 6.9350,
            lng: 79.8538,
            address: "Lotus Tower, Colombo"
        },
        // Drop location
        defaultDrop: {
            lat: 6.9319,
            lng: 79.8478,
            address: "Galle Face Green, Colombo"
        }
    },

    // WebSocket configuration
    WEBSOCKET: {
        url: "ws://localhost:8084/ws-ride",
        reconnectDelay: 5000
    },

    // Location update interval (milliseconds)
    LOCATION_UPDATE_INTERVAL: 5000,

    // Test mode flag
    TEST_MODE: true
};
