/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SettingIconMinPurchaseAmount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minPurchaseAmounts: {}
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update configuration, when the modal is closed and different.
    if (
      _.isEmpty(nextProps.minPurchaseAmounts) === false &&
      _.isEqual(nextProps.minPurchaseAmounts, this.state.minPurchaseAmounts) ===
        false
    ) {
      const { minPurchaseAmounts } = nextProps;

      this.setState({
        minPurchaseAmounts
      });
    }
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

    const { minPurchaseAmounts } = this.state;

    const newMinPurchaseAmounts = _.set(minPurchaseAmounts, stateKey, value);
    this.setState({
      minPurchaseAmounts: newMinPurchaseAmounts
    });

    this.props.handleMinPurchaeAmountChange(minPurchaseAmounts);
  }

  render() {
    const { quoteAssets, jsonStrings } = this.props;
    const { minPurchaseAmounts } = this.state;

    if (_.isEmpty(minPurchaseAmounts) || _.isEmpty(jsonStrings)) {
      return '';
    }

    return quoteAssets.map((quoteAsset, index) => {
      return (
        <div
          key={'quote-asset-' + quoteAsset + '-' + index}
          className='coin-info-min-purchase-amount-wrapper'>
          <Form.Group
            controlId={'field-min-purchase-amount-percentage-' + quoteAsset}
            className='mb-2'>
            <Form.Label className='mb-0'>
              {jsonStrings[0].min_purchase_amount_for}{' '}
              <OverlayTrigger
                trigger='click'
                key={'min-purchase-amount-overlay-' + quoteAsset}
                placement='bottom'
                overlay={
                  <Popover
                    id={'min-purchase-amount-overlay-right' + quoteAsset}>
                    <Popover.Content>
                      {jsonStrings[0].min_purchase_amount_description}{' '}
                      {quoteAsset}
                    </Popover.Content>
                  </Popover>
                }>
                <Button variant='link' className='p-0 m-0 ml-1 text-info'>
                  <i className='fas fa-question-circle fa-sm'></i>
                </Button>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup size='sm'>
              <FormControl
                size='sm'
                type='number'
                placeholder={jsonStrings[0].placeholder_min_purchase_amount}
                required
                min='0'
                step='0.0001'
                data-state-key={quoteAsset}
                value={minPurchaseAmounts[quoteAsset]}
                onChange={this.handleInputChange}
              />
              <InputGroup.Append>
                <InputGroup.Text>{quoteAsset}</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
        </div>
      );
    });
  }
}
