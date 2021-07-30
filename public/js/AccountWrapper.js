/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class AccountWrapper extends React.Component {
  render() {
    const { accountInfo, dustTransfer, sendWebSocket, jsonStrings } = this.props;

    if (_.isEmpty(jsonStrings)) {
      return '';
    }

    const { common_strings } = jsonStrings;

    const assets = accountInfo.balances.map((balance, index) => {
      return (
        <AccountWrapperAsset
          key={`account-wrapper-` + index}
          balance={balance}
          jsonStrings={jsonStrings}>
        </AccountWrapperAsset>
      );
    });

    return (
      <div className='accordion-wrapper account-wrapper'>
        <Accordion>
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              eventKey='0'
              className='px-2 py-1'>
              <button
                type='button'
                className='btn btn-sm btn-link btn-account-balance text-uppercase font-weight-bold'>
                {common_strings.account_balance}
              </button>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey='0'>
              <Card.Body className='d-flex flex-column py-2 px-0'>
                <div className='account-balance-assets-wrapper d-flex flex-row flex-wrap justify-content-start'>
                  {assets}
                </div>
                <div className='account-balance-assets-wrapper d-flex flex-row flex-wrap justify-content-end'>
                  <DustTransferIcon
                    dustTransfer={dustTransfer}
                    sendWebSocket={sendWebSocket}
                    jsonStrings={jsonStrings}
                  />
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    );
  }
}
