/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolSettingIcon extends React.Component {
  constructor(props) {
    super(props);

    this.modalToStateMap = {
      setting: 'showSettingModal',
      confirm: 'showConfirmModal',
      gridTrade: 'showResetGridTradeModal'
    };

    this.state = {
      showSettingModal: false,
      showConfirmModal: false,
      showResetGridTradeModal: false,
      symbolConfiguration: {},
      validation: {}
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.resetToGlobalConfiguration =
      this.resetToGlobalConfiguration.bind(this);
    this.handleGridTradeChange = this.handleGridTradeChange.bind(this);
    this.handleSetValidation = this.handleSetValidation.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update symbol configuration, when the modal is closed and different.
    if (
      this.state.showSettingModal === false &&
      _.get(nextProps, 'symbolInfo.symbolConfiguration', null) !== null &&
      _.isEqual(
        _.get(nextProps, 'symbolInfo.symbolConfiguration', null),
        this.state.symbolConfiguration
      ) === false
    ) {
      this.setState({
        symbolConfiguration: nextProps.symbolInfo.symbolConfiguration
      });
    }
  }

  resetGridTrade() {
    const { symbolInfo } = this.props;

    this.handleModalClose('confirm');
    this.handleModalClose('setting');
    this.handleModalClose('gridTrade');
    this.props.sendWebSocket('symbol-grid-trade-delete', symbolInfo);
  }

  handleGridTradeChange(type, newGrid) {
    const { symbolConfiguration } = this.state;

    this.setState({
      symbolConfiguration: _.set(
        symbolConfiguration,
        `${type}.gridTrade`,
        newGrid
      )
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();

    this.handleModalClose('setting');

    // Send with symbolInfo
    const { symbolInfo } = this.props;
    const newSymbolInfo = symbolInfo;
    newSymbolInfo.configuration = this.state.symbolConfiguration;

    this.props.sendWebSocket('symbol-setting-update', newSymbolInfo);
  }

  handleModalShow(modal) {
    this.setState({
      [this.modalToStateMap[modal]]: true
    });
  }

  handleModalClose(modal) {
    this.setState({
      [this.modalToStateMap[modal]]: false
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

    const { symbolConfiguration } = this.state;

    this.setState({
      symbolConfiguration: _.set(symbolConfiguration, stateKey, value)
    });
  }

  resetToGlobalConfiguration() {
    const { symbolInfo } = this.props;

    this.handleModalClose('confirm');
    this.handleModalClose('setting');
    this.props.sendWebSocket('symbol-setting-delete', symbolInfo);
  }

  handleSetValidation(type, isValid) {
    const { validation } = this.state;
    this.setState({ validation: { ...validation, [type]: isValid } });
  }

  render() {
    const { symbolInfo, jsonStrings } = this.props;
    const { symbolConfiguration } = this.state;

    if (_.isEmpty(symbolConfiguration) || _.isEmpty(jsonStrings)) {
      return '';
    }
    const {
      symbolInfo: { quoteAsset, filterMinNotional }
    } = symbolInfo;
    const minNotional = parseFloat(filterMinNotional.minNotional);

    return (
      <div className='symbol-setting-icon-wrapper'>
        <button
          type='button'
          className='btn btn-sm btn-link p-0'
          onClick={() => this.handleModalShow('setting')}>
          <i className='fas fa-cog'></i>
        </button>
        <Modal
          show={this.state.showSettingModal}
          onHide={() => this.handleModalClose('setting')}
          size='xl'>
          <Form onSubmit={this.handleFormSubmit}>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>
                {jsonStrings[5]._customise} {symbolInfo.symbol}{' '}
                {jsonStrings[5]._settings}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <span className='text-muted'>{jsonStrings[5]._description}</span>
              <Accordion defaultActiveKey='0'>
                <Card className='mt-1'>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {jsonStrings[5].candle_settings}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-6'>
                          <Form.Group
                            controlId='field-candles-interval'
                            className='mb-2'>
                            <Form.Label className='mb-0'>
                              {jsonStrings[1]._interval}
                              <OverlayTrigger
                                trigger='click'
                                key='interval-overlay'
                                placement='bottom'
                                overlay={
                                  <Popover id='interval-overlay-right'>
                                    <Popover.Content>
                                      {
                                        jsonStrings[5]
                                          .candle_interval_description
                                      }
                                    </Popover.Content>
                                  </Popover>
                                }>
                                <Button
                                  variant='link'
                                  className='p-0 m-0 ml-1 text-info'>
                                  <i className='fas fa-question-circle fa-sm'></i>
                                </Button>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              size='sm'
                              as='select'
                              required
                              data-state-key='candles.interval'
                              value={symbolConfiguration.candles.interval}
                              onChange={this.handleInputChange}>
                              <option value='1m'>1m</option>
                              <option value='3m'>3m</option>
                              <option value='5m'>5m</option>
                              <option value='15m'>15m</option>
                              <option value='30m'>30m</option>
                              <option value='1h'>1h</option>
                              <option value='2h'>2h</option>
                              <option value='4h'>4h</option>
                              <option value='1d'>1d</option>
                            </Form.Control>
                          </Form.Group>
                        </div>
                        <div className='col-6'>
                          <Form.Group
                            controlId='field-candles-limit'
                            className='mb-2'>
                            <Form.Label className='mb-0'>
                              {jsonStrings[1]._limit}{' '}
                              <OverlayTrigger
                                trigger='click'
                                key='limit-overlay'
                                placement='bottom'
                                overlay={
                                  <Popover id='limit-overlay-right'>
                                    <Popover.Content>
                                      {jsonStrings[5].candle_limit_description}
                                    </Popover.Content>
                                  </Popover>
                                }>
                                <Button
                                  variant='link'
                                  className='p-0 m-0 ml-1 text-info'>
                                  <i className='fas fa-question-circle fa-sm'></i>
                                </Button>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              size='sm'
                              type='number'
                              placeholder={
                                jsonStrings[5].placeholder_enter_limit_price
                              }
                              required
                              min='0'
                              step='1'
                              data-state-key='candles.limit'
                              value={symbolConfiguration.candles.limit}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <div className='row'>
                <div className='col-xs-12 col-sm-6'>
                  <Accordion defaultActiveKey='0' className='accordion-wrapper'>
                    <Card className='mt-1 card-buy'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          {jsonStrings[1]._buy}
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-buy-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='buy.enabled'
                                    checked={symbolConfiguration.buy.enabled}
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[1].trading_enabled}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='buy-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='buy-enabled-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .trading_enabled_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                            <div className='col-12'>
                              <SymbolSettingIconGridBuy
                                gridTrade={symbolConfiguration.buy.gridTrade}
                                quoteAsset={quoteAsset}
                                minNotional={minNotional}
                                handleSetValidation={this.handleSetValidation}
                                handleGridTradeChange={
                                  this.handleGridTradeChange
                                }
                              />
                            </div>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-buy-minimum-purchase-amount'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].min_purchase_amount}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='buy-minimum-purchase-amount-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='buy-minimum-purchase-amount-overlay-right'>
                                        <Popover.Content>
                                          The minimum possible for bot buy.
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Label
                                  htmlFor='field-min-sell-stop-loss-percentage'
                                  srOnly>
                                  {jsonStrings[1]._quantity}
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder={
                                      jsonStrings[5]
                                        .placeholder_min_purchase_amount
                                    }
                                    required
                                    min='0'
                                    step='0.0001'
                                    data-state-key='buy.minPurchaseAmount'
                                    value={
                                      symbolConfiguration.buy.minPurchaseAmount
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      $
                                      {
                                        symbolConfiguration.buy
                                          .minPurchaseAmount
                                      }
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-buy-last-remove-threshold'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {
                                    jsonStrings[1]
                                      .last_buy_price_remove_threshold
                                  }{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='buy-last-remove-threshold-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='buy-last-remove-threshold-overlay-right'>
                                        <Popover.Content>
                                          {`${jsonStrings[5].last_buy_price_remove_threshold_description[1]} ${quoteAsset} ${jsonStrings[5].last_buy_price_remove_threshold_description[2]}`}
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Label
                                  htmlFor='field-min-sell-stop-loss-percentage'
                                  srOnly>
                                  {jsonStrings[1]._quantity}
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder={
                                      jsonStrings[5]
                                        .placeholder_last_buy_remove_threshold
                                    }
                                    required
                                    min='0'
                                    step='0.0001'
                                    data-state-key='buy.lastBuyPriceRemoveThreshold'
                                    value={
                                      symbolConfiguration.buy
                                        .lastBuyPriceRemoveThreshold
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      $
                                      {
                                        symbolConfiguration.buy
                                          .lastBuyPriceRemoveThreshold
                                      }
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </div>
                <div className='col-xs-12 col-sm-6'>
                  <Accordion defaultActiveKey='0' className='accordion-wrapper'>
                    <Card className='mt-1 card-sell'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          {jsonStrings[1]._sell}
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-sell-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='sell.enabled'
                                    checked={symbolConfiguration.sell.enabled}
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[1].trading_enabled}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='sell-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='sell-enabled-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .trading_enabled_description_sell
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                            <div className='col-12'>
                              <SymbolSettingIconGridSell
                                gridTrade={symbolConfiguration.sell.gridTrade}
                                quoteAsset={quoteAsset}
                                handleSetValidation={this.handleSetValidation}
                                handleGridTradeChange={
                                  this.handleGridTradeChange
                                }
                              />
                            </div>
                            <div className='col-12'>
                              <p className='form-header mb-1'>
                                {jsonStrings[1]._sell} -{' '}
                                {jsonStrings[1].stop_loss}
                              </p>
                              <Form.Group
                                controlId='field-sell-stop-loss-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='sell.stopLoss.enabled'
                                    checked={
                                      symbolConfiguration.sell.stopLoss.enabled
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].stop_loss_enabled}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='sell-stop-loss-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='sell-stop-loss-enabled-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .stop_loss_enabled_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>

                            <div className='col-6'>
                              <Form.Group
                                controlId='field-sell-stop-loss-max-loss-percentage'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[1].max_loss_percent}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='sell-stop-loss-max-loss-percentage-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='sell-stop-loss-max-loss-percentage-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5]
                                              .max_loss_percent_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder={
                                      jsonStrings[5].placeholder_enter_max_loss
                                    }
                                    required
                                    max='1'
                                    min='0'
                                    step='0.0001'
                                    data-state-key='sell.stopLoss.maxLossPercentage'
                                    value={
                                      symbolConfiguration.sell.stopLoss
                                        .maxLossPercentage
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {(
                                        symbolConfiguration.sell.stopLoss
                                          .maxLossPercentage *
                                          100 -
                                        100
                                      ).toFixed(2)}
                                      %
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-sell-stop-loss-disable-buy-minutes'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].temporary_disable_buy}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='sell-stop-loss-disable-buy-minutes-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='sell-stop-loss-disable-buy-minutes-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5]
                                              .temporary_disable_buy_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder={
                                      jsonStrings[5]
                                        .placeholder_temporary_disable
                                    }
                                    required
                                    max='99999999'
                                    min='1'
                                    step='1'
                                    data-state-key='sell.stopLoss.disableBuyMinutes'
                                    value={
                                      symbolConfiguration.sell.stopLoss
                                        .disableBuyMinutes
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {(
                                        symbolConfiguration.sell.stopLoss
                                          .disableBuyMinutes / 60
                                      ).toFixed(2)}{' '}
                                      hours disabled.
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </div>
              </div>

              <div className='row'>
                <div className='col-xs-12 col-sm-6'>
                  <Accordion className='accordion-wrapper accordion-floating'>
                    <Card className='mt-1'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          {jsonStrings[5].bot_options.bot_options}
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-12'>
                              <p className='form-header mb-1'>
                                {jsonStrings[5].bot_options._language}
                              </p>

                              <Form.Group
                                controlId='field-languages'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].bot_options.select_language}
                                </Form.Label>
                                <Form.Control
                                  size='sm'
                                  as='select'
                                  required
                                  data-state-key='botOptions.language'
                                  value={
                                    symbolConfiguration.botOptions.language
                                  }
                                  onChange={this.handleInputChange}>
                                  <option value='en'>en</option>
                                  <option value='es'>es</option>
                                  <option value='pt'>pt</option>
                                  <option value='vi'>vi</option>
                                  <option value='ch'>ch</option>
                                  <option value='fr'>fr</option>
                                  <option value='nl'>nl</option>
                                </Form.Control>
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-6'>
                              <p className='form-header mb-1'>Slack</p>
                              <Form.Group
                                controlId='field-bot-options-slack'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='botOptions.slack'
                                    checked={
                                      symbolConfiguration.botOptions.slack
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].bot_options.use_slack}?{' '}
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                            <div className='col-6'>
                              <p className='form-header mb-1'>Telegram</p>

                              <Form.Group
                                controlId='field-bot-options-telegram'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='botOptions.telegram'
                                    checked={
                                      symbolConfiguration.botOptions.telegram
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].bot_options.use_telegram}?{' '}
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-12'>
                              <p className='form-header mb-1'>
                                {jsonStrings[5].bot_options._security}
                              </p>

                              <Form.Group
                                controlId='field-login-expire'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].bot_options.login_expire_time}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='login-expire-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='login-expire-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5].bot_options
                                              .login_expire_time_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder='60 is the default'
                                    required
                                    min='0'
                                    step='1'
                                    data-state-key='botOptions.login.loginWindowMinutes'
                                    value={
                                      symbolConfiguration.botOptions.login
                                        .loginWindowMinutes
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {jsonStrings[5].bot_options.expire_after}{' '}
                                      {
                                        symbolConfiguration.botOptions.login
                                          .loginWindowMinutes
                                      }{' '}
                                      {jsonStrings[5].bot_options._minutes}.
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>

                  <Accordion className='accordion-wrapper accordion-floating'>
                    <Card className='mt-1'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          {jsonStrings[5].stake_coins} ?
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-sell-stake-coins-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='sell.stakeCoinEnabled'
                                    checked={
                                      symbolConfiguration.sell.stakeCoinEnabled
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].stake_coins}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='sell-stake-coins-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='sell-stake-coins-enabled-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .stake_coins_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </div>

                <div className='col-xs-12 col-sm-6'>
                  <Accordion className='accordion-wrapper accordion-floating'>
                    <Card className='mt-1'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          Husky Indicator
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-husky-options-buy-signal'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='strategyOptions.huskyOptions.buySignal'
                                    checked={
                                      symbolConfiguration.strategyOptions
                                        .huskyOptions.buySignal
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].use_husky_buy}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='husky-options-buy-signal-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='husky-options-buy-signal-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .use_husky_buy_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-husky-options-sell-signal'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='strategyOptions.huskyOptions.sellSignal'
                                    checked={
                                      symbolConfiguration.strategyOptions
                                        .huskyOptions.sellSignal
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].use_husky_sell}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='husky-options-sell-signal-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='husky-options-sell-signal-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .use_husky_sell_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-husky-positive'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].weight_green_candle}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='husky-positive-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='husky-positive-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5]
                                              .weight_green_candle_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder='1'
                                    required
                                    min='0'
                                    step='0.0001'
                                    data-state-key='strategyOptions.huskyOptions.positive'
                                    value={
                                      symbolConfiguration.strategyOptions
                                        .huskyOptions.positive
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {(
                                        (symbolConfiguration.strategyOptions
                                          .huskyOptions.positive -
                                          1) *
                                        100
                                      ).toFixed(2)}
                                      % heavier than negative
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>

                              <Form.Group
                                controlId='field-husky-negative'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].weight_red_candle}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='husky-negative-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='husky-negative-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5]
                                              .weight_red_candle_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder='1.25'
                                    required
                                    min='0'
                                    step='0.0001'
                                    data-state-key='strategyOptions.huskyOptions.negative'
                                    value={
                                      symbolConfiguration.strategyOptions
                                        .huskyOptions.negative
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {(
                                        (symbolConfiguration.strategyOptions
                                          .huskyOptions.negative -
                                          1) *
                                        100
                                      ).toFixed(2)}
                                      % heavier than positive
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-12'>
                              <p className='form-header mb-1'>
                                {jsonStrings[5].force_market_order} ?
                              </p>
                              <Form.Group
                                controlId='field-sell-market-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='sell.trendDownMarketSell'
                                    checked={
                                      symbolConfiguration.sell
                                        .trendDownMarketSell
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    {jsonStrings[5].sell_market_order}{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='sell-market-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='sell-market-enabled-overlay-right'>
                                          <Popover.Content>
                                            {
                                              jsonStrings[5]
                                                .sell_market_order_description
                                            }
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>

                              <p className='form-header mb-1'>
                                Hard Sell Trigger
                              </p>
                              <Form.Group
                                controlId='field-sell-hard-percentage'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  {jsonStrings[5].hard_sell_trigger}{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='sell-hard-price-percentage-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='sell-hard-price-percentage-overlay-right'>
                                        <Popover.Content>
                                          {
                                            jsonStrings[5]
                                              .hard_sell_trigger_description
                                          }
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <InputGroup size='sm'>
                                  <FormControl
                                    size='sm'
                                    type='number'
                                    placeholder={
                                      jsonStrings[5]
                                        .placeholder_hard_sell_trigger
                                    }
                                    required
                                    min='0'
                                    step='0.0001'
                                    data-state-key='sell.hardPercentage'
                                    value={
                                      symbolConfiguration.sell.hardPercentage
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text>
                                      {(
                                        symbolConfiguration.sell
                                          .hardPercentage *
                                          100 -
                                        100
                                      ).toFixed(2)}
                                      %
                                    </InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>

                  <Accordion className='accordion-wrapper accordion-floating'>
                    <Card className='mt-1'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          Prediction
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-xs-12 col-sm-6'>
                              <Form.Group
                                controlId='field-predict-coin-value-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='buy.predictValue'
                                    checked={
                                      symbolConfiguration.buy.predictValue
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    Predict coin value{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='predict-coin-value-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='predict-coin-value-enabled-overlay-right'>
                                          <Popover.Content>
                                            When enabled, will predict the coin
                                            value 5 minutes in the future using
                                            the last 100 minutes as training.
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>

                              <Form.Group
                                controlId='field-predict-stop-loss-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='buy.predictStopLoss'
                                    checked={
                                      symbolConfiguration.buy.predictStopLoss
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    Predict Stop Loss{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='predict-stop-loss-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='predict-stop-loss-enabled-overlay-right'>
                                          <Popover.Content>
                                            When enabled, will predict the coin
                                            trend, and if it seems to be going
                                            up, don't sell at stop loss.
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>

                  <Accordion className='accordion-wrapper accordion-floating'>
                    <Card className='mt-1'>
                      <Card.Header className='px-2 py-1'>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                          className='p-0 fs-7 text-uppercase'>
                          ATH (All Time High) Buy Restriction
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body className='px-2 py-1'>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-buy-ath-restriction-enabled'
                                className='mb-2'>
                                <Form.Check size='sm'>
                                  <Form.Check.Input
                                    type='checkbox'
                                    data-state-key='strategyOptions.athRestriction.enabled'
                                    checked={
                                      symbolConfiguration.strategyOptions
                                        .athRestriction.enabled
                                    }
                                    onChange={this.handleInputChange}
                                  />
                                  <Form.Check.Label>
                                    ATH Buy Restriction Enabled{' '}
                                    <OverlayTrigger
                                      trigger='click'
                                      key='buy-ath-restriction-enabled-overlay'
                                      placement='bottom'
                                      overlay={
                                        <Popover id='buy-ath-restriction-enabled-overlay-right'>
                                          <Popover.Content>
                                            If enabled, the bot will retrieve
                                            ATH (All Time High) price of the
                                            coin based on the interval/candle
                                            configuration. If the buy trigger
                                            price is higher than ATH buy
                                            restriction price, which is
                                            calculated by ATH Restriction price
                                            percentage, the bot will not place a
                                            buy order. The bot will place an
                                            order when the trigger price is
                                            lower than ATH buy restriction
                                            price.
                                          </Popover.Content>
                                        </Popover>
                                      }>
                                      <Button
                                        variant='link'
                                        className='p-0 m-0 ml-1 text-info'>
                                        <i className='fas fa-question-circle fa-sm'></i>
                                      </Button>
                                    </OverlayTrigger>
                                  </Form.Check.Label>
                                </Form.Check>
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-ath-candles-interval'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  Interval
                                  <OverlayTrigger
                                    trigger='click'
                                    key='interval-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='interval-overlay-right'>
                                        <Popover.Content>
                                          Set candle interval for calculating
                                          the ATH (All The High) price.
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Control
                                  size='sm'
                                  as='select'
                                  required
                                  data-state-key='strategyOptions.athRestriction.candles.interval'
                                  value={
                                    symbolConfiguration.strategyOptions
                                      .athRestriction.candles.interval
                                  }
                                  onChange={this.handleInputChange}>
                                  <option value='1m'>1m</option>
                                  <option value='3m'>3m</option>
                                  <option value='5m'>5m</option>
                                  <option value='15m'>15m</option>
                                  <option value='30m'>30m</option>
                                  <option value='1h'>1h</option>
                                  <option value='2h'>2h</option>
                                  <option value='4h'>4h</option>
                                  <option value='1d'>1d</option>
                                </Form.Control>
                              </Form.Group>
                            </div>
                            <div className='col-6'>
                              <Form.Group
                                controlId='field-ath-candles-limit'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  Limit
                                  <OverlayTrigger
                                    trigger='click'
                                    key='limit-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='limit-overlay-right'>
                                        <Popover.Content>
                                          Set the number of candles to retrieve
                                          for calculating the ATH (All The High)
                                          price.
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Control
                                  size='sm'
                                  type='number'
                                  placeholder='Enter limit'
                                  required
                                  min='0'
                                  step='1'
                                  data-state-key='strategyOptions.athRestriction.candles.limit'
                                  value={
                                    symbolConfiguration.strategyOptions
                                      .athRestriction.candles.limit
                                  }
                                  onChange={this.handleInputChange}
                                />
                              </Form.Group>
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-12'>
                              <Form.Group
                                controlId='field-buy-restriction-percentage'
                                className='mb-2'>
                                <Form.Label className='mb-0'>
                                  Restriction price percentage{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='interval-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='interval-overlay-right'>
                                        <Popover.Content>
                                          Set the percentage to calculate
                                          restriction price. i.e. if set{' '}
                                          <code>0.9</code> and the ATH(All Time
                                          High) price <code>$110</code>,
                                          restriction price will be{' '}
                                          <code>$99</code> for stop limit order.
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Control
                                  size='sm'
                                  type='number'
                                  placeholder='Enter restriction price percentage'
                                  required
                                  min='0'
                                  step='0.0001'
                                  data-state-key='strategyOptions.athRestriction.restrictionPercentage'
                                  value={
                                    symbolConfiguration.strategyOptions
                                      .athRestriction.restrictionPercentage
                                  }
                                  onChange={this.handleInputChange}
                                />
                              </Form.Group>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className='w-100'>{jsonStrings[5].note_changes}</div>
              <Button
                variant='danger'
                size='sm'
                type='button'
                onClick={() => this.handleModalShow('confirm')}>
                {jsonStrings[5].reset_global_settings}
              </Button>
              <Button
                variant='danger'
                size='sm'
                type='button'
                onClick={() => this.handleModalShow('gridTrade')}>
                Reset Grid Trade
              </Button>
              <Button
                variant='secondary'
                size='sm'
                type='button'
                onClick={() => this.handleModalClose('setting')}>
                {jsonStrings[1]._close}
              </Button>
              <Button type='submit' variant='primary' size='sm'>
                {jsonStrings[1].save_changes}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal
          show={this.state.showConfirmModal}
          onHide={() => this.handleModalClose('confirm')}
          size='md'>
          <Modal.Header className='pt-1 pb-1'>
            <Modal.Title>
              <span className='text-danger'>
                ⚠ {jsonStrings[0].reset_global_settings}
              </span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {jsonStrings[0].warning_global_save}
            <br />
            <br />
            {jsonStrings[0].delete_symbol_setting}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => this.handleModalClose('confirm')}>
              {jsonStrings[1]._cancel}
            </Button>
            <Button
              variant='success'
              size='sm'
              onClick={() => this.resetToGlobalConfiguration()}>
              {jsonStrings[1]._yes}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
