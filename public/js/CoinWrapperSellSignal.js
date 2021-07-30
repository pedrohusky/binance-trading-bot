/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperSellSignal extends React.Component {
  render() {
    const { symbolInfo, sendWebSocket, jsonStrings } = this.props;
    const {
      symbolInfo: {
        filterPrice: { tickSize }
      },
      symbolConfiguration,
      quoteAssetBalance: { asset: quoteAsset },
      sell
    } = symbolInfo;

    if (sell.openOrders.length > 0 || _.isEmpty(jsonStrings)) {
      return '';
    }

    const { coin_wrapper, common_strings } = jsonStrings;

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

    if (sell.lastBuyPrice > 0) {
      return (
        <div className='coin-info-sub-wrapper'>
          <div className='coin-info-column coin-info-column-title'>
            <div className='coin-info-label'>
              {common_strings.sell_signal}{' '}
              <span className='coin-info-value'>
                {symbolConfiguration.sell.enabled ? (
                  <i className='fa fa-toggle-on'></i>
                ) : (
                  <i className='fa fa-toggle-off'></i>
                )}
              </span>{' '}
              / {common_strings.stop_loss}{' '}
              <span className='coin-info-value'>
                {symbolConfiguration.sell.stopLoss.enabled ? (
                  <i className='fa fa-toggle-on'></i>
                ) : (
                  <i className='fa fa-toggle-off'></i>
                )}
              </span>
            </div>
            {symbolConfiguration.sell.enabled === false ? (
              <HightlightChange className='coin-info-message text-muted'>
                {common_strings.trading_disabled}.
              </HightlightChange>
            ) : (
              ''
            )}
          </div>

          {sell.currentPrice ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>{common_strings.current_price}:</span>
              <HightlightChange className='coin-info-value'>
                {parseFloat(sell.currentPrice).toFixed(precision)}
              </HightlightChange>
            </div>
          ) : (
            ''
          )}
          <CoinWrapperSellAveragedPrice
            symbolInfo={symbolInfo}
            sendWebSocket={sendWebSocket}
            jsonStrings={jsonStrings}>
          </CoinWrapperSellAveragedPrice>
          <CoinWrapperSellLastBuyPrice
            symbolInfo={symbolInfo}
            sendWebSocket={sendWebSocket}
            jsonStrings={jsonStrings}>
          </CoinWrapperSellLastBuyPrice>
          {sell.currentProfit ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>{common_strings.profit_loss}:</span>
              {Math.sign(sell.currentProfitPercentage != 0) ? (

                Math.sign(sell.currentProfitPercentage) == 1 ? (
                  <HightlightChange className='coin-info-value-up'>
                    {parseFloat(sell.currentProfit).toFixed(precision)} {quoteAsset}{' '}
                    ({parseFloat(sell.currentProfitPercentage).toFixed(2)}
                    %)
                  </HightlightChange>
                ) : (
                  <HightlightChange className='coin-info-value-down'>
                    {parseFloat(sell.currentProfit).toFixed(precision)} {quoteAsset}{' '}
                    ({parseFloat(sell.currentProfitPercentage).toFixed(2)}
                    %)
                  </HightlightChange>
                )

              ) : (
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.currentProfit).toFixed(precision)} {quoteAsset}{' '}
                  ({parseFloat(sell.currentProfitPercentage).toFixed(2)}
                  %)
                </HightlightChange>
              )}

            </div>
          ) : (
            ''
          )}
          <div className='coin-info-column coin-info-column-price divider'></div>
          {sell.triggerPrice ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>
                {coin_wrapper.trigger_price} (
                {(
                  (symbolConfiguration.sell.triggerPercentage - 1) *
                  100
                ).toFixed(2)}
                %):
              </span>
              <HightlightChange className='coin-info-value'>
                {parseFloat(sell.triggerPrice).toFixed(precision)}
              </HightlightChange>
            </div>
          ) : (
            ''
          )}
          {sell.difference ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>{coin_wrapper.diff_sell}:</span>
              <HightlightChange className='coin-info-value'>
                {parseFloat(sell.difference).toFixed(2)}%
              </HightlightChange>
            </div>
          ) : (
            ''
          )}

          {symbolConfiguration.sell.stopLoss.enabled &&
            sell.stopLossTriggerPrice ? (
            <div className='d-flex flex-column w-100'>
              <div className='coin-info-column coin-info-column-price divider'></div>
              <div className='coin-info-column coin-info-column-stop-loss-price'>
                <span className='coin-info-label'>
                  {coin_wrapper.stop_loss_price} (
                  {(
                    (symbolConfiguration.sell.stopLoss.maxLossPercentage - 1) *
                    100
                  ).toFixed(2)}
                  %) :
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.stopLossTriggerPrice).toFixed(precision)}
                </HightlightChange>
              </div>
              <div className='coin-info-column coin-info-column-stop-loss-price'>
                <span className='coin-info-label'>
                  {coin_wrapper.diff_stop_loss}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.stopLossDifference).toFixed(2)}%
                </HightlightChange>
              </div>
            </div>
          ) : (
            ''
          )}
          {sell.processMessage ? (
            <div className='d-flex flex-column w-100'>
              <div className='coin-info-column coin-info-column-price divider'></div>
              <div className='coin-info-column coin-info-column-message'>
                <HightlightChange className='coin-info-message'>
                  {sell.processMessage}
                </HightlightChange>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      );
    }

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title'>
          <div className='coin-info-label'>
            {common_strings.sell_signal}{' '}
            <span className='coin-info-value'>
              {symbolConfiguration.sell.enabled ? (
                <i className='fa fa-toggle-on'></i>
              ) : (
                <i className='fa fa-toggle-off'></i>
              )}
            </span>{' '}
            / {common_strings.stop_loss}{' '}
            {symbolConfiguration.sell.stopLoss.enabled
              ? `(` +
              (
                (symbolConfiguration.sell.stopLoss.maxLossPercentage - 1) *
                100
              ).toFixed(2) +
              `%) `
              : ''}
            <span className='coin-info-value'>
              {symbolConfiguration.sell.stopLoss.enabled ? (
                <i className='fa fa-toggle-on'></i>
              ) : (
                <i className='fa fa-toggle-off'></i>
              )}
            </span>
          </div>
          {symbolConfiguration.sell.enabled === false ? (
            <HightlightChange className='coin-info-message text-muted'>
              {common_strings.trading_disabled}.
            </HightlightChange>
          ) : (
            ''
          )}
        </div>

        <CoinWrapperSellAveragedPrice
          symbolInfo={symbolInfo}
          sendWebSocket={sendWebSocket}
          jsonStrings={jsonStrings}>
        </CoinWrapperSellAveragedPrice>
        <CoinWrapperSellLastBuyPrice
          symbolInfo={symbolInfo}
          sendWebSocket={sendWebSocket}
          jsonStrings={jsonStrings}>
        </CoinWrapperSellLastBuyPrice>
      </div>
    );
  }
}
