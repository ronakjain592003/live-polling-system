import { useState, useEffect, useRef } from 'react';

export const usePollTimer = (
    startedAt: string | undefined,
    timeLimit: number,
    serverRemaining?: number,
    locked: boolean = false
) => {

    if (locked) {
        return {
            remaining: 0,
            formatted: '00:00',
            isExpired: true,
        };
    }
    const computeRemaining = (): number => {
        if (serverRemaining !== undefined) return serverRemaining;
        if (!startedAt) return timeLimit;
        const elapsed = Math.floor(
            (Date.now() - new Date(startedAt).getTime()) / 1000
        );
        return Math.max(0, timeLimit - elapsed);
    };

    const [remaining, setRemaining] = useState<number>(computeRemaining);
    const serverRemainingInitialized = useRef(false);

    // Sync with server-provided remaining time on first load
    useEffect(() => {
        if (serverRemaining !== undefined && !serverRemainingInitialized.current) {
            setRemaining(serverRemaining);
            serverRemainingInitialized.current = true;
        }
    }, [serverRemaining]);

    // Countdown tick
    useEffect(() => {
        if (remaining <= 0) return;

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [startedAt, serverRemaining]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return { remaining, formatted, isExpired: remaining === 0 };
};
