import React, { Component } from 'react';
import {
  ScrollContainer,
  MainContainer,
  Pane,
  Tablist,
  Tab,
  TableEv as Table,
  Pill,
  Tooltip,
  Text,
  Icon,
} from '@cybercongress/gravity';
import { connect } from 'react-redux';

import { Link, Route } from 'react-router-dom';

import LocalizedStrings from 'react-localization';
import {
  getValidators,
  getValidatorsUnbonding,
  getValidatorsUnbonded,
  selfDelegationShares,
  stakingPool,
  getDelegations,
} from '../../utils/search/utils';
import {
  fromBech32,
  formatNumber,
  asyncForEach,
  trimString,
  roundNumber,
  formatCurrency,
} from '../../utils/utils';
import {
  FormatNumber,
  Loading,
  PillNumber,
  Dots,
  TabBtn,
} from '../../components';
import ActionBarContainer from './actionBar';
import { i18n } from '../../i18n/en';
import { CYBER } from '../../utils/config';

const T = new LocalizedStrings(i18n);

const StatusTooltip = ({ status }) => {
  let statusColor;

  switch (status) {
    case 0:
      statusColor = 'red';
      break;
    case 1:
      statusColor = 'yellow';
      break;
    case 2:
      statusColor = 'green';
      break;
    default:
      statusColor = 'neutral';
      break;
  }

  return (
    <Pane marginRight={10} display="flex" alignItems="center">
      <Tooltip
        appearance="card"
        content={
          <Pane display="flex" alignItems="center" paddingX={18} paddingY={18}>
            <Text>
              Validator status:&nbsp;
              {status === 0 && 'unbonded'}
              {status === 1 && 'unbonding'}
              {status === 2 && 'bonded'}
            </Text>
          </Pane>
        }
      >
        <Pill
          height={7}
          width={7}
          borderRadius="50%"
          paddingX={4}
          paddingY={0}
          // marginX={20}
          isSolid
          color={statusColor}
        />
      </Tooltip>
    </Pane>
  );
};

const TextTable = ({ children, fontSize, color, display, ...props }) => (
  <Text
    fontSize={`${fontSize || 13}px`}
    color={`${color || '#fff'}`}
    display={`${display || 'inline-flex'}`}
    alignItems="center"
    {...props}
  >
    {children}
  </Text>
);

