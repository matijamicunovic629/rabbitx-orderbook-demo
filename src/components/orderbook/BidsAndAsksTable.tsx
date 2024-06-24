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
        <div>
            {
                !isLoading && (
                    mergedOrders.map((item, index) => (
                        <OrderItemRow
                            order={item}
                            orderType={orderType}
                            key={'asks-' + index}
                        />
                    )))
            }
        </div>
    );
};

export default BidsAndAsksTable;
