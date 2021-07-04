import { useEffect, useState } from 'react';
import { authAccounts } from '../../utils/search/utils';

const MILLISECONDS_IN_SECOND = 1000;

function useGetSlots(addressActive, updateAddress) {
  const [slotsData, setSlotsData] = useState([]);
  const [loadingAuthAccounts, setLoadingAuthAccounts] = useState(true);
  const [vested, setVested] = useState(0);

  useEffect(() => {
    const getAuth = async () => {
      setLoadingAuthAccounts(true);
      setVested(0);
      setSlotsData([]);
      if (addressActive !== null) {
        let sboot = 0;
        const getAccount = await authAccounts(addressActive);
        console.log(`getAccount`, getAccount);
        if (getAccount !== null && getAccount.result.value.vesting_periods) {
          const { vesting_periods: vestingPeriods } = getAccount.result.value;
          const {
            original_vesting: originalVesting,
          } = getAccount.result.value.base_vesting_account;
          const { start_time: startTime } = getAccount.result.value;

          const balances = getCalculationBalance(originalVesting);
          if (balances.sboot) {
            sboot = balances.sboot;
          }
          setVested(sboot);

          const dataVesting = getVestingPeriodsData(vestingPeriods, startTime);
          setSlotsData(dataVesting);
          setLoadingAuthAccounts(false);
        } else {
          setVested(0);
          setLoadingAuthAccounts(false);
          setSlotsData([]);
        }
      } else {
        setVested(0);
        setLoadingAuthAccounts(false);
        setSlotsData([]);
      }
    };
    getAuth();
  }, [updateAddress, addressActive]);

  const getCalculationBalance = (data) => {
    const balances = {};
    if (Object.keys(data).length > 0) {
      data.forEach((item) => {
        balances[item.denom] = parseFloat(item.amount);
      });
    }

    return balances;
  };

  const getVestingPeriodsData = (data, startTime) => {
    const tempData = [];
    let length = parseFloat(startTime);

    if (data.length > 0) {
      data.forEach((item) => {
        const obj = {};
        length += parseFloat(item.length);
        const lengthMs = length * MILLISECONDS_IN_SECOND;
        obj.length = length * MILLISECONDS_IN_SECOND;
        if (lengthMs < Date.parse(new Date())) {
          obj.status = 'closed';
        } else {
          obj.status = 'active';
        }
        // obj.status = 'empty';
        item.amount.forEach((itemAmount) => {
          const amount = {};
          amount[itemAmount.denom] = parseFloat(itemAmount.amount);
          if (obj.amount) {
            obj.amount = { ...obj.amount, ...amount };
          } else {
            obj.amount = amount;
          }
        });
        tempData.push(obj);
      });
    }
    return tempData;
  };

  return { slotsData, vested, loadingAuthAccounts };
}

export default useGetSlots;
