const _ = require('lodash');
const moment = require('moment');
const config = require('config');
const { binance, messenger, cache } = require('../../../helpers');
const {
  getAndCacheOpenOrdersForSymbol,
  getAccountInfoFromAPI,
  isExceedAPILimit
} = require('../../trailingTradeHelper/common');

const retrieveLastBuyOrder = async symbol => {
  const cachedLastBuyOrder =
    JSON.parse(await cache.get(`${symbol}-last-buy-order`)) || {};

  return _.isEmpty(cachedLastBuyOrder);
};

/**
 * Place a buy order if has enough balance
 *
 * @param {*} logger
 * @param {*} rawData
 */
const execute = async (logger, rawData) => {
  const data = rawData;

  const {
    symbol,
    isLocked,
    symbolInfo: {
      baseAsset,
      quoteAsset,
      filterLotSize: { stepSize },
      filterPrice: { tickSize },
      filterMinNotional: { minNotional }
    },
    symbolConfiguration: {
      buy: {
        enabled: tradingEnabled,
        minPurchaseAmount,
        currentGridTradeIndex,
        currentGridTrade
      },
      strategyOptions: {
        huskyOptions: { buySignal }
      }
    },
    action,
    quoteAssetBalance: { free: quoteAssetFreeBalance },
    buy: {
      currentPrice,
      openOrders,
      trend: { signedTrendDiff }
    }
  } = data;

  const humanisedGridTradeIndex = currentGridTradeIndex + 1;

  if (isLocked) {
    logger.info(
      { isLocked },
      'Symbol is locked, do not process place-buy-order'
    );
    return data;
  }

  if (action !== 'buy') {
    logger.info(`Do not process a buy order because action is not 'buy'.`);
    return data;
  }

  const language = config.get('language');
  const {
    coin_wrapper: { _actions }
  } = require(`../../../../public/${language}.json`);

  if (!(await retrieveLastBuyOrder(symbol))) {
    data.buy.processMessage = 'cant buy, found open order in cache';
    return data;
  }

  if (openOrders.length > 0) {
    data.buy.processMessage = `${action.action_open_orders[1] + symbol}.${
      _actions.action_open_orders[2]
    }`;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  if (currentGridTrade === null) {
    data.buy.processMessage = `Current grid trade is not defined. Cannot place an order.`;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  const { maxPurchaseAmount, stopPercentage, limitPercentage } =
    currentGridTrade;
  if (maxPurchaseAmount <= 0) {
    data.buy.processMessage =
      'Max purchase amount must be configured. Please configure symbol settings.';
    data.buy.updatedAt = moment().utc();

    return data;
  }

  logger.info(
    { debug: true, currentPrice, openOrders },
    'Attempting to place buy order'
  );

  const lotStepSizePrecision =
    parseFloat(stepSize) === 1 ? 0 : stepSize.indexOf(1) - 1;
  const priceTickPrecision =
    parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

  const orgFreeBalance = parseFloat(
    _.floor(quoteAssetFreeBalance, priceTickPrecision)
  );
  let freeBalance = orgFreeBalance;

  logger.info({ freeBalance }, 'Free balance');
  if (freeBalance > maxPurchaseAmount) {
    freeBalance = maxPurchaseAmount;
    logger.info({ freeBalance }, 'Free balance after adjust');
  }

  if (freeBalance < parseFloat(minNotional)) {
    data.buy.processMessage =
      `Do not place a buy order for the grid trade #${humanisedGridTradeIndex} ` +
      `as not enough ${quoteAsset} to buy ${baseAsset}.`;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  if (freeBalance < parseFloat(minPurchaseAmount)) {
    data.buy.processMessage =
      'Free balance is less than min purchase amount. I will not buy.';
    data.buy.updatedAt = moment().utc();

    return data;
  }

  const stopPrice = _.floor(currentPrice * stopPercentage, priceTickPrecision);
  const limitPrice = _.floor(
    currentPrice * limitPercentage,
    priceTickPrecision
  );

  logger.info({ stopPrice, limitPrice }, 'Stop price and limit price');

  const orderQuantityBeforeCommission = parseFloat(
    _.ceil(freeBalance / limitPrice, lotStepSizePrecision)
  );
  logger.info(
    { orderQuantityBeforeCommission },
    'Order quantity before commission'
  );
  let orderQuantity = parseFloat(
    _.floor(
      orderQuantityBeforeCommission -
        orderQuantityBeforeCommission * (0.1 / 100),
      lotStepSizePrecision
    )
  );

  // If free balance is exactly same as minimum notional, then it will be failed to place the order
  // because it will be always less than minimum notional after calculating commission.
  // To avoid the minimum notional issue, add commission to free balance

  if (
    orgFreeBalance > parseFloat(minNotional) &&
    maxPurchaseAmount === parseFloat(minNotional)
  ) {
    // Note: For some reason, Binance rejects the order with exact amount of minimum notional amount.
    // For example,
    //    - Calculated limit price: 289.48 (current price) * 1.026 (limit percentage) = 297
    //    - Calcuated order quantity: 0.0337
    //    - Calculated quote amount: 297 * 0.0337 = 10.0089, which is over minimum notional value 10.
    // Above the order is rejected by Binance with MIN_NOTIONAL error.
    // As a result, I had to re-calculate if max purchase amount is exactly same as minimum notional value.
    orderQuantity = parseFloat(
      _.ceil(
        (freeBalance + freeBalance * (0.1 / 100)) / limitPrice,
        lotStepSizePrecision
      )
    );
  }

  logger.info({ orderQuantity }, 'Order quantity after commission');

  if (orderQuantity * limitPrice < parseFloat(minNotional)) {
    const processMessage =
      `Do not place a buy order for the grid trade #${humanisedGridTradeIndex} ` +
      `as not enough ${quoteAsset} ` +
      `to buy ${baseAsset} after calculating commission - Order amount: ${_.floor(
        orderQuantity * limitPrice,
        priceTickPrecision
      )} ${quoteAsset}, Minimum notional: ${minNotional}.`;
    logger.info(
      { calculatedAmount: orderQuantity * limitPrice, minNotional },
      processMessage
    );
    data.buy.processMessage = processMessage;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  if (tradingEnabled !== true) {
    data.buy.processMessage =
      `Trading for ${symbol} is disabled. ` +
      `Do not place an order for the grid trade #${humanisedGridTradeIndex}.`;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  if (isExceedAPILimit(logger)) {
    data.buy.processMessage = `Binance API limit has been exceeded. Do not place an order.`;
    data.buy.updatedAt = moment().utc();

    return data;
  }

  if (buySignal) {
    if (signedTrendDiff === -1) {
      data.buy.processMessage = 'Trend is going down, cancelling order';
      data.buy.updatedAt = moment().utc();

      return data;
    }
  }

  const orderParams = {
    symbol,
    side: 'buy',
    type: 'STOP_LOSS_LIMIT',
    quantity: orderQuantity,
    stopPrice,
    price: limitPrice,
    timeInForce: 'GTC'
  };

  messenger.sendMessage(symbol, orderParams, 'PLACE_BUY');

  logger.info(
    { debug: true, function: 'order', orderParams },
    'Buy order params'
  );
  const orderResult = await binance.client.order(orderParams);

  logger.info({ orderResult }, 'Order result');

  // Get open orders and update cache
  data.openOrders = await getAndCacheOpenOrdersForSymbol(logger, symbol);
  data.buy.openOrders = data.openOrders.filter(
    o => o.side.toLowerCase() === 'buy'
  );

  // Refresh account info
  data.accountInfo = await getAccountInfoFromAPI(logger, true);

  messenger.sendMessage(symbol, orderResult, 'PLACE_BUY_DONE');

  // Set last buy order to be checked over infinite minutes until callback is received.
  await cache.set(`${symbol}-last-buy-order`, JSON.stringify(orderResult));

  data.buy.processMessage = _actions.action_placed_new_order;
  data.buy.updatedAt = moment().utc();

  // Save last buy price
  return data;
};

module.exports = { execute };
