/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    // Add other env variables here as needed
    // readonly VITE_API_URL: string
    // readonly VITE_WEBSOCKET_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