class Validators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validators: [],
      showJailed: false,
      loadingSelfAndBond: true,
      loadingValidators: true,
      bondedTokens: 0,
      validatorSelect: [],
      selectedIndex: '',
      language: 'en',
      addressPocket: null,
      selected: 'active',
      unStake: false,
      countHeroes: {
        active: 0,
        jailed: 0,
      },
    };
  }

  async componentDidMount() {
    this.init();
    this.chekPathname();
  }

  componentDidUpdate(prevProps) {
    const { location, defaultAccount } = this.props;
    if (prevProps.location.pathname !== location.pathname) {
      this.chekPathname();
    }
    if (prevProps.defaultAccount.name !== defaultAccount.name) {
      this.init();
    }
  }

  checkAddressLocalStorage = async () => {
    const { defaultAccount } = this.props;
    const { account } = defaultAccount;
    let addressPocket = null;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      addressPocket = account.cyber;
    }
    this.setState({
      addressPocket,
    });
  };

  chekPathname = () => {
    const { location } = this.props;
    const { pathname } = location;

    if (pathname.match(/jailed/gm) && pathname.match(/jailed/gm).length > 0) {
      this.setState({ selected: 'jailed', showJailed: true });
    } else {
      this.setState({ selected: 'active', showJailed: false });
    }
  };

  init = async () => {
    this.setState({
      loadingSelfAndBond: true,
      loadingValidators: true,
    });
    await this.checkAddressLocalStorage();
    await this.getSupply();
    this.getValidators();
    this.setState({
      validatorSelect: [],
      selectedIndex: '',
    });
  };

  getSupply = async () => {
    const bondedTokens = await stakingPool();
    this.setState({
      bondedTokens: bondedTokens.bonded_tokens,
    });
  };

  getValidators = async () => {
    const { addressPocket } = this.state;
    let delegationsData = [];
    let validators = [];
    const countHeroes = {
      active: 0,
      jailed: 0,
    };

    const validatorsActive = await getValidators();
    if (validatorsActive !== null && Object.keys(validatorsActive).length > 0) {
      validators.push(...validatorsActive);
      countHeroes.active = Object.keys(validatorsActive).length;
    }
    const validatorsJailed = await getValidatorsUnbonding();
    if (validatorsJailed !== null && Object.keys(validatorsJailed).length > 0) {
      validators.push(...validatorsJailed);
      countHeroes.jailed += Object.keys(validatorsJailed).length;
    }
    const validatorsUnbonded = await getValidatorsUnbonded();
    if (
      validatorsUnbonded !== null &&
      Object.keys(validatorsUnbonded).length > 0
    ) {
      validators.push(...validatorsUnbonded);
      countHeroes.jailed += Object.keys(validatorsUnbonded).length;
    }

    validators = validators
      .slice(0)
      .sort((a, b) => (+a.tokens > +b.tokens ? -1 : 1));

    this.setState({
      validators,
      countHeroes,
      loadingValidators: false,
    });

    if (addressPocket && addressPocket.bech32) {
      const responseDelegations = await getDelegations(addressPocket.bech32);
      delegationsData = responseDelegations;
    }

    if (delegationsData.length > 0) {
      delegationsData.forEach((item) => {
        validators.forEach((itemValidators, j) => {
          if (itemValidators.operator_address === item.validator_address) {
            validators[j].delegation = item.balance;
          }
        });
      });
    }

    await asyncForEach(
      Array.from(Array(validators.length).keys()),
      async (item) => {
        const delegatorAddress = fromBech32(validators[item].operator_address);
        let shares = 0;

        const getSelfDelegation = await selfDelegationShares(
          delegatorAddress,
          validators[item].operator_address
        );

        if (getSelfDelegation && validators[item].delegator_shares > 0) {
          shares =
            (getSelfDelegation / validators[item].delegator_shares) * 100;
        }

        validators[item].shares = formatNumber(
          Math.floor(shares * 100) / 100,
          2
        );
      }
    );
    console.log(validators);
    this.setState({
      loadingSelfAndBond: false,
      validators,
    });
  };

  selectValidators = (validator, index) => {
    const { validatorSelect, selectedIndex } = this.state;

    let selectValidator = {};
    let stake = false;

    if (selectedIndex === index) {
      this.setState({
        selectedIndex: '',
      });
    } else {
      this.setState({
        selectedIndex: index,
      });
    }
    if (validatorSelect !== validator) {
      selectValidator = validator;
      if (selectValidator.delegation) {
        if (parseFloat(selectValidator.delegation.amount) > 0) {
          stake = true;
        }
      }
      return this.setState({
        validatorSelect: selectValidator,
        unStake: stake,
      });
    }
    return this.setState({
      validatorSelect: selectValidator,
      unStake: stake,
    });
  };

  render() {
    const {
      validators,
      showJailed,
      loadingSelfAndBond,
      loadingValidators,
      validatorSelect,
      selectedIndex,
      language,
      addressPocket,
      selected,
      unStake,
      bondedTokens,
      countHeroes,
    } = this.state;
    const { mobile } = this.props;

    T.setLanguage(language);

    if (loadingValidators) {
      return (
        <div
          style={{
            width: '100%',
            height: '50vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Loading />
          <div style={{ color: '#fff', marginTop: 20, fontSize: 20 }}>
            Loading
          </div>
        </div>
      );
    }

    const validatorRows = validators
      .filter((validator) =>
        showJailed ? validator.status < 2 : validator.status === 2
      )
      .map((validator, index) => {
        const commission = formatNumber(
          validator.commission.commission_rates.rate * 100,
          2
        );
        const staking = formatNumber(
          Math.floor((validator.tokens / bondedTokens) * 100 * 100) / 100,
          2
        );
        return (
          <Table.Row
            borderBottom="none"
            // backgroundColor={index === selectedIndex ? '#ffffff29' : '#000'}
            boxShadow={index === selectedIndex ? '0px 0px 7px #3ab793db' : ''}
            //   className='validators-table-row'
            onSelect={() => this.selectValidators(validator, index)}
            isSelectable
            key={validator.operator_address}
          >
            <Table.TextCell
              paddingX={5}
              textAlign="start"
              flexBasis={mobile ? 30 : 60}
              flex="none"
              isNumber
            >
              <TextTable>{index + 1}</TextTable>
            </Table.TextCell>
            <Table.TextCell paddingX={5}>
              <TextTable>
                <StatusTooltip status={validator.status} />
                <Link to={`/network/euler/hero/${validator.operator_address}`}>
                  {validator.description.moniker}
                </Link>
              </TextTable>
            </Table.TextCell>
            <Table.TextCell paddingX={5} flex={0.7} textAlign="end">
              <TextTable>
                <FormatNumber number={commission} fontSizeDecimal={11.5} />
                &ensp;%
              </TextTable>
            </Table.TextCell>
            <Table.TextCell paddingX={5} textAlign="end" isNumber>
              <TextTable>
                <Tooltip
                  content={`${formatNumber(parseFloat(validator.tokens))} 
                ${CYBER.DENOM_CYBER.toUpperCase()}`}
                >
                  <TextTable>
                    {formatCurrency(
                      validator.tokens,
                      CYBER.DENOM_CYBER.toUpperCase()
                    )}
                  </TextTable>
                </Tooltip>
              </TextTable>
            </Table.TextCell>
            {!mobile && (
              <>
                <Table.TextCell paddingX={5} textAlign="end" isNumber>
                  <TextTable>
                    <FormatNumber number={staking} fontSizeDecimal={11.5} />
                    &ensp;%
                  </TextTable>
                </Table.TextCell>
                <Table.TextCell paddingX={5} textAlign="end">
                  <TextTable>
                    {loadingSelfAndBond ? (
                      <Dots />
                    ) : (
                      <FormatNumber
                        number={validator.shares}
                        fontSizeDecimal={11.5}
                      />
                    )}
                    &ensp;%
                  </TextTable>
                </Table.TextCell>
                <Table.TextCell paddingX={5} textAlign="end" isNumber>
                  {loadingSelfAndBond ? (
                    <Dots />
                  ) : (
                    <Tooltip
                      content={`${formatNumber(
                        Math.floor(
                          parseFloat(
                            validator.delegation !== undefined
                              ? validator.delegation.amount
                              : 0
                          )
                        )
                      )} 
                ${CYBER.DENOM_CYBER.toUpperCase()}`}
                    >
                      <TextTable>
                        {formatCurrency(
                          parseFloat(
                            validator.delegation !== undefined
                              ? validator.delegation.amount
                              : 0
                          ),
                          CYBER.DENOM_CYBER.toLocaleUpperCase()
                        )}
                      </TextTable>
                    </Tooltip>
                  )}
                </Table.TextCell>
              </>
            )}
            {showJailed && (
              <Table.TextCell paddingX={5} flex={1} textAlign="end" isNumber>
                <TextTable>{validator.unbonding_height}</TextTable>
              </Table.TextCell>
            )}
          </Table.Row>
        );
      });
    return (
      <div>
        <main className="block-body">
          <Pane
            boxShadow="0px 0px 5px #36d6ae"
            paddingX={20}
            paddingY={20}
            marginY={20}
          >
            <Text fontSize="16px" color="#fff">
              If all heroes collectively will be able to gather 100 heroes, and
              this number can last for 10000 blocks, additionally 2 TCYB will be
              allocated to heroes who take part in{' '}
              <Link to="/search/Genesis">Genesis</Link>. If the number of heroes
              will increase to or over 146, additional 3 TCYB will be allocated.
              All rewards in that discipline will be distributed to validators
              per capita.
            </Text>
          </Pane>
          {/* <Pane
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          > */}
          <Tablist
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
            gridGap="10px"
            marginBottom={24}
          >
            <TabBtn
              key="Active"
              isSelected={selected === 'active'}
              to="/heroes"
              text={
                <Pane display="flex" alignItems="center">
                  <Pane>Active</Pane>
                  <PillNumber
                    marginLeft={5}
                    height="20px"
                    active={selected === 'active'}
                  >
                    {countHeroes.active}
                  </PillNumber>
                </Pane>
              }
            />
            <TabBtn
              key="Jailed"
              isSelected={selected === 'jailed'}
              to="/heroes/jailed"
              text={
                <Pane display="flex" alignItems="center">
                  <Pane>Jailed</Pane>
                  <PillNumber
                    marginLeft={5}
                    height="20px"
                    active={selected === 'jailed'}
                  >
                    {countHeroes.jailed}
                  </PillNumber>
                </Pane>
              }
            />
          </Tablist>
          {/* </Pane> */}

          <Table>
            <Table.Head
              style={{
                backgroundColor: '#000',
                borderBottom: '1px solid #ffffff80',
                marginTop: '10px',
                paddingBottom: '10px',
              }}
            >
              <Table.TextHeaderCell
                paddingX={5}
                textAlign="center"
                flexBasis={mobile ? 30 : 60}
                flex="none"
              >
                <TextTable fontSize={14}>#</TextTable>
              </Table.TextHeaderCell>
              <Table.TextHeaderCell textAlign="center" paddingX={5}>
                <TextTable fontSize={13}>
                  {T.validators.table.moniker}
                </TextTable>
              </Table.TextHeaderCell>
              <Table.TextHeaderCell flex={0.7} paddingX={5} textAlign="center">
                <TextTable fontSize={13} whiteSpace="nowrap">
                  {T.validators.table.commissionProcent}
                </TextTable>
              </Table.TextHeaderCell>
              <Table.TextHeaderCell paddingX={5} textAlign="center">
                <TextTable fontSize={13}>{T.validators.table.power}</TextTable>
              </Table.TextHeaderCell>
              {!mobile && (
                <>
                  {' '}
                  <Table.TextHeaderCell paddingX={5} textAlign="center">
                    <TextTable fontSize={13}>Power, %</TextTable>
                  </Table.TextHeaderCell>
                  <Table.TextHeaderCell paddingX={5} textAlign="center">
                    <TextTable fontSize={14}>
                      {T.validators.table.selfProcent}
                    </TextTable>
                  </Table.TextHeaderCell>
                  <Table.TextHeaderCell paddingX={5} textAlign="center">
                    <TextTable fontSize={14}>
                      {T.validators.table.bondedTokens}{' '}
                      <Tooltip
                        position="bottom"
                        content="Amount of EUL ( tokens you bonded to validator in )"
                      >
                        <Icon
                          icon="info-sign"
                          color="#3ab793d4"
                          marginLeft={5}
                        />
                      </Tooltip>
                    </TextTable>
                  </Table.TextHeaderCell>{' '}
                </>
              )}
              {showJailed && (
                <Table.TextHeaderCell paddingX={5} flex={1} textAlign="end">
                  <TextTable fontSize={14}>
                    {T.validators.table.unbonding}
                  </TextTable>
                </Table.TextHeaderCell>
              )}
            </Table.Head>
            <Table.Body
              style={{
                backgroundColor: '#000',
                overflowY: 'hidden',
                padding: 7,
              }}
            >
              {validatorRows}
            </Table.Body>
          </Table>
        </main>
        <ActionBarContainer
          updateTable={this.init}
          validators={validatorSelect}
          validatorsAll={validators}
          addressPocket={addressPocket}
          unStake={unStake}
          mobile={mobile}
        />
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(Validators);
