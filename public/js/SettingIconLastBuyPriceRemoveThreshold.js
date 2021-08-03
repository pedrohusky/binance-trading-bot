/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SettingIconLastBuyPriceRemoveThreshold extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lastBuyPriceRemoveThresholds: {}
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update configuration, when the modal is closed and different.
    if (
      _.isEmpty(nextProps.lastBuyPriceRemoveThresholds) === false &&
      _.isEqual(
        nextProps.lastBuyPriceRemoveThresholds,
        this.state.lastBuyPriceRemoveThresholds
      ) === false
    ) {
      const { lastBuyPriceRemoveThresholds } = nextProps;
      this.setState({
        lastBuyPriceRemoveThresholds
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

    const { lastBuyPriceRemoveThresholds } = this.state;

    console.log(
      '_.set(lastBuyPriceRemoveThresholds, stateKey, value) => ',
      _.set(lastBuyPriceRemoveThresholds, stateKey, value)
    );

    const newLastBuyPriceRemoveThresholds = _.set(
      lastBuyPriceRemoveThresholds,
      stateKey,
      value
    );
    this.setState({
      lastBuyPriceRemoveThresholds: newLastBuyPriceRemoveThresholds
    });

    this.props.handleLastBuyPriceRemoveThresholdChange(
      lastBuyPriceRemoveThresholds
    );
  }

  render() {
    const { quoteAssets, jsonStrings } = this.props;
    const { lastBuyPriceRemoveThresholds } = this.state;

    if (_.isEmpty(lastBuyPriceRemoveThresholds) || _.isEmpty(jsonStrings)) {
      return '';
    }

    return quoteAssets.map((quoteAsset, index) => {
      return (
        <Form.Group
          controlId={
            'field-min-last-buy-remove-threshold-limit-percentage-' +
            quoteAsset +
            '-' +
            index
          }
          className='mb-2'>
          <Form.Label className='mb-0'>
            {jsonStrings[1].last_buy_price_remove_threshold}{' '}
            <OverlayTrigger
              trigger='click'
              key={'last-buy-remove-threshold-overlay-' + quoteAsset}
              placement='bottom'
              overlay={
                <Popover
                  id={'last-buy-remove-threshold-overlay-right' + quoteAsset}>
                  <Popover.Content>
                    {
                      jsonStrings[0]
                        .last_buy_price_remove_threshold_description[1]
                    }{' '}
                    "{quoteAsset}".
                    {
                      jsonStrings[0]
                        .last_buy_price_remove_threshold_description[2]
                    }
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
              placeholder={
                jsonStrings[0].placeholder_last_buy_remove_price_threshold
              }
              required
              min='0.0001'
              step='0.0001'
              data-state-key={quoteAsset}
              value={lastBuyPriceRemoveThresholds[quoteAsset]}
              onChange={this.handleInputChange}
            />
            <InputGroup.Append>
              <InputGroup.Text>{quoteAsset}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      );
    });
  }
}
