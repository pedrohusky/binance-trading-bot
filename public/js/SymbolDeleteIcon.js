/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolDeleteIcon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);

    this.handleDelete = this.handleDelete.bind(this);
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

  canDelete() {
    const { symbolInfo } = this.props;

    if (
      symbolInfo.buy.openOrders.length === 0 &&
      symbolInfo.sell.lastBuyPrice <= 0 &&
      symbolInfo.sell.openOrders.length === 0
    ) {
      return true;
    }

    return false;
  }

  handleDelete(e) {
    e.preventDefault();
    const { symbolInfo } = this.props;
    this.props.sendWebSocket('symbol-delete', {
      symbolInfo
    });

    this.handleModalClose();
  }

  render() {
    if (this.canDelete()) {
      const { symbolInfo, jsonStrings } = this.props;
      if (_.isEmpty(jsonStrings)) {
        return '';
      }
      return (
        <div className='header-column-icon-wrapper symbol-delete-wrapper'>
          <button
            type='button'
            className='btn btn-sm btn-link p-0 pl-1'
            onClick={this.handleModalShow}>
            <i className='fa fa-times-circle'></i>
          </button>

          <Modal show={this.state.showModal} onHide={this.handleModalClose}>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>
                {jsonStrings[2].remove_symbol} - {symbolInfo.symbol}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {jsonStrings[2].symbol_delete_description[1]}
              <br />
              {jsonStrings[2].symbol_delete_description[2]}
              <br />
              {jsonStrings[2].symbol_delete_description[3]}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                size='sm'
                onClick={this.handleModalClose}>
                {jsonStrings[1]._close}
              </Button>
              <Button
                type='button'
                variant='danger'
                size='sm'
                onClick={this.handleDelete}>
                {jsonStrings[1]._remove}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }

    return '';
  }
}
