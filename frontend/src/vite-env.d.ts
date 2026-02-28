/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: {
        readonly VITE_SOCKET_URL?: string;
        [key: string]: string | undefined;
    };
}