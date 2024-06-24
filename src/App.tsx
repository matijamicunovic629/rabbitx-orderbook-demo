import {AppContextProvider} from "./contexts/AppContext"
import OrderBook from "./components/orderbook";

function App() {

    return (
        <AppContextProvider>
            <OrderBook pairSymbol={"BTC-USD"}/>
        </AppContextProvider>
    )
}

export default App
