/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperAction extends React.Component {
  render() {
    const {
      symbolInfo: { symbol, action, buy, isLocked, isActionDisabled },
      sendWebSocket,
      jsonStrings
    } = this.props;

    let label;
    switch (action) {
      case 'buy':
        label = jsonStrings[1]._buy;
        break;
      case 'buy-temporary-disabled':
        label = jsonStrings[0]._actions.action_disabled;
        break;
      case 'buy-order-checking':
        label = jsonStrings[0]._actions.action_buy_check;
        break;
      case 'buy-order-filled':
        label = jsonStrings[0]._actions.action_buy_filled;
        break;
      case 'buy-order-wait':
        label = jsonStrings[0]._actions.action_buy_wait;
        break;
      case 'sell':
        label = jsonStrings[1]._sell;
        break;
      case 'sell-temporary-disabled':
        label = jsonStrings[0]._actions.action_disabled;
        break;
      case 'sell-stop-loss':
        label = jsonStrings[0]._actions.action_selling_stop_loss;
        break;
      case 'sell-order-checking':
        label = jsonStrings[0]._actions.action_sell_check;
        break;
      case 'sell-order-wait':
        label = jsonStrings[0]._actions.action_sell_wait;
        break;
      case 'sell-wait':
        label = jsonStrings[0]._wait;
        break;
      default:
        label = jsonStrings[0]._wait;
    }

    if (isLocked) {
      label = jsonStrings[1]._locked;
    }

    if (isActionDisabled.isDisabled) {
      label = jsonStrings[0]._actions.disabled_by + isActionDisabled.disabledBy;
    }

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title border-bottom-0 mb-0 pb-0'>
          <div className='coin-info-label'>
            {jsonStrings[1]._action} -{' '}
            <span className='coin-info-value'>
              {moment(buy.updatedAt).format('HH:mm:ss')}
            </span>
            {isLocked === true ? <i className='fas fa-lock ml-1'></i> : ''}
            {isActionDisabled.isDisabled === true ? (
              <i className='fas fa-pause-circle ml-1 text-warning'></i>
            ) : (
              ''
            )}
          </div>

          <div className='d-flex flex-column align-items-end'>
            <HightlightChange className='action-label'>
              {label}
            </HightlightChange>
            {isActionDisabled.isDisabled === true ? (
              <div className='ml-1'>
                {isActionDisabled.canResume === true ? (
                  <SymbolEnableActionIcon
                    symbol={symbol}
                    className='mr-1'
                    sendWebSocket={sendWebSocket}
                    jsonStrings={jsonStrings}></SymbolEnableActionIcon>
                ) : (
                  ''
                )}
                ({moment.duration(isActionDisabled.ttl, 'seconds').humanize()}{' '}
                {jsonStrings[1].time_remaining}){' '}
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    );
  }
}
