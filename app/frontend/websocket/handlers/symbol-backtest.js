const _ = require('lodash');
const Downloader = require('nodejs-file-downloader');
const AdmZip = require('adm-zip');
const fs = require('fs');
const csv = require('csv-parser');
const {
  executeBackTest
} = require('../../../cronjob/trailingTrade/step/determine-backtest.js');
const { cache, PubSub, binance, messenger } = require('../../../helpers');
/**
 * Delete last buy price
 *
 * @param {*} logger
 * @param {*} ws
 * @param {*} symbol
 * @returns
 */

const unZipIt = async (path, fileName) => {
  const finalPath = path + fileName;
  messenger.errorMessage(`Final path to unzip ${finalPath}`);
  const zip = new AdmZip(finalPath);
  zip.extractAllTo(path, true);
  messenger.errorMessage('Extract successfull...');
  return true;
};

const downloadZipFromBinance = async (startDate, endDate, symbol) => {
  const dateStart = new Date(startDate);
  const dateEnd = new Date(endDate);

  // To calculate the time difference of two dates
  const Difference_In_Time = dateEnd.getTime() - dateStart.getTime();

  // To calculate the no. of days between two dates
  const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  const dataFromZip = [];

  messenger.errorMessage(`Diff in days: ${Difference_In_Days}`);

  for (
    let candleNumber = 1;
    candleNumber <= Difference_In_Days;
    candleNumber++
  ) {
    var day = startDate.substring(0, 2);
    var month = startDate.substring(3, 5);
    var year = startDate.substring(6, 10);

    day = day.substring(0, 1) + candleNumber;

    if (day == 30) {
      day = '01';
      month = month.substring(3, 4) + candleNumber;
    }

    if (month == 13) {
      month = '01';
      year = year.substring(6, 9) + candleNumber;
    }

    const path = require('path').resolve('./');
    const filename = `/${symbol}-1m-${year}-${month}-${day}`;

    messenger.errorMessage(
      `Trying to read from file at path: ${path}/${symbol}-1m-${year}-${month}-${day}.csv`
    );

    try {
      const fp = `${path + filename}.csv`;
      jhu;

      messenger.errorMessage('start parsing');
      fs.createReadStream(fp)
        .pipe(csv())
        .on('data', data => dataFromZip.push(data))
        .on('end', () => {
          messenger.errorMessage('Parsing ended successfully.');
        });
    } catch {
      messenger.errorMessage(
        'Couldnt access a file in disk. Gonna download it.'
      );

      const link = `https://data.binance.vision/data/spot/daily/klines/${symbol}/1m/${symbol}-1m-${year}-${month}-${day}.zip`;

      messenger.errorMessage(
        `link: ${link} dir: ${require('path').resolve('./')}`
      );

      new Downloader({ url: link, directory: path }).download().then(file => {
        messenger.errorMessage(
          `${
            'Download successfull 2/2' + ' path; '
          }${path}/${symbol}-1m-${year}-${month}-${day}.zip`
        );
        const fifle = file;
        if (unZipIt(path, `${filename}.zip`)) {
          messenger.errorMessage('json obtained correctly after download');
          const jsonObj = csv().fromFile(`${path + filename}.csv`);

          if (jsonObj != undefined) {
            messenger.errorMessage(
              `json obtained correctly from disk after download${jsonObj.length}`
            );

            // [openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, numberOfTrades, takerBuyBaseAsset, takerBuQuoteAssetVolume, ignore]
            dataFromZip.push(+jsonObj);
          }
        }
      });
    }

    if (candleNumber == Difference_In_Days) {
      messenger.errorMessage(`data length: ${dataFromZip.length}`);
      return dataFromZip;
    }
  }
};

const getBackTestData = async (
  ws,
  symbol,
  rawData,
  moneyToTest,
  daysToTest
) => {
  // Retrieve symbol info
  const cachedSymbolInfo =
    JSON.parse(
      await cache.hget('trailing-trade-symbols', `${symbol}-symbol-info`)
    ) || {};

  if (_.isEmpty(cachedSymbolInfo) === true) {
    PubSub.publish('frontend-notification', {
      type: 'error',
      title:
        `The bot could not retrieve the cached symbol information for ${symbol}.` +
        ` Wait for the symbol information to be cached and try again.`
    });

    ws.send(
      JSON.stringify({
        result: false,
        type: 'symbol-update-last-buy-price-result',
        message:
          `The bot could not retrieve the cached symbol information for ${symbol}.` +
          ` Wait for the symbol information to be cached and try again.`
      })
    );
    return false;
  }

  const { interval } = rawData.configuration.candles;
  const limit = Math.round(daysToTest * 1440);

  const { symbolInfo } = rawData;
  const symbolConfiguration = rawData.configuration;

  PubSub.publish('frontend-notification', {
    type: 'success',
    title: `Retrieved last candles ${limit} candles`
  });

  downloadZipFromBinance('01/03/2021', '01/05/2021', 'ETHUSDT');

  const candles = await binance.client.candles({
    symbol,
    interval,
    limit
  });

  const backtestData = await executeBackTest(
    rawData,
    candles,
    moneyToTest,
    symbolInfo,
    symbolConfiguration
  );
  const profit = parseFloat(backtestData.profit.toFixed(2));
  const remainingMoney = parseFloat(
    (backtestData.remainingMoney + backtestData.remainingBoughtAsset).toFixed(2)
  );

  if (backtestData == null) {
    PubSub.publish('frontend-notification', {
      type: 'error',
      title: `There was a problem with backtest. Please, try again.`
    });
  } else {
    PubSub.publish('frontend-notification', {
      type: 'success',
      title: `The backtest has ended successfully.
                Profit: $${profit}
                Buys: ${backtestData.buys}
                Sells: ${backtestData.sells}
                Remaining Money: ${remainingMoney}`
    });
  }

  ws.send(
    JSON.stringify({
      result: true,
      type: 'symbol-backtest-result',
      message: `The backtest has ended successfully.
      Profit: $${profit}
      Buys: ${backtestData.buys}
      Sells: ${backtestData.sells}
      Remaining Money: ${remainingMoney}`
    })
  );

  return true;
};

const handleSymbolBackTest = async (logger, ws, payload) => {
  logger.info({ payload }, 'Starting backtest');

  const { data } = payload;

  messenger.errorMessage('Trying to start backtest');

  PubSub.publish('frontend-notification', {
    type: 'success',
    title: `Starting backtest....`
  });

  const {
    symbol,
    configuration: {
      backtest: { moneyToTest, daysToTest }
    }
  } = data;
  messenger.errorMessage('Trying to start backtest -- done');

  return getBackTestData(ws, symbol, data, moneyToTest, daysToTest);
};

module.exports = { handleSymbolBackTest };
