import React, { useEffect, useState, useContext } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fromBech32, formatNumber, asyncForEach } from '../../utils/utils';
import { Loading } from '../../components';
import ActionBarContainer from './ActionBarContainer';
import { TableHeroes, TableItem, TextBoard, TabBtnList } from './components';
import { AppContext } from '../../context';
import getHeroes from './getHeroesHook';

const status = {
  BOND_STATUS_UNSPECIFIED: 0,
  /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
  BOND_STATUS_UNBONDED: 1,
  /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
  BOND_STATUS_UNBONDING: 2,
  /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
  BOND_STATUS_BONDED: 3,
};

function Validators({ mobile, defaultAccount }) {
  const location = useLocation();
  const { jsCyber } = useContext(AppContext);
  const { validators, countHeroes, loadingValidators } = getHeroes();
  const [loadingSelf, setLoadingSelf] = useState(true);
  const [loadingBond, setLoadingBond] = useState(true);
  const [bondedTokens, setBondedTokens] = useState(0);
  const [validatorSelect, setValidatorSelect] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [addressPocket, setAddressPocket] = useState(null);
  const [selected, setSelected] = useState('active');
  const [unStake, setUnStake] = useState(false);
  const [delegationsData, setDelegationsData] = useState([]);
  const [validatorsData, setValidatorsData] = useState([]);
  const [updatePage, setUpdatePage] = useState(0);

  useEffect(() => {
    setValidatorsData(validators);
  }, [validators]);

  useEffect(() => {
    const { account } = defaultAccount;
    let addressActive = null;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      const { keys, bech32 } = account.cyber;
      addressActive = {
        bech32,
        keys,
      };
    }
    setLoadingBond(true);
    setLoadingSelf(true);
    setAddressPocket(addressActive);
  }, [defaultAccount.name]);

  useEffect(() => {
    const { pathname } = location;

    if (pathname.match(/jailed/gm) && pathname.match(/jailed/gm).length > 0) {
      setSelected('jailed');
    } else {
      setSelected('active');
    }
  }, [location.pathname]);

  useEffect(() => {
    const feachPool = async () => {
      if (jsCyber !== null) {
        const response = await jsCyber.stakingPool();
        if (response.pool.bondedTokens) {
          setBondedTokens(response.pool.bondedTokens);
        }
      }
    };
    feachPool();
  }, [jsCyber]);

  useEffect(() => {
    try {
      const feachDelegatorDelegations = async () => {
        let delegationsDataTemp = [];
        if (addressPocket !== null && jsCyber !== null) {
          const responseDelegatorDelegations = await jsCyber.delegatorDelegations(
            addressPocket.bech32
          );
          delegationsDataTemp =
            responseDelegatorDelegations.delegationResponses;
        }
        setDelegationsData(delegationsDataTemp);
      };
      feachDelegatorDelegations();
    } catch (e) {
      console.log(`e`, e);
      setDelegationsData([]);
    }
  }, [addressPocket, jsCyber, updatePage]);

  useEffect(() => {
    if (validators.length > 0 && delegationsData.length > 0) {
      const tempValidators = [...validators];
      const tempDelegationsData = [...delegationsData];

      tempDelegationsData.forEach((item) => {
        tempValidators.forEach((itemValidators, j) => {
          if (
            itemValidators.operatorAddress === item.delegation.validatorAddress
          ) {
            tempValidators[j].delegation = item.balance;
          }
        });
      });
      setValidatorsData(tempValidators);
      setLoadingBond(false);
    } else {
      setLoadingBond(true);
    }
  }, [delegationsData, validators]);

  useEffect(() => {
    const selfDelegation = async () => {
      if (jsCyber !== null && validatorsData.length > 0) {
        await asyncForEach(
          Array.from(Array(validatorsData.length).keys()),
          async (item) => {
            const delegatorAddress = fromBech32(
              validatorsData[item].operatorAddress
            );
            let shares = 0;
            const getSelfDelegation = await jsCyber.delegation(
              delegatorAddress,
              validatorsData[item].operatorAddress
            );
            const { delegationResponse } = getSelfDelegation;
            if (
              delegationResponse.balance.amount &&
              validatorsData[item].delegatorShares > 0
            ) {
              const selfShares = delegationResponse.balance.amount;
              const delegatorShares =
                validatorsData[item].delegatorShares * 10 ** -18;
              shares = (selfShares / delegatorShares) * 100;
            }
            validatorsData[item].shares = formatNumber(
              Math.floor(shares * 100) / 100,
              2
            );
          }
        );
        setLoadingSelf(false);
      }
    };
    selfDelegation();
  }, [validatorsData, jsCyber]);

  const selectValidators = (validator, index) => {
    let selectValidator = {};
    let stake = false;

    if (selectedIndex === index) {
      setSelectedIndex('');
    } else {
      setSelectedIndex(index);
    }
    if (validatorSelect !== validator) {
      selectValidator = validator;
      if (selectValidator.delegation) {
        if (parseFloat(selectValidator.delegation.amount) > 0) {
          stake = true;
        }
      }
    }
    setValidatorSelect(selectValidator);
    setUnStake(stake);
  };

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

  return (
    <div>
      <main className="block-body" style={{ paddingTop: 50 }}>
        <TabBtnList selected={selected} countHeroes={countHeroes} />

        <TableHeroes mobile={mobile} showJailed={selected === 'jailed'}>
          {validatorsData
            .filter((validator) =>
              selected === 'jailed'
                ? status[validator.status] < 3
                : status[validator.status] === 3
            )
            .map((validator, index) => {
              const commission = formatNumber(
                validator.commission.commissionRates.rate * 10 ** -18 * 100,
                2
              );
              const staking = formatNumber(
                Math.floor((validator.tokens / bondedTokens) * 100 * 100) / 100,
                2
              );
              return (
                <TableItem
                  key={validator.operator_address}
                  staking={staking}
                  commission={commission}
                  item={validator}
                  index={index + 1}
                  selected={index === selectedIndex}
                  selectValidators={() => selectValidators(validator, index)}
                  mobile={mobile}
                  showJailed={selected === 'jailed'}
                  loadingSelf={loadingSelf}
                  loadingBond={loadingBond}
                />
              );
            })}
        </TableHeroes>
      </main>
      <ActionBarContainer
        updateTable={() => setUpdatePage(updatePage + 1)}
        validators={validatorSelect}
        validatorsAll={validatorsData}
        addressPocket={addressPocket}
        unStake={unStake}
        mobile={mobile}
      />
    </div>
  );
  // }
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(Validators);
