import { useEffect, useState } from 'react';
import Web3Utils from 'web3-utils';
import { getBalance, getTotalEUL } from '../../../utils/search/utils';
import { COSMOS, INFINITY } from '../../../utils/config';
import { useGetBalance } from '../../account/hooks';

export const useAddressInfo = (accounts, updateCard) => {
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [totalCyber, setTotalCyber] = useState(0);
  const [totalCosmos, setTotalCosmos] = useState(0);
  const [address, setAddress] = useState(null);
  const { balance } = useGetBalance(address, updateCard);

  useEffect(() => {
    setTotalCyber(balance);
  }, [balance]);

  useEffect(() => {
    const feachData = async () => {
      setLoadingInfo(true);
      if (accounts.cyber) {
        setAddress(accounts.cyber.bech32);
      }
      if (accounts.cosmos) {
        const responseCosmos = await getBalance(
          accounts.cosmos.bech32,
          COSMOS.GAIA_NODE_URL_LSD
        );
        const responseTotalCosmos = await getTotalEUL(responseCosmos);
        setTotalCosmos(responseTotalCosmos);
      }
      setLoadingInfo(false);
    };
    feachData();
  }, [accounts, updateCard]);

  return {
    totalCyber,
    totalCosmos,
    loadingInfo,
  };
};

export const useGetBalanceEth = (address, web3, contractToken) => {
  const [balanceEth, setBalanceEth] = useState({
    eth: INFINITY,
    gol: INFINITY,
  });

  useEffect(() => {
    if (web3 && web3 !== null) {
      const feachData = async () => {
        const { givenProvider } = web3;
        if (givenProvider !== null) {
          const responseEth = await web3.eth.getBalance(address.bech32);
          const eth = Web3Utils.fromWei(responseEth, 'ether');
          setBalanceEth((item) => ({ ...item, eth }));
          const responseGol = await contractToken.methods
            .balanceOf(address.bech32)
            .call();
          setBalanceEth((item) => ({ ...item, gol: responseGol }));
        }
      };
      feachData();
    }
  }, [web3, address, contractToken]);

  return balanceEth;
};
