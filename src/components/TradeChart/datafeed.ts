/*
import axios from "axios";

const configurationData = {
  "supported_resolutions": ["5", "15", "30", "60", "240", "1D", "1W"],
  "supports_time": true,
  "supports_marks": false,
  "supports_timescale_marks": false
};

export default {
  onReady: (callback) => {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (
      // userInput,
      // exchange,
      // symbolType,
      // onResultReadyCallback
  ) => {
    console.log("[searchSymbols]: Method call");
  },

  resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      // onResolveErrorCallback
  ) => {
    const terms = symbolName.split('-');

    const symbolInfo = {
      ticker: `${terms[0]}/${terms[1]}`,
      name: symbolName,
      description: `${terms[0]}/${terms[1]}`,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'rabbitX',
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false,
      visible_plots_set: 'ohlcv',
      supported_resolutions: configurationData.supported_resolutions!,
      volume_precision: 8,
      data_status: 'streaming',
    };

    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      // onErrorCallback
  ) => {
    const { from, to } = periodParams;

    const {data: chartData} = await axios.get('https://api.prod.rabbitx.io/candles', {
      params: {
        market_id: symbolInfo.name,
        timestamp_from: from,
        timestamp_to: to,
        period: resolution,
      },
    });

    onHistoryCallback(chartData, { noData: false });
  },

  subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      // onResetCacheNeededCallback
  ) => {
    console.log(
        "[subscribeBars]: Method call with subscribeUID:",
        subscribeUID
    );
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
        "[unsubscribeBars]: Method call with subscriberUID:",
        subscriberUID
    );
  },
};

*/
