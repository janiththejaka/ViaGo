// src/services/LocationService.ts
import { Client } from '@stomp/stompjs';

class LocationService {
    private client: Client;

    constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/ws', // Native WebSocket URL
            debug: (str) => console.log(str),
            reconnectDelay: 5000, // Connection කැඩුනොත් ආපහු try කරන්න
        });
    }

    // 1. Connection එක පටන් ගන්න
    connect(onMessageReceived: (data: any) => void) {
        this.client.onConnect = () => {
            console.log("🟢 Connected via Native WS!");

            // Backend එකෙන් එන Location Data අහගෙන ඉන්නවා
            this.client.subscribe('/topic/ride-location', (msg) => {
                if (msg.body) {
                    const locationData = JSON.parse(msg.body);
                    onMessageReceived(locationData);
                }
            });
        };

        this.client.activate();
    }

    // 2. Driver ගේ Location එක යවනවා (Driver App එකට ඕනේ)
    sendLocation(rideId: string, lat: number, lng: number) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/update-location',
                body: JSON.stringify({ rideId, latitude: lat, longitude: lng })
            });
        }
    }

    // 3. Disconnect
    disconnect() {
        this.client.deactivate();
    }
}

// හැම තැනම පාවිච්චි කරන්න පුළුවන් එක Object එකක්
export const locationService = new LocationService();