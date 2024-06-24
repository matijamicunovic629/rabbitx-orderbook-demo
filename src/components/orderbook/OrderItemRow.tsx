import {useEffect, useState} from 'react';
import {BG_DEPTH_VISUALIZER_ASK, BG_DEPTH_VISUALIZER_BID, OrderType} from '../../constants';
import {Order} from '../../interfaces/interfaceOrderbook';
import {observer} from 'mobx-react';
import {formatNumberByFrac} from "../../utils";

interface Props {
    order?: Order;
    orderType?: OrderType;
}

const OrderItemRow = ({
                          order: {price, amount, total, isChanged, depthVisualizerPercentage} = {
                              price: 0,
                              amount: 0,
                              total: 0,
                              isChanged: false,
                              depthVisualizerPercentage: 0,
                          },
                          orderType,
                      }: Props) => {

    const [firstTimeChanged, setFirstTimeChanged] = useState(isChanged);

    useEffect(() => {
        setFirstTimeChanged(isChanged);
        // change first time flag into false after 500ms
        const timeout = setTimeout(() => {
            setFirstTimeChanged(false);
        }, 500);
        return () => clearTimeout(timeout);
    }, [isChanged, orderType, price, amount]);


    return (
        <div className={"order-item-row " + (firstTimeChanged ? 'changed' : '')}
             order-type={orderType === OrderType.BID ? 'bid' : 'ask'}
        >
            <div>
                {/* TODO: add price decimals to show price */}
                {price}
            </div>
            <div>
                {formatNumberByFrac(amount, 4)}
            </div>
            <div>
                <div
                    className="depth-visualizer"
                    style={{
                        width: `${depthVisualizerPercentage}%`,
                        backgroundColor: orderType === OrderType.ASK ? BG_DEPTH_VISUALIZER_ASK : BG_DEPTH_VISUALIZER_BID,
                    }}
                ></div>
                {formatNumberByFrac(total, 4)}
            </div>
        </div>
    );
};

export default observer(OrderItemRow);
