/*
import {useEffect, useState} from "react";
import Datafeeds from "./datafeed";

const TradeChart = ({pairSymbol}) => {
    const [widget, setWidget] = useState(null);

    useEffect(() => {
        const widgetOptions = {
            autosize: true,
            toolbar_bg: '#000',
            symbol: pairSymbol,
            interval: "1D", // default interval
            fullscreen: false, // displays the chart in the fullscreen mode
            container: "trade-chart-container",
            datafeed: Datafeeds,
            library_path: "/charting_library/",
            custom_css_url: 'https://assets.staticimg.com/trade-web/4.2.28/charting_library_24/custom.css',
            theme: "dark",
            charts_storage_url: 'https://saveload.tradingview.com',
            disabled_features: [
                "volume_force_overlay",
                "timeframes_toolbar",
                "go_to_date",
                'header_symbol_search',
                'header_compare',
                'header_undo_redo',
                'control_bar',
                'display_market_status',
                'show_hide_button_in_legend',
                'edit_buttons_in_legend',
                'header_chart_type',
                'volume_force_overlay',
                'legend_context_menu',
                'use_localstorage_for_settings'
            ],
            enabled_features: ["study_templates"],// ['hide_last_na_study_output', 'hide_left_toolbar_by_default'],
            overrides: {
                "paneProperties.backgroundType": "solid",
                "paneProperties.background": "#000",
            },
            loading_screen: {
                backgroundColor: "#000",
                foregroundColor: "#000"
            }
        };

        const tvWidget = new TradingView.widget(widgetOptions);
        setWidget(tvWidget);

        return () => {
            if (widget)
                widget.remove();
        };
    }, []);

    useEffect(() => {
        if (pairSymbol && widget) {
            widget.setSymbol(pairSymbol, widget.symbolInterval()?.interval, () => null);
        }
    }, [pairSymbol]);

    return (
        <div id='trade-chart-container'/>
    );
}

export default TradeChart;
*/
