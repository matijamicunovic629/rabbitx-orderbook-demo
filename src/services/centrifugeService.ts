import {
    Centrifuge,
    HistoryOptions,
    Subscription,
    SubscriptionState,
} from 'centrifuge';
import {WEBSOCKET_URL, JWT_TOKEN} from "../constants"


export class CentrifugeService {

    private static _instance: CentrifugeService | null;
    public centrifuge: Centrifuge;
    public subscriptions: { [key: string]: Subscription } = {};

    constructor() {

        this.centrifuge = new Centrifuge(WEBSOCKET_URL, {
            token: JWT_TOKEN,
        });

        this.centrifuge.connect();
    }

    static disconnect = () => {
        const centrifugeInstance = CentrifugeService._instance;
        if (centrifugeInstance) {
            Object.keys(centrifugeInstance.subscriptions).forEach(subscription =>
                centrifugeInstance.removeSubscription(subscription),
            );
            centrifugeInstance.centrifuge.disconnect();
            centrifugeInstance.centrifuge.removeAllListeners();
        }
        CentrifugeService._instance = null;
    };

    static getInstance = (): CentrifugeService => {
        if (!CentrifugeService._instance) {
            CentrifugeService._instance = new CentrifugeService();
        }
        return CentrifugeService._instance;
    };


    addSubscription = (
        channelID: string,
        callbacks?: {
            subscribed?: (data: any) => void;
            unsubscribed?: (data: any) => void;
            error?: (data: any) => void;
        },
    ): Subscription => {
        if (this.hasSubscription(channelID)) {
            return this.subscriptions[channelID];
        }

        this.subscriptions[channelID] = this.centrifuge.newSubscription(channelID);

        this.subscriptions[channelID].on('subscribed', data => {
            callbacks?.subscribed && callbacks?.subscribed(data);
        });

        this.subscriptions[channelID].on('unsubscribed', data => {
            callbacks?.unsubscribed && callbacks?.unsubscribed(data);
        });

        this.subscriptions[channelID].on('error', (e: any) => {
            callbacks?.error && callbacks?.error(e);
        });

        this.subscriptions[channelID].subscribe();

        return this.subscriptions[channelID];
    };

    removeSubscription = (channelID: string) => {
        if (!this.hasSubscription(channelID)) return;

        this.subscriptions[channelID].unsubscribe();
        this.centrifuge.removeSubscription(this.subscriptions[channelID]);
    };

    getHistory = async (channelID: string, limit: number) => {
        if (!this.hasSubscription(channelID)) return;

        const opts: HistoryOptions = {
            limit,
            reverse: true,
        };
        return await this.subscriptions[channelID].history(opts);
    };


    hasSubscription = (channelID: string): boolean => {
        return (
            this.subscriptions[channelID]?.state === SubscriptionState.Subscribed ||
            this.subscriptions[channelID]?.state === SubscriptionState.Subscribing
        );
    };

    getSubscription = (channelID: string): Subscription => {
        return this.subscriptions[channelID];
    };

}

export default CentrifugeService;
