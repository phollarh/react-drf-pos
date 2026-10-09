export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const BASE_URL_CHARTS = import.meta.env.VITE_BASE_URL_CHARTS;
export const BASE_URL_ACCOUNT = import.meta.env.VITE_BASE_URL_ACCOUNT;

export const MEDIA_URL =
    import.meta.env.VITE_MEDIA_URL || window.location.origin;

export const WS_ROOT =
    import.meta.env.VITE_WS_ROOT ||
    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;


// export const BASE_URL = "http://127.0.0.1:8000/api";
// export const BASE_URL_CHARTS = "http://127.0.0.1:8000";
// export const BASE_URL_ACCOUNT = "http://127.0.0.1:8000/accounts/api";
// export const MEDIA_URL = "http://127.0.0.1:8000";

// //websocket url
// export const WS_ROOT = "ws://127.0.0.1:8000"