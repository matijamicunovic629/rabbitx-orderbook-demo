export const WEBSOCKET_URL = "wss://api.prod.rabbitx.io/ws";

export const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDAwMDAwMDAwIiwiZXhwIjo2NTQ4NDg3NTY5fQ.o_qBZltZdDHBH3zHPQkcRhVBQCtejIuyq8V1yj5kYq8";

export const MAX_ORDERBOOK_ARRAY_ORDERS_COUNT = 50;

export const THROTTLE_THRESHOLD = 300;

export const MIN_SPREAD_PERCENTAGE_VALUE = 0.01;

export const CHECK_HISTORY_COUNTS = [10, 25, 100];

export const BG_DEPTH_VISUALIZER_ASK = '#321E2C';

export const BG_DEPTH_VISUALIZER_BID = '#12292E';

export enum OrderType {
    BID,
    ASK
}

export enum PriceChangeType {
    UP,
    DOWN
}

