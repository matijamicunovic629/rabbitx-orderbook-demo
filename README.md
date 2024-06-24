# RabbitX OrderBook Demo
- LiveURL: https://rabbitx-orderbook-demo-kaq8.vercel.app/


## Task Description
By using RabbitX API, I implemented an isolated UI component that represents an orderbook, which displays bids and asks by traders on an exchange. Utilize websocket updates to construct and update the orderbook (bids and asks array) in an optimized manner without causing memory leaks. Implement logic to handle network connection loss and resubscribe automatically, as well as manage lost packages based on incorrect sequence numbers.


## Approach

-  Created a CentrifugeService to handle Centrifuge WebSocket actions, ensuring adherence to the DRY principle and promoting modularization.
-  Utilized MobX to improve the robustness of the application by providing efficient and reactive state management for the orderbook.

## Challenges 

#### verifying the correctness of sequence numbers in the websocket updates

Upon receiving data through the `onPublication` method, sequences are checked to account for potential lost packages.
```js
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

```
Handles checking historical data to resolve missed sequences or resubscribing if sequences remain incorrect,
```js
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

```

#### Throttling in Ensuring Orderbook Stability and Performance
  throttling is crucial to manage high traffic data effectively.
  This approach safeguards against potential performance issues and maintains the reliability of the trading system during periods of peak activity.

```js
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
```


#### Handling network connection disruptions
I implemented logic to disconnect upon detecting offline status and automatically reconnect when online.

```js
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

```

## Possible Improvements

- **Handling Large Volumes of Data**: In this example, we're currently displaying less than 100 orders. However, if you need to handle more than 1000 orders, you might consider implementing a performance-optimized data structure such as an AVL tree. This would enable efficient management and retrieval of data, ensuring that operations remain feasible even with larger datasets.
- **Testing and Validation**: Testing the implementation using real-time data to ensure that the local orderbook correctly reflects the state of the orderbook on the RabbitX exchange
- **Load Testing**: Conduct extensive load testing to understand the limits of the current implementation and identify bottlenecks under various market conditions


## In Addition
I also implemented TradingView using the RabbitX candle public endpoint, but it doesn't work due to CORS errors. :(

## conclusion
I would like to extend my gratitude to the RabbitX team for the opportunity to implement and document the orderbook functionality using their WebSocket API. This task has provided valuable experience in real-time data handling and WebSocket communication, contributing to my skills in financial technology development.
