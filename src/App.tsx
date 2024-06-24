import {AppContextProvider} from "./contexts/AppContext"
import OrderBook from "./components/orderbook";
import "./App.scss"
// import TradeChart from "./components/TradeChart";
function App() {

    return (
        <AppContextProvider>
            <div className="main-wrapper">

                <div className="header">
                    <img src="./rabbit-x-logo.svg"/>
                    <div className="description">
                        Created By <span>Matija Micunovic</span>
                    </div>
                </div>

                <div className="panels-container">
                    {/*<TradeChart pairSymbol={"BTC-USD"}/>*/}
                    <OrderBook pairSymbol={"BTC-USD"}/>
                </div>

            </div>

        </AppContextProvider>
    )
}

export default App
