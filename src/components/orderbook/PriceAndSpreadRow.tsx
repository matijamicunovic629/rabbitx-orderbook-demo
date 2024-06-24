import {FiArrowDownRight, FiArrowUpRight} from "react-icons/fi";
import {useAppContext} from '../../contexts/AppContext';
import {MIN_SPREAD_PERCENTAGE_VALUE, PriceChangeType} from '../../constants';
import {observer} from 'mobx-react';
import {formatNumberByFrac} from "../../utils";


const PriceAndSpreadRow = ({
                               spreadPercentage,
                           }: {
    spreadPercentage: number | undefined;
}) => {
    const {
        market: {
            lastTradePrice,
            priceChangeType
        }
    } = useAppContext();

    const priceChangeArrow = priceChangeType === PriceChangeType.UP
        ? <FiArrowUpRight/>
        : <FiArrowDownRight/>;

    const priceDomClass = priceChangeType === PriceChangeType.UP
        ? 'up'
        : 'down';

    return (
        <div className="price-and-spread-row">
            <div className={`price-container ${priceDomClass}`}>
                {
                    lastTradePrice && (
                        <>
                            {priceChangeArrow}
                            {lastTradePrice}
                        </>
                    )
                }
            </div>
            {
                (spreadPercentage ?? 0) > MIN_SPREAD_PERCENTAGE_VALUE
                    ? formatNumberByFrac(spreadPercentage ?? 0, 2)
                    : MIN_SPREAD_PERCENTAGE_VALUE
            }%
        </div>
    );
};

export default observer(PriceAndSpreadRow);
