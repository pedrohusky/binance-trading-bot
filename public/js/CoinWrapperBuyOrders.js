/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperBuyOrders extends React.Component {
  render() {
    const {
      symbolInfo: {
        symbol,
        symbolInfo: {
          filterPrice: { tickSize }
        },
        buy: { openOrders }
      },
      sendWebSocket,
      jsonStrings
    } = this.props;

    if (openOrders.length === 0 || _.isEmpty(jsonStrings)) {
      return '';
    }

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

    const renderOpenOrders = openOrders.map((openOrder, index) => {
      return (
        <div
          key={'coin-wrapper-buy-orders-' + index}
          className='coin-info-sub-open-order-wrapper'>
          <div className='coin-info-column-grid'>
            <div className='coin-info-label d-flex flex-row'>
              <span>
                {jsonStrings[0].open_order} #{index + 1}
              </span>{' '}
              <SymbolCancelIcon
                symbol={symbol}
                order={openOrder}
                sendWebSocket={sendWebSocket}
              />
              {openOrder.updatedAt && moment(openOrder.updatedAt).isValid() ? (
                <HightlightChange
                  className='coin-info-value'
                  title={openOrder.updatedAt}>
                  {jsonStrings[0].placed_at}{' '}
                  {moment(openOrder.updatedAt).format('HH:mm:ss')}
                </HightlightChange>
              ) : (
                ''
              )}
            </div>

            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>{jsonStrings[1]._status}:</span>
              <HightlightChange className='coin-info-value'>
                {openOrder.status}
              </HightlightChange>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>{jsonStrings[0]._type}:</span>
              <HightlightChange className='coin-info-value'>
                {openOrder.type}
              </HightlightChange>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {jsonStrings[1]._quantity}:
              </span>
              <HightlightChange className='coin-info-value'>
                {parseFloat(openOrder.origQty).toFixed(precision)}
              </HightlightChange>
            </div>
            {openOrder.price > 0 ? (
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {jsonStrings[1]._price}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(openOrder.price).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {openOrder.stopPrice > 0 ? (
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {jsonStrings[1].stop_price}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(openOrder.stopPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            <div className='coin-info-column coin-info-column-price divider'></div>

            {openOrder.limitPrice ? (
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {jsonStrings[0].current_limit_price}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(openOrder.limitPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {openOrder.differenceToCancel ? (
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {jsonStrings[0].diff_cancel}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {openOrder.differenceToCancel.toFixed(2)}%
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {openOrder.currentPrice ? (
              <div className='coin-info-column coin-info-column-price'>
                <span className='coin-info-label'>
                  {jsonStrings[1].current_price}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {openOrder.currentPrice.toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {openOrder.differenceToExecute ? (
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {jsonStrings[0].diff_execute}:
                </span>
                <HightlightChange className='coin-info-value'>
                  {openOrder.differenceToExecute.toFixed(2)}%
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      );
    });

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title border-bottom-0 mb-0 pb-0'>
          <div className='coin-info-label'>
            {jsonStrings[0].buy_open_orders}
          </div>
        </div>
        <Card className='card-grid-buy'>{renderOpenOrders}</Card>
      </div>
    );
  }
}
