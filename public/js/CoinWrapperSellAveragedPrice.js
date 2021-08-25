/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperSellAveragedPrice extends React.Component {
  render() {
    const { symbolInfo, sendWebSocket, jsonStrings } = this.props;

    const {
      symbolInfo: {
        filterPrice: { tickSize }
      },
      sell
    } = symbolInfo;

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

    if (sell.gridStrategyActivated) {
      return (
        <div className='coin-info-column coin-info-column-price'>
          <span className='coin-info-label coin-info-label'>
            {jsonStrings[1].last_buy_price}:
          </span>

        </div>
      );
    } else {
      return '';
    }
  }
}
