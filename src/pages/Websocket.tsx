import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

export default function WebSocket() {
    const [messages, setMessages] = useState<string[]>([]);
    const [status, setStatus] = useState("Disconnected 🔴");

    useEffect(() => {
        // Note the URL scheme is now 'ws://' not 'http://'
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            onConnect: () => {
                setStatus("CONNECTED 🟢");

                // Subscribe to alerts
                client.subscribe('/topic/ride-alerts', (msg) => {
                    if (msg.body) {
                        const payload = JSON.parse(msg.body);
                        setMessages((prev) => [...prev, `🚗 NEW RIDE: ${payload.userName}`]);
                    }
                });
            },
            onDisconnect: () => {
                setStatus("Disconnected 🔴");
            },
            // Helps debug connection issues
            debug: (str) => {
                console.log(str);
            }
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    return (
        <div style={{ padding: '50px' }}>
            <h1>WebSocket Native Test</h1>
            <h2>Status: {status}</h2>

            <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
                <h3>Broadcasts from Server:</h3>
                {messages.length === 0 ? <p>No rides yet...</p> :
                    messages.map((m, i) => <div key={i}>{m}</div>)
                }
            </div>
        </div>
    );
}