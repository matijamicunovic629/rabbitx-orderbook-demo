import {Order} from '../interfaces/interfaceOrderbook';
import {OrderType} from "../constants";

export const getOrderBookChannelID = (pairSymbol: string) =>
    `orderbook:${pairSymbol}`;

export const getMarketChannelID = (pairSymbol: string) =>
    `market:${pairSymbol}`;

export const getSpreadPercentage = (
    spreadAmount: number,
    highestBid: number,
) => {
    return (spreadAmount / highestBid) * 100;
};


/**
 * Merge previous orders with new orders
 * @param prevOrders prev orders Array
 * @param newOrderRawData new order data from centrifuge response of publication ([['price', 'amount'], ['price', 'amount']])
 * @param firstFlag flag that represents whether newOrderRawData is initial orderbook data
 * @returns merged and sorted orders in descending
 */
export const mergeAndSortOrderBook = (
    prevOrders: Order[],
    newOrderRawData: string[][],
    firstFlag = false,
) => {

    // convert raw response data into Order Array
    const newOrders: Order[] = newOrderRawData.map(
        ([price, amount]) => {
            return {
                price: parseFloat(price),
                amount: parseFloat(amount),
                total: 0,
                isChanged: false,
                depthVisualizerPercentage: 0,
            };
        },
    );

    const prevMap = new Map(
        prevOrders.map(prevOrder => [
            prevOrder.price, // price is key in this map
            {...prevOrder, isChanged: false}, // value
        ]),
    );

    const resultMap = newOrders.reduce((accMap, currentOrder) => {
        accMap.set(currentOrder.price, {
            ...currentOrder,
            isChanged: !firstFlag,
        });
        return accMap;
    }, prevMap);

    // remove empty amount orders
    const mergedOrders = Array
        .from(resultMap.values())
        .filter(item => {
            return item.amount !== 0;
        });


    // Return orders sorted in descending order
    return mergedOrders.sort((a, b) => b.price - a.price)

};

/**
 * retrieve orders with total amount and depth percentage for each order
 * @returns updated orders
 */
export const retrieveOrdersWithDepthPercentage = (
    orders: Order[],
    orderType: OrderType,
) => {

    if (!orders.length)
        return [];

    let amountSum = 0;
    orders.forEach((order: Order) => {
        amountSum += order.amount;
    })

    let totalAmount = 0;
    const updatedOrders: Order[] = [];

    for (let index = 0; index < orders.length; index++) {
        const order = orders[index];

        totalAmount += order.amount;
        updatedOrders.push({
            ...order,
            total: totalAmount,
            depthVisualizerPercentage: (totalAmount * 100) / amountSum,
        });
    }

    if (orderType === OrderType.ASK) { // for showing
        updatedOrders.reverse();
    }

    return updatedOrders;
};


export const formatNumberByFrac = (num, fixedCount = 2) => {
    // Define the threshold below which numbers are shown as-is
    const threshold = 0.01;
    const minThreshold = 0.000001;
    num = parseFloat(num);

    const getFixedNum = (num, fixedCount) => {
        const multipleValue = (10 ** fixedCount);
        return (Math.floor(num * multipleValue) / multipleValue).toString();
    }

    // If the number is less than the threshold, keep it as-is, otherwise use toFixed()
    if (Number.isInteger(num) || (Math.abs(num) < threshold && Math.abs(num) > minThreshold)) {
        const lengthAfterDecimal = Math.ceil(Math.log10(1 / num));
        if (num > 0 && lengthAfterDecimal > 0) {
            return getFixedNum(num, lengthAfterDecimal + 2);
        }
    }

    return getFixedNum(num, fixedCount);
}
