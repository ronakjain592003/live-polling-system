import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let globalSocket: Socket | null = null;

export const useSocket = () => {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!globalSocket) {
            globalSocket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });
        }

        socketRef.current = globalSocket;

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        globalSocket.on('connect', onConnect);
        globalSocket.on('disconnect', onDisconnect);

        if (globalSocket.connected) setConnected(true);

        return () => {
            globalSocket?.off('connect', onConnect);
            globalSocket?.off('disconnect', onDisconnect);
        };
    }, []);

    const emit = useCallback(
        (event: string, data?: unknown) => {
            socketRef.current?.emit(event, data);
        },
        []
    );

    const on = useCallback(
        (event: string, handler: (...args: unknown[]) => void) => {
            socketRef.current?.on(event, handler);
            return () => {
                socketRef.current?.off(event, handler);
            };
        },
        []
    );

    return { socket: socketRef.current, connected, emit, on };
};
