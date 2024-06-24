import {getOrderBookChannelID, getSpreadPercentage, mergeAndSortOrderBook,} from '../utils';
import {MAX_ORDERBOOK_ARRAY_ORDERS_COUNT, CHECK_HISTORY_COUNTS, THROTTLE_THRESHOLD,} from '../constants';
import CentrifugeService from '../services/centrifugeService';
import {SubscribedContext, UnsubscribedContext, PublicationContext} from 'centrifuge';
import {Order, OrderBookResponseData,} from '../interfaces/interfaceOrderbook';
import {makeAutoObservable} from 'mobx';


class OrderBookStore {

    private centrifugeService = CentrifugeService.getInstance();

    bids: Order[] = [];
    rawBids: Order[] = [];

    currentPairSymbol: string = '';
    currentChannelID: string = '';
    lastThrottledTime = 0;

    asks: Order[] = [];
    rawAsks: Order[] = [];

    spreadPercentage: number | undefined = 0;
    sequence: number = 0;
    isCheckingHistory: boolean = false;
    dumpedDataList: OrderBookResponseData[] = [];

    isLoading = true;


    constructor() {
        makeAutoObservable(this);
    }

    /**
     * Updates the order book with new data and refreshes the view if necessary
     * */
    update = (newData: OrderBookResponseData, firstFlag = false) => {

        if (newData?.asks.length > 0) { // there are new asks to update
            const asksMergedAndSorted = mergeAndSortOrderBook(
                this.rawAsks,
                newData.asks,
                firstFlag,
            ).reverse();
            this.rawAsks = asksMergedAndSorted.slice(0, MAX_ORDERBOOK_ARRAY_ORDERS_COUNT);
        }

        if (newData?.bids.length > 0) { // there are new bids to update
            const bidsMergedAndSorted = mergeAndSortOrderBook(
                this.rawBids,
                newData.bids,
                firstFlag,
            );
            this.rawBids = bidsMergedAndSorted.slice(0, MAX_ORDERBOOK_ARRAY_ORDERS_COUNT);
        }

        this.sequence = newData.sequence;
        const spreadAmount = (this.rawAsks?.[0].price ?? 0) - (this.rawBids?.[0].price ?? 0);
        this.spreadPercentage = getSpreadPercentage(spreadAmount, this.rawBids[0].price);

        this.throttleOrderBook();
    };

    /**
     * Throttles the order book updates to avoid too frequent changes
     * */
    throttleOrderBook(isThrottled: boolean = false) {
        const elapsed = Date.now() - this.lastThrottledTime;
        if (elapsed > THROTTLE_THRESHOLD) {
            this.asks = this.rawAsks;
            this.bids = this.rawBids;
            this.lastThrottledTime = Date.now();
        } else if (isThrottled) {
            setTimeout(() => {
                this.throttleOrderBook(true);
            }, THROTTLE_THRESHOLD);
        }
    }

    /**
     * Subscribes to new order book channel for given pair symbol
     * */
    subscribe = (pairSymbol: string, newSubscribe: boolean = false) => {

        if (newSubscribe) // remove currentPairSymbol if it is new subscription
            this.currentPairSymbol = '';

        if (pairSymbol === this.currentPairSymbol) // revert if pairSymbol is already in use
            return;

        if (this.currentPairSymbol !== '') {
            // remove previous subscription
            this.centrifugeService.removeSubscription(this.currentChannelID);
        }

        this.isLoading = true;

        this.centrifugeService.addSubscription(getOrderBookChannelID(pairSymbol), {
            subscribed: (data: SubscribedContext) => {
                this.onSubscribed(data.data);
            },
            unsubscribed: (data: UnsubscribedContext) => {
                this.unsubscribed(data);
            },
        });
    };

    unsubscribed = (_data: UnsubscribedContext, isResettingConnection = false) => {
        this.spreadPercentage = undefined;
        if (!isResettingConnection) {
            this.isLoading = true;
        }
    };

    getHistory = async (limit: number) => {
        const history = await this.centrifugeService.getHistory(this.currentChannelID, limit);
        return history?.publications ?? [];
    };

    onSubscribed = (data: OrderBookResponseData) => {

        this.asks = [];
        this.rawAsks = [];
        this.bids = [];
        this.rawBids = [];

        this.lastThrottledTime = 0;

        this.sequence = 0;
        this.isCheckingHistory = false;
        this.dumpedDataList = []; // buffer to dump publications while checking history

        this.currentPairSymbol = data.market_id;
        this.currentChannelID = getOrderBookChannelID(this.currentPairSymbol);

        this.update(data, true);
        this.isLoading = false;

        this.centrifugeService
            .getSubscription(this.currentChannelID)
            ?.on('publication', this.onPublication);
    };

    /**
     * Handles new publications (order book updates) and processes the data buffer
     * */
    onPublication = ({data}: any) => {
        this.dumpedDataList.push(data);
        if (this.isCheckingHistory) return;

        for (let i = 0; i < this.dumpedDataList.length; i++) {

            const currentData = this.dumpedDataList[i];

            if (currentData.sequence <= this.sequence) // duplicated or lower sequence
                continue;

            if (currentData.sequence > 1 + this.sequence) { // missing sequence, need to check sequences
                this.checkSequencesOrResubscribe(currentData);
                return;
            }

            this.update(currentData);
        }
        this.dumpedDataList = [];
        this.isLoading = false;
    };


    /**
     * remove current subscription and add new one
     * */
    resubscribe = () => {
        this.isLoading = true;
        this.centrifugeService.removeSubscription(this.currentChannelID);
        this.centrifugeService.addSubscription(
            this.currentChannelID,
            {
                subscribed: (data: SubscribedContext) => {
                    this.onSubscribed(data.data);
                },
                unsubscribed: (data: UnsubscribedContext) => {
                    this.unsubscribed(data, true);
                },
            },
        );
    };

    /**
     * check history of publications and reflect missed data, otherwise resubscribe
     * */
    checkSequencesOrResubscribe = async (currentData: OrderBookResponseData) => {
        this.dumpedDataList = [];
        this.isLoading = false;
        this.isCheckingHistory = true;
        let publications: PublicationContext[] = [];

        for (let i = 0; i < CHECK_HISTORY_COUNTS.length; i++) {
            if (i === 0 || 
                (publications.length > 0 && publications[publications.length - 1].data.sequence > this.sequence + 1)) { // first time or still need to fetch more histories
                publications = await this.getHistory(CHECK_HISTORY_COUNTS[i]);
            }
        }

        publications = publications.reverse();

        if (publications.length === 0) { // no history
            this.isCheckingHistory = false;
            this.update(currentData);

        } else if (publications[0].data.sequence > this.sequence + 1) { // still incorrect sequence
            this.resubscribe();
            this.isCheckingHistory = false;

        } else { // can update data by publications
            for (let i = 0; i < publications.length; i++) {
                if (publications[i].data.sequence > this.sequence) { // is new publication
                    this.update(publications[i].data);
                }
            }
            this.isCheckingHistory = false;

        }

    };

}

export default OrderBookStore;
