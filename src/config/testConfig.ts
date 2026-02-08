// Test data configuration for WebSocket testing without user service

export const TEST_CONFIG = {
    // Primary driver test data (Driver 1)
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

    // Multiple drivers for testing (use these to open multiple driver dashboards)
    DRIVERS: [
        {
            id: 1,
            name: "Kamal Perera",
            phone: "+94771234567",
            vehicleType: "Toyota Aqua",
            vehicleNumber: "CAB-1234",
            rating: 4.8,
            location: {
                lat: 6.9271,
                lng: 79.8612,
                address: "Fort Railway Station, Colombo"
            }
        },
        {
            id: 2,
            name: "Sunil Fernando",
            phone: "+94772345678",
            vehicleType: "Honda Vezel",
            vehicleNumber: "CAB-5678",
            rating: 4.6,
            location: {
                lat: 6.9300,
                lng: 79.8550,
                address: "Pettah Market, Colombo"
            }
        },
        {
            id: 3,
            name: "Ravi Kumar",
            phone: "+94773456789",
            vehicleType: "Nissan Leaf",
            vehicleNumber: "CAB-9012",
            rating: 4.9,
            location: {
                lat: 6.9340,
                lng: 79.8500,
                address: "Colombo City Centre"
            }
        },
        {
            id: 4,
            name: "Ajith Silva",
            phone: "+94774567890",
            vehicleType: "Toyota Prius",
            vehicleNumber: "CAB-3456",
            rating: 4.7,
            location: {
                lat: 6.9250,
                lng: 79.8580,
                address: "Slave Island, Colombo"
            }
        }
    ],

    // Rider test data
    RIDER: {
        id: 101,
        name: "Nimal Silva",
        phone: "+94777654321",
        // Pickup location near drivers (within 2km)
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
