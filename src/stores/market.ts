import CentrifugeService from '../services/centrifugeService';

import {SubscribedContext, UnsubscribedContext,} from 'centrifuge';
import {action, makeAutoObservable, observable} from 'mobx';
import {PriceChangeType} from "../constants";
import {getMarketChannelID} from "../utils";


class MarketStore {

    private centrifugeService = CentrifugeService.getInstance();

    lastTradePrice: number | undefined = undefined;
    priceChangeType: PriceChangeType = PriceChangeType.UP;
    currentPairSymbol: string = '';
    currentChannelID: string = '';
    isLoading: boolean = false;

    constructor() {
        makeAutoObservable(this, {
            lastTradePrice: observable,
            priceChangeType: observable,
            isLoading: observable,
            setIsLoading: action,
            setLastTradePrice: action,
            setPriceChangeType: action,
        });

    }

    setIsLoading = (isLoading: boolean) => {
        this.isLoading = isLoading;
    };

    setLastTradePrice = (lastTradePrice: number) => {
        this.lastTradePrice = lastTradePrice;
    };

    setPriceChangeType = (priceChangeType: PriceChangeType) => {
        this.priceChangeType = priceChangeType;
    }

    subscribe = (pairSymbol: string, newSubscribe: boolean = false) => {

        if (newSubscribe) // remove currentPairSymbol if it is new subscription
            this.currentPairSymbol = '';

        if (pairSymbol === this.currentPairSymbol) // revert if pairSymbol is already in use
            return;

        if (this.currentPairSymbol !== '') {
            // remove previous subscription
            this.centrifugeService.removeSubscription(
                getMarketChannelID(this.currentPairSymbol),
            );
        }

        this.setIsLoading(true);

        this.centrifugeService.addSubscription(getMarketChannelID(pairSymbol), {
            subscribed: (data: SubscribedContext) => {
                this.onSubscribed(data);
            },
            unsubscribed: (data: UnsubscribedContext) => {
                this.unsubscribed(data);
            },
        });
    };

    unsubscribed = (_data: UnsubscribedContext) => {
        this.setIsLoading(true);
    };

    onSubscribed = (data: SubscribedContext) => {
        this.currentPairSymbol = data.data.id;
        this.currentChannelID = getMarketChannelID(this.currentPairSymbol);
        this.setIsLoading(false);

        this.centrifugeService
            .getSubscription(this.currentChannelID)
            ?.on('publication', this.onPublication);
    };

    onPublication = ({data}: any) => {
        if (data?.last_trade_price) {
            this.setIsLoading(false);
            this.setPriceChangeType(parseFloat(data.last_trade_price) > (this.lastTradePrice ?? 0) ? PriceChangeType.DOWN : PriceChangeType.UP);
            this.setLastTradePrice(parseFloat(data.last_trade_price));
        }
    };


}


export default MarketStore;
