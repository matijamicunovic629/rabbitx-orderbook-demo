import React, {useContext} from "react";
import OrderBookStore from "../stores/orderbook.ts";
import MarketStore from "../stores/market.ts";

interface AppContextType {
    orderBook: OrderBookStore;
    market: MarketStore;
}

export const AppContext = React.createContext<null | AppContextType>(null);


export const useAppContext = () => {
    const context = useContext(AppContext);
    return context as AppContextType;
};



export const AppContextProvider = ({children}) => {

    const value = {
        orderBook: new OrderBookStore(),
        market: new MarketStore()
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )

}
