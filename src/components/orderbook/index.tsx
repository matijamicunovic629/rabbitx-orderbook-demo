import {observer} from 'mobx-react';
import {useAppContext} from "../../contexts/AppContext";
import {useEffect, useState} from "react";
import TitleRow from "./TitleRow";
import "./styles.scss"
import BidsAndAsksTable from "./BidsAndAsksTable";
import PriceAndSpreadRow from "./PriceAndSpreadRow";
import {OrderType} from "../../constants";
import centrifugeService from "../../services/centrifugeService.ts";

interface OrderBookProp {
    pairSymbol: string
}

const OrderBook = ({pairSymbol}: OrderBookProp) => {

    const [isDisconnected, setIsDisconnected] = useState(false);

    const {
        orderBook: {
            subscribe: subscribeOrderBook,
            asks,
            bids,
            spreadPercentage,
            isLoading,
        },
        market: {
            subscribe: subscribeMarket,
        }
    } = useAppContext();


    // subscribe whenever pairSymbol or connection status changed
    useEffect(() => {
        subscribeOrderBook(pairSymbol, !isDisconnected);
        subscribeMarket(pairSymbol, !isDisconnected);
    }, [
        isDisconnected,
        pairSymbol,
    ]);


    // add event listeners that handle network connection
    useEffect(() => {

        window.addEventListener('offline', () => {
            centrifugeService.disconnect();
            setIsDisconnected(true);
        })

        window.addEventListener('online', () => {
            centrifugeService.getInstance(); // create new centrifuge instance
            setIsDisconnected(false);
        })

    }, []);

    // console.log("lastTradePrice", lastTradePrice, priceChangeType);


    return (
        <div className="orderbook-container">

            {/* asks table */}
            <TitleRow/>
            <BidsAndAsksTable
                orders={asks}
                orderType={OrderType.ASK}
                isLoading={isLoading}
            />

            {/* price and spread panel  */}
            <PriceAndSpreadRow spreadPercentage={spreadPercentage}/>

            {/* bids table */}
            <TitleRow/>
            <BidsAndAsksTable
                orders={bids}
                orderType={OrderType.BID}
                isLoading={isLoading}
            />

        </div>
    )
}


export default observer(OrderBook);
