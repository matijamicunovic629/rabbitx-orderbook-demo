export interface OrderBookResponseData {
    market_id: string;
    bids: any;
    asks: any;
    sequence: number;
    timestamp: number;
}

export interface Order {
    price: number;
    amount: number;
    total: number;
    isChanged: boolean;
    depthVisualizerPercentage: number;
}
