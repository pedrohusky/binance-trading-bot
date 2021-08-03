/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperBuySignal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  toggleCollapse() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    const { collapsed } = this.state;
    const {
      symbolInfo: {
        symbolInfo: {
          symbol,
          filterPrice: { tickSize }
        },
        quoteAssetBalance: { asset: quoteAsset },
        symbolConfiguration,
        buy,
        sell
      },
      sendWebSocket,
      jsonStrings
    } = this.props;
    if (_.isEmpty(jsonStrings)) {
      return '';
    }

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;
    let predictionHigherThan = 0;
    if (
      buy.prediction !== undefined &&
      buy.prediction.meanPredictedValue !== undefined
    ) {
      predictionHigherThan = (
        100 -
        (parseFloat(buy.currentPrice) /
          parseFloat(buy.prediction.meanPredictedValue[0])) *
          100
      ).toFixed(2);
    }

    const {
      buy: { currentGridTradeIndex, gridTrade }
    } = symbolConfiguration;

    const buyGridRows = gridTrade.map((grid, i) => {
      return (
        <React.Fragment key={'coin-wrapper-buy-grid-row-' + symbol + '-' + i}>
          <div className='coin-info-column-grid'>
            <div className='coin-info-column coin-info-column-price'>
              <div className='coin-info-label'>Grid Trade #{i + 1}</div>

              <div className='coin-info-value'>
                {buy.openOrders.length === 0 && currentGridTradeIndex === i ? (
                  <SymbolTriggerBuyIcon
                    symbol={symbol}
                    sendWebSocket={sendWebSocket}></SymbolTriggerBuyIcon>
                ) : (
                  ''
                )}

                <OverlayTrigger
                  trigger='click'
                  key={'buy-signal-' + symbol + '-' + i + '-overlay'}
                  placement='bottom'
                  overlay={
                    <Popover
                      id={'buy-signal-' + symbol + '-' + i + '-overlay-right'}>
                      <Popover.Content>
                        {grid.executed ? (
                          <React.Fragment>
                            <span>
                              The grid trade #{i + 1} has been executed{' '}
                              {moment(grid.executedOrder.updateTime).fromNow()}{' '}
                              ({moment(grid.executedOrder.updateTime).format()}
                              ).
                            </span>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            The grid trade #{i + 1} has not been executed.{' '}
                            {sell.lastBuyPrice > 0
                              ? i === 0
                                ? 'This grid trade will not be executed because the last buy price is recorded and the first grid trade is not executed.'
                                : currentGridTradeIndex === i
                                ? `Waiting to be executed.`
                                : `Waiting the grid trade #${i} to be executed.`
                              : currentGridTradeIndex === i
                              ? 'Waiting to be executed.'
                              : `Waiting the grid trade #${i} to be executed.`}
                          </React.Fragment>
                        )}
                      </Popover.Content>
                    </Popover>
                  }>
                  <Button
                    variant='link'
                    className='p-0 m-0 ml-1 text-warning d-inline-block'
                    style={{ lineHeight: '17px' }}>
                    {grid.executed ? (
                      // If already executed, then shows executed icon.
                      <i className='fas fa-check-square'></i>
                    ) : sell.lastBuyPrice > 0 ? (
                      i === 0 ? (
                        <i className='far fa-clock text-muted'></i>
                      ) : currentGridTradeIndex === i ? (
                        <i className='far fa-clock'></i>
                      ) : (
                        <i className='far fa-clock text-muted'></i>
                      )
                    ) : currentGridTradeIndex === i ? (
                      <i className='far fa-clock'></i>
                    ) : (
                      <i className='far fa-clock text-muted'></i>
                    )}
                  </Button>
                </OverlayTrigger>

                <button
                  type='button'
                  className='btn btn-sm btn-link p-0 ml-1'
                  onClick={this.toggleCollapse}>
                  <i
                    className={`fas ${
                      collapsed ? 'fa-arrow-right' : 'fa-arrow-down'
                    }`}></i>
                </button>
              </div>
            </div>

            {buy.triggerPrice && currentGridTradeIndex === i ? (
              <div className='coin-info-column coin-info-column-price'>
                <div
                  className='coin-info-label d-flex flex-row justify-content-start'
                  style={{ flex: '0 100%' }}>
                  <span>
                    &#62; Trigger price (
                    {(parseFloat(grid.triggerPercentage - 1) * 100).toFixed(2)}
                    %):
                  </span>
                  {i === 0 &&
                  symbolConfiguration.strategyOptions.athRestriction.enabled &&
                  parseFloat(buy.triggerPrice) >
                    parseFloat(buy.athRestrictionPrice) ? (
                    <OverlayTrigger
                      trigger='click'
                      key='buy-trigger-price-overlay'
                      placement='bottom'
                      overlay={
                        <Popover id='buy-trigger-price-overlay-right'>
                          <Popover.Content>
                            The trigger price{' '}
                            <code>
                              {parseFloat(buy.triggerPrice).toFixed(precision)}
                            </code>{' '}
                            is higher than the ATH buy restricted price{' '}
                            <code>
                              {parseFloat(buy.athRestrictionPrice).toFixed(
                                precision
                              )}
                            </code>
                            . The bot will not place an order even if the
                            current price reaches the trigger price.
                          </Popover.Content>
                        </Popover>
                      }>
                      <Button
                        variant='link'
                        className='p-0 m-0 ml-1 text-warning d-inline-block'
                        style={{ lineHeight: '17px' }}>
                        <i className='fas fa-info-circle fa-sm'></i>
                      </Button>
                    </OverlayTrigger>
                  ) : (
                    ''
                  )}
                </div>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(buy.triggerPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {buy.difference && currentGridTradeIndex === i ? (
              <div className='coin-info-column coin-info-column-price'>
                <span className='coin-info-label'>Difference to buy:</span>
                <HightlightChange
                  className='coin-info-value'
                  id='buy-difference'>
                  {parseFloat(buy.difference).toFixed(2)}%
                </HightlightChange>
              </div>
            ) : (
              ''
            )}

            <div
              className={`coin-info-content-setting ${
                collapsed ? 'd-none' : ''
              }`}>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  - Trigger price percentage:
                </span>
                <div className='coin-info-value'>
                  {((grid.triggerPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  - Stop price percentage:
                </span>
                <div className='coin-info-value'>
                  {((grid.stopPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  - Limit price percentage:
                </span>
                <div className='coin-info-value'>
                  {((grid.limitPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>- Max purchase anmount:</span>
                <div className='coin-info-value'>
                  {grid.maxPurchaseAmount} {quoteAsset}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title'>
          <div className='coin-info-label'>
            {jsonStrings[0].buy_signal} ({symbolConfiguration.candles.interval}/
            {symbolConfiguration.candles.limit}){' '}
            <span className='coin-info-value'>
              {symbolConfiguration.buy.enabled ? (
                <i className='fas fa-toggle-on'></i>
              ) : (
                <i className='fas fa-toggle-off'></i>
              )}
            </span>{' '}
          </div>
          {symbolConfiguration.buy.enabled === false ? (
            <HightlightChange className='coin-info-message text-muted'>
              {jsonStrings[1].trading_disabled}.
            </HightlightChange>
          ) : (
            ''
          )}
        </div>

        {symbolConfiguration.strategyOptions.huskyOptions.buySignal &&
        _.isEmpty(buy.trend) === false ? (
          <div className='coin-info-column coin-info-column-right coin-info-column-balance'>
            <span className='coin-info-label'>
              {jsonStrings[1]._trending} Husky:
            </span>
            {!_.isEmpty(buy.trend) ? (
              <HightlightChange className='coin-info-value'>
                {buy.trend.status} - {jsonStrings[1]._strength}:{' '}
                {buy.trend.trendDiff}%
              </HightlightChange>
            ) : (
              'Not enough data, wait.'
            )}
          </div>
        ) : (
          ''
        )}

        {symbolConfiguration.buy.predictValue === true &&
        buy.prediction !== undefined &&
        buy.prediction.meanPredictedValue !== undefined ? (
          <div className='coin-info-column coin-info-column-right coin-info-column-balance'>
            <span className='coin-info-label mr-1'>
              Predict next {buy.prediction.interval}:
            </span>
            <Badge className='badge-no-color' pill variant='dark'>
              <HightlightChange className='coin-info-value coin-predict font-big'>
                {parseFloat(buy.prediction.meanPredictedValue[0]).toFixed(
                  precision
                )}
              </HightlightChange>
            </Badge>
          </div>
        ) : (
          ''
        )}

        {symbolConfiguration.buy.predictValue === true &&
        buy.prediction !== undefined ? (
          <div className='coin-info-column coin-info-column-right coin-info-column-balance'>
            <span className='coin-info-label'>Prediction error:</span>
            <HightlightChange className='coin-info-value'>
              {predictionHigherThan}%
            </HightlightChange>
          </div>
        ) : (
          ''
        )}

        {symbolConfiguration.strategyOptions.athRestriction.enabled ? (
          <div className='d-flex flex-column w-100'>
            {buy.athPrice ? (
              <div className='coin-info-column coin-info-column-price'>
                <span className='coin-info-label'>
                  ATH price (
                  {
                    symbolConfiguration.strategyOptions.athRestriction.candles
                      .interval
                  }
                  /
                  {
                    symbolConfiguration.strategyOptions.athRestriction.candles
                      .limit
                  }
                  ):
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(buy.athPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {buy.athRestrictionPrice ? (
              <div className='coin-info-column coin-info-column-price'>
                <div
                  className='coin-info-label d-flex flex-row justify-content-start'
                  style={{ flex: '0 100%' }}>
                  <span>
                    &#62; Restricted price (
                    {(
                      parseFloat(
                        symbolConfiguration.strategyOptions.athRestriction
                          .restrictionPercentage - 1
                      ) * 100
                    ).toFixed(2)}
                    %):
                  </span>
                  <OverlayTrigger
                    trigger='click'
                    key='buy-ath-restricted-price-overlay'
                    placement='bottom'
                    overlay={
                      <Popover id='buy-ath-restricted-price-overlay-right'>
                        <Popover.Content>
                          The bot will place a buy order when the trigger price
                          is lower than ATH restricted price. Even if the
                          current price reaches the trigger price, the bot will
                          not purchase the coin if the current price is higher
                          than the ATH restricted price. If you don't want to
                          restrict the purchase with ATH, please disable the ATH
                          price restriction in the setting.
                        </Popover.Content>
                      </Popover>
                    }>
                    <Button
                      variant='link'
                      className='p-0 m-0 ml-1 text-info d-inline-block'
                      style={{ 'line-height': '17px' }}>
                      <i className='fas fa-question-circle fa-sm'></i>
                    </Button>
                  </OverlayTrigger>
                </div>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(buy.athRestrictionPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            <div className='coin-info-column coin-info-column-price divider'></div>
          </div>
        ) : (
          ''
        )}

        {buy.highestPrice ? (
          <div className='coin-info-column coin-info-column-price'>
            <span className='coin-info-label'>
              {jsonStrings[0].highest_price}:
            </span>
            <HightlightChange className='coin-info-value'>
              {parseFloat(buy.highestPrice).toFixed(precision)}
            </HightlightChange>
          </div>
        ) : (
          ''
        )}
        {buy.currentPrice ? (
          <div className='coin-info-column coin-info-column-price'>
            <span className='coin-info-label'>
              {jsonStrings[1].current_price}:
            </span>
            <HightlightChange className='coin-info-value'>
              {parseFloat(buy.currentPrice).toFixed(precision)}
            </HightlightChange>
          </div>
        ) : (
          ''
        )}
        {buy.lowestPrice ? (
          <div className='coin-info-column coin-info-column-lowest-price'>
            <span className='coin-info-label'>
              {jsonStrings[0].lowest_price}:
            </span>
            <HightlightChange className='coin-info-value'>
              {parseFloat(buy.lowestPrice).toFixed(precision)}
            </HightlightChange>
          </div>
        ) : (
          ''
        )}
        <div className='coin-info-column coin-info-column-price divider'></div>
        {buy.triggerPrice ? (
          <div className='coin-info-column coin-info-column-price'>
            <div
              className='coin-info-label d-flex flex-row justify-content-start'
              style={{ flex: '0 100%' }}>
              <span>
                {jsonStrings[0].trigger_price} (
                {(
                  parseFloat(symbolConfiguration.buy.triggerPercentage - 1) *
                  100
                ).toFixed(2)}
                %):
              </span>
              {symbolConfiguration.strategyOptions.athRestriction.enabled &&
              parseFloat(buy.triggerPrice) >
                parseFloat(buy.athRestrictionPrice) ? (
                <OverlayTrigger
                  trigger='click'
                  key='buy-trigger-price-overlay'
                  placement='bottom'
                  overlay={
                    <Popover id='buy-trigger-price-overlay-right'>
                      <Popover.Content>
                        The trigger price{' '}
                        <code>
                          {parseFloat(buy.triggerPrice).toFixed(precision)}
                        </code>{' '}
                        is higher than the ATH buy restricted price{' '}
                        <code>
                          {parseFloat(buy.athRestrictionPrice).toFixed(
                            precision
                          )}
                        </code>
                        . The bot will not place an order even if the current
                        price reaches the trigger price.
                      </Popover.Content>
                    </Popover>
                  }>
                  <Button
                    variant='link'
                    className='p-0 m-0 ml-1 text-warning d-inline-block'
                    style={{ 'line-height': '17px' }}>
                    <i className='fa fa-info-circle'></i>
                  </Button>
                </OverlayTrigger>
              ) : (
                ''
              )}
            </div>
            <HightlightChange className='coin-info-value'>
              {parseFloat(buy.triggerPrice).toFixed(precision)}
            </HightlightChange>
          </div>
        ) : (
          ''
        )}
        {buy.difference ? (
          <div className='coin-info-column coin-info-column-price'>
            <span className='coin-info-label'>{jsonStrings[0].diff_buy}:</span>
            <HightlightChange className='coin-info-value' id='buy-difference'>
              {parseFloat(buy.difference).toFixed(2)}%
            </HightlightChange>
          </div>
        ) : (
          ''
        )}
        <div className='coin-info-column coin-info-column-price divider mb-1'></div>
        {buyGridRows}
        {buy.processMessage ? (
          <div className='d-flex flex-column w-100'>
            <div className='coin-info-column coin-info-column-price divider'></div>
            <div className='coin-info-column coin-info-column-message'>
              <HightlightChange className='coin-info-message'>
                {buy.processMessage}
              </HightlightChange>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
