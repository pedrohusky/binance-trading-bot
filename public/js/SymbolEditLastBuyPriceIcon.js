/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolEditLastBuyPriceIcon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      symbolInfo: {}
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update configuration, when the modal is closed and different.
    if (
      this.state.showModal === false &&
      _.isEmpty(nextProps.symbolInfo) === false &&
      _.isEqual(nextProps.symbolInfo, this.state.symbolInfo) === false
    ) {
      this.setState({
        symbolInfo: nextProps.symbolInfo
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const {
      symbol,
      sell: { lastBuyPrice, lastQtyBought }
    } = this.state.symbolInfo;

    this.props.sendWebSocket('symbol-update-last-buy-price', {
      symbol,
      sell: { lastBuyPrice, lastQtyBought }
    });
    this.handleModalClose();
  }

  handleModalShow() {
    this.setState({
      showModal: true
    });
  }

  handleModalClose() {
    this.setState({
      showModal: false
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
        ? +target.value
        : target.value;
    const stateKey = target.getAttribute('data-state-key');

    const { symbolInfo } = this.state;

    this.setState({
      symbolInfo: _.set(symbolInfo, stateKey, value)
    });
  }

  render() {
    const { symbolInfo } = this.state;
    const { jsonStrings } = this.props;

    if (_.isEmpty(symbolInfo)) {
      return '';
    }

    return (
      <div className='symbol-edit-last-buy-price-icon-wrapper'>
        <button
          type='button'
          className='btn btn-sm btn-link p-0'
          onClick={this.handleModalShow}>
          <i className='fas fa-edit fa-sm'></i>
        </button>
        <Modal show={this.state.showModal} onHide={this.handleModalClose}>
          <Form onSubmit={this.handleFormSubmit}>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>
                {jsonStrings[4].edit_last_buy} {symbolInfo.symbol}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h2 className='form-header'>{jsonStrings[4].sell_signal}</h2>
              <Form.Group controlId='field-candles-interval'>
                <Form.Label>{jsonStrings[4].last_buy_price}</Form.Label>
                <Form.Control
                  size='sm'
                  type='number'
                  placeholder={jsonStrings[4].placeholder_last_buy}
                  required
                  min='0'
                  step='0.00000001'
                  data-state-key='sell.lastBuyPrice'
                  defaultValue={symbolInfo.sell.lastBuyPrice}
                  onChange={this.handleInputChange}
                />
                <Form.Text className='text-muted'>
                  {jsonStrings[4].edit_last_buy_description[1]}
                  <br />
                  <br />
                  {jsonStrings[4].edit_last_buy_description[2]}
                  <br />
                  <br />
                  {jsonStrings[4].edit_last_buy_description[3]}
                  <br />
                  <br />
                  {jsonStrings[4].edit_last_buy_description[4]}
                  <br />
                  <br />
                  {jsonStrings[4].edit_last_buy_description[5]}
                </Form.Text>
              </Form.Group>

              <Form.Group controlId='field-candles-interval'>
                <Form.Label>{jsonStrings[4].last_qty_bought}</Form.Label>
                <Form.Control
                  size='sm'
                  type='number'
                  placeholder={jsonStrings[4].placeholder_last_qty_bought}
                  required
                  min='0'
                  step='0.00000001'
                  data-state-key='sell.lastQtyBought'
                  defaultValue={symbolInfo.sell.lastQtyBought}
                  onChange={this.handleInputChange}
                />
                <Form.Text className='text-muted'>
                  {jsonStrings[4].edit_last_qty_bought_description}
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                size='sm'
                onClick={this.handleModalClose}>
                {jsonStrings[1]._close}
              </Button>
              <Button type='submit' variant='primary' size='sm'>
                {jsonStrings[1].save_changes}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  }
}
