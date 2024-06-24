import {retrieveOrdersWithDepthPercentage} from '../../utils';
import {OrderType} from '../../constants';
import {Order} from '../../interfaces/interfaceOrderbook';
import OrderItemRow from "./OrderItemRow";

type Props = {
    orders: Order[];
    isLoading: boolean;
    orderType: OrderType
};
const BidsAndAsksTable = ({
                              orders,
                              isLoading,
                              orderType
                          }: Props) => {
    const mergedOrders = retrieveOrdersWithDepthPercentage(orders.slice(0, 15), orderType);

    return (
        <div className="bids-asks-table">
            {
                !isLoading ? (
                    mergedOrders.map((item, index) => (
                        <OrderItemRow
                            order={item}
                            orderType={orderType}
                            key={'asks-' + index}
                        />
                    ))
                ) : (
                  <div className="empty-container">
                  Loading...
                  </div>
                )
            }
        </div>
    );
};

export default BidsAndAsksTable;
