import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export function useSignalR(hubUrl: string) {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const newConnection = new HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect() 
            .build();

        newConnection.onreconnected(() => {
            if (isMounted) setIsConnected(true);
        });

        newConnection.onclose(() => {
            if (isMounted) setIsConnected(false);
        });

        newConnection.start()
            .then(() => {
                if (isMounted) {
                    console.log('WebSocket (SignalR) Connected!');
                    setConnection(newConnection);
                    setIsConnected(true);
                } else {
                    newConnection.stop();
                }
            })
            .catch(err => console.error('SignalR Connection Error: ', err));

        return () => {
            isMounted = false;
            newConnection.stop();

        };
    }, [hubUrl]);

    return { connection, isConnected };
}