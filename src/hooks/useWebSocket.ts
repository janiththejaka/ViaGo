import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

interface WebSocketHookReturn {
    isConnected: boolean;
    error: string | null;
    subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
    publish: (destination: string, body: any) => void;
    disconnect: () => void;
}

export const useWebSocket = (brokerURL: string): WebSocketHookReturn => {
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const subscriptionsRef = useRef<StompSubscription[]>([]);

    useEffect(() => {
        // Create STOMP client
        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // Add connection headers for authentication/identification
            connectHeaders: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'X-Driver-Id': '1',  // Keep legacy header for now if needed
                'login': 'driver1',
                'passcode': 'driver1'
            },

            onConnect: () => {
                console.log('✅ WebSocket Connected');
                setIsConnected(true);
                setError(null);
            },

            onDisconnect: () => {
                console.log('❌ WebSocket Disconnected');
                setIsConnected(false);
            },

            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame.headers['message']);
                console.error('❌ STOMP Error Frame:', frame);
                setError(frame.headers['message'] || 'STOMP connection error');
                setIsConnected(false);
            },

            onWebSocketError: (event) => {
                console.error('❌ WebSocket Error:', event);
                setError('WebSocket connection failed. Is the backend running?');
                setIsConnected(false);
            }
        });

        clientRef.current = client;

        // Activate the client
        client.activate();

        // Cleanup on unmount
        return () => {
            console.log('🔌 Disconnecting WebSocket...');

            // Unsubscribe all subscriptions
            subscriptionsRef.current.forEach(sub => {
                try {
                    sub.unsubscribe();
                } catch (e) {
                    console.error('Error unsubscribing:', e);
                }
            });
            subscriptionsRef.current = [];

            // Deactivate client
            if (client.active) {
                client.deactivate();
            }
        };
    }, [brokerURL]);

    // Subscribe to a destination
    const subscribe = useCallback((destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
        if (!clientRef.current || !isConnected) {
            console.warn('⚠️ Cannot subscribe: WebSocket not connected');
            return null;
        }

        try {
            // Wrap callback with debug logging
            const wrappedCallback = (message: IMessage) => {
                console.log(`🎯 [useWebSocket] Message received on ${destination}:`, message);
                callback(message);
            };

            const subscription = clientRef.current.subscribe(destination, wrappedCallback);
            subscriptionsRef.current.push(subscription);
            console.log(`📡 Subscribed to: ${destination}`);
            console.log(`📡 Subscription ID: ${subscription.id}`);
            return subscription;
        } catch (err) {
            console.error(`❌ Subscription failed for ${destination}:`, err);
            return null;
        }
    }, [isConnected]);

    // Publish a message
    const publish = useCallback((destination: string, body: any) => {
        if (!clientRef.current || !isConnected) {
            console.warn('⚠️ Cannot publish: WebSocket not connected');
            return;
        }

        try {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body)
            });
            console.log(`📤 Published to ${destination}:`, body);
        } catch (err) {
            console.error(`❌ Publish failed to ${destination}:`, err);
        }
    }, [isConnected]);

    // Manual disconnect
    const disconnect = useCallback(() => {
        if (clientRef.current && clientRef.current.active) {
            clientRef.current.deactivate();
        }
    }, []);

    return {
        isConnected,
        error,
        subscribe,
        publish,
        disconnect
    };
};
