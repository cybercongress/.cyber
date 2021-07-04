import React, { useState, useEffect, useContext } from 'react';
import { coin, coins } from '@cosmjs/launchpad';
import { SigningCyberClient, SigningCyberClientOptions } from 'js-cyber';
import { Tablist, Pane } from '@cybercongress/gravity';
import { AppContext } from '../../context';
import { CYBER } from '../../utils/config';
import { trimString, formatNumber } from '../../utils/utils';
import { Btn } from './ui';
import Convert from './convert';

const configKeplr = () => {
  return {
    // Chain-id of the Cosmos SDK chain.
    chainId: CYBER.CHAIN_ID,
    // The name of the chain to be displayed to the user.
    chainName: CYBER.CHAIN_ID,
    // RPC endpoint of the chain.
    rpc: 'http://localhost:26657',
    rest: 'http://localhost:1317',
    stakeCurrency: {
      coinDenom: 'NICK',
      coinMinimalDenom: 'nick',
      coinDecimals: 0,
    },
    bip44: {
      // You can only set the coin type of BIP44.
      // 'Purpose' is fixed to 44.
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cyber',
      bech32PrefixAccPub: 'cyberpub',
      bech32PrefixValAddr: 'cybervaloper',
      bech32PrefixValPub: 'cybervaloperpub',
      bech32PrefixConsAddr: 'cybervalcons',
      bech32PrefixConsPub: 'cybervalconspub',
    },
    currencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: 'NICK',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'nick',
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 0,
      },
    ],
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: 'NICK',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'nick',
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 0,
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0,
    },
  };
};

function TestKeplr() {
  const { keplr, jsCyber } = useContext(AppContext);
  const [hashTx, setHashTx] = useState('');
  const [addressEnergyRoute, setAddressEnergyRoute] = useState(
    'cyber1njj4p35u8pggm7nypg3y66rypgvk2atjcy7ngp'
  );
  const [validatorAddress, setValidatorAddress] = useState(
    'cybervaloper1frk9k38pvp70vheezhdfd4nvqnlsm9dw4txuxm'
  );
  const [alias, setAlias] = useState('');
  const [aliasRouteAlias, setAliasRouteAlias] = useState('');
  const [amount, setAmount] = useState(0);
  const [amountStake, setAmountStake] = useState(0);
  const [time, setTime] = useState(100);
  const [select, setSelect] = useState('volt');
  const [selected, setSelected] = useState('txs');
  const [amountSend, setAmountSend] = useState('');
  const [allBalances, setAllBalances] = useState({});
  const [addressTo, setAddressTo] = useState(
    'cyber1njj4p35u8pggm7nypg3y66rypgvk2atjcy7ngp'
  );
  const [from, setFrom] = useState(
    'QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV'
  );
  const [to, setTo] = useState(
    'QmUX9mt8ftaHcn9Nc6SR4j9MsKkYfkcZqkfPTmMmBgeTe2'
  );
  const [bandwidthPrice, setBandwidthPrice] = useState(0);
  const [accountBandwidth, setAccountBandwidth] = useState({});
  const [sourceRoutes, setSourceRoutes] = useState([]);
  const [destinationRoutes, setDestinationRoutes] = useState([]);
  const [destinationRoutedEnergy, setDestinationRoutedEnergy] = useState([]);
  const [sourceRoutedEnergy, setSourceRoutedEnergy] = useState([]);
  const [destination, setDestination] = useState(
    'cyber1njj4p35u8pggm7nypg3y66rypgvk2atjcy7ngp'
  );

  useEffect(() => {
    const sourceRouted = async () => {
      if (jsCyber && jsCyber !== null) {
        try {
          console.log(`jsCyber`, jsCyber);
          const queryResultsourceRoutes = await jsCyber.sourceRoutes(
            'cyber1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwzs7wzf'
          );
          setSourceRoutes(queryResultsourceRoutes.routes);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultdestinationRoutes = await jsCyber.destinationRoutes(
            'cyber1njj4p35u8pggm7nypg3y66rypgvk2atjcy7ngp'
          );
          console.log(`queryResultdestinationRoutes`, queryResultdestinationRoutes)
          setDestinationRoutes(queryResultdestinationRoutes.routes);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultdestinationRoutedEnergy = await jsCyber.destinationRoutedEnergy(
            'cyber1njj4p35u8pggm7nypg3y66rypgvk2atjcy7ngp'
          );
          setDestinationRoutedEnergy(queryResultdestinationRoutedEnergy.value);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultsourceRoutedEnergy = await jsCyber.sourceRoutedEnergy(
            'cyber1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwzs7wzf'
          );
          setSourceRoutedEnergy(queryResultsourceRoutedEnergy.value);
        } catch (error) {
          console.log(error);
        }
      }
    };
    sourceRouted();
  }, [jsCyber]);

  useEffect(() => {
    const feachBandwidth = async () => {
      if (jsCyber !== null) {
        const queryResultLoad = await jsCyber.load();
        console.log('queryResultLoad', queryResultLoad);
        try {
          const queryResultPrice = await jsCyber.price();
          setBandwidthPrice(parseFloat(queryResultPrice.price.dec));
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultAccount = await jsCyber.account(
            'cyber1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwzs7wzf'
          );
          const {
            maxValue,
            remainedValue,
          } = queryResultAccount.accountBandwidth;

          setAccountBandwidth({
            maxValue: parseFloat(maxValue),
            remainedValue: parseFloat(remainedValue),
          });
        } catch (error) {
          console.log(error);
        }
      }
    };
    feachBandwidth();
  }, [jsCyber]);

  useEffect(() => {
    const getBalance = async () => {
      if (jsCyber !== null) {
        const queryResultgetAllBalancesUnverified = await jsCyber.getAllBalances(
          'cyber1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwzs7wzf'
        );
        const balances = {};
        if (Object.keys(queryResultgetAllBalancesUnverified).length > 0) {
          queryResultgetAllBalancesUnverified.forEach((item) => {
            balances[item.denom] = parseFloat(item.amount);
          });
        }
        setAllBalances(balances);
      }
    };
    getBalance();
  }, [jsCyber]);

  const link = async () => {
    if (keplr !== null) {
      console.log(`client`, keplr);
      const firstAddress = (await keplr.signer.getAccounts())[0].address;

      const response = await keplr.cyberlink(firstAddress, from, to);
      console.log(`response`, response);
      setHashTx(response.transactionHash);
    }
  };

  const convert = async () => {
    if (keplr !== null) {
      const [{ address }] = await keplr.signer.getAccounts();
      const response = await keplr.investmint(
        address,
        coin(parseFloat(amount), 'sboot'),
        select,
        parseFloat(time)
      );
      console.log(`response`, response);
      setHashTx(response.transactionHash);
    }
  };

  const createEnergyRoute = async () => {
    if (keplr !== null) {
      const firstAddress = (await keplr.signer.getAccounts())[0].address;
      const response = await keplr.createEnergyRoute(
        firstAddress,
        addressEnergyRoute,
        alias
      );
      setHashTx(response.transactionHash);
    }
  };

  const editEnergyRoute = async () => {
    if (keplr !== null) {
      try {
        const firstAddress = (await keplr.signer.getAccounts())[0].address;
        const response = await keplr.editEnergyRoute(
          firstAddress,
          addressEnergyRoute,
          coin(parseFloat(amount), select)
        );
        setHashTx(response.transactionHash);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const editEnergyRouteAlias = async () => {
    if (keplr !== null) {
      try {
        const firstAddress = (await keplr.signer.getAccounts())[0].address;
        const response = await keplr.editEnergyRouteAlias(
          firstAddress,
          destination,
          aliasRouteAlias
        );
        setHashTx(response.transactionHash);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const send = async () => {
    if (keplr !== null) {
      try {
        const firstAddress = (await keplr.signer.getAccounts())[0].address;
        const response = await keplr.sendTokens(
          firstAddress,
          addressTo,
          coins(parseFloat(amountSend), select)
        );
        console.log(`response`, response);
        setHashTx(response.transactionHash);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const delegateTokens = async () => {
    if (keplr !== null) {
      try {
        const [{ address }] = await keplr.signer.getAccounts();
        console.log(`address`, address);
        const response = await keplr.delegateTokens(
          address,
          validatorAddress,
          coin(parseFloat(amountStake), 'boot')
        );
        console.log(`response`, response);
        setHashTx(response.transactionHash);
      } catch (error) {
        console.log(`error`, error);
      }
    }
  };

  // const Txs = () => (

  // );

  const Queries = () => (
    <div>
      <div style={{ fontSize: '18px' }}>All Balances</div>
      <div style={{ marginTop: 10, fontSize: '18px' }}>
        {
          <div>
            {allBalances.boot ? formatNumber(allBalances.boot) : 0} boot
          </div>
        }
        {
          <div>
            {allBalances.sboot ? formatNumber(allBalances.sboot) : 0} sboot
          </div>
        }
        {
          <div>
            {allBalances.volt ? formatNumber(allBalances.volt) : 0} volt
          </div>
        }
        {
          <div>
            {allBalances.amper ? formatNumber(allBalances.amper) : 0} amper
          </div>
        }
      </div>
      <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
      <div style={{ fontSize: '18px', marginBottom: 10 }}>Bandwidth</div>
      {bandwidthPrice && (
        <div>bandwidthPrice {formatNumber(bandwidthPrice)}</div>
      )}
      {accountBandwidth.maxValue && accountBandwidth.remainedValue && (
        <>
          <div>maxValue {formatNumber(accountBandwidth.maxValue)}</div>
          <div>
            remainedValue {formatNumber(accountBandwidth.remainedValue)}
          </div>
        </>
      )}
      <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
      <div style={{ fontSize: '22px', marginBottom: 10 }}>Routed</div>
      <div style={{ marginBottom: 5, fontSize: 20 }}>source Routed Energy</div>
      {sourceRoutedEnergy.length > 0 &&
        sourceRoutedEnergy.map((item) => (
          <div>
            {item.amount} {item.denom}
          </div>
        ))}
      <div style={{ marginTop: 20, marginBottom: 5, fontSize: 20 }}>
        destination Routed Energy
      </div>
      {destinationRoutedEnergy.length > 0 &&
        destinationRoutedEnergy.map((item) => (
          <div>
            {item.amount} {item.denom}
          </div>
        ))}
      <div style={{ marginTop: 20, marginBottom: 5, fontSize: 20 }}>
        destination Routes
      </div>
      {destinationRoutes.length > 0 &&
        destinationRoutes.map((item) => (
          <div style={{ marginBottom: 10 }}>
            <div>alias: {item.alias}</div>
            <div>destination: {trimString(item.destination, 8, 6)}</div>
            <div>source: {trimString(item.source, 8, 6)}</div>
            <div>value:</div>
            {item.value &&
              item.value.length > 0 &&
              item.value.map((itemV) => (
                <div style={{ paddingLeft: 5 }}>
                  {itemV.amount} {itemV.denom}
                </div>
              ))}
          </div>
        ))}
      <div style={{ marginTop: 20, marginBottom: 5, fontSize: 20 }}>
        source Routes
      </div>
      {sourceRoutes.length > 0 &&
        sourceRoutes.map((item) => (
          <div style={{ marginBottom: 10 }}>
            <div>alias: {item.alias}</div>
            <div>destination: {trimString(item.destination, 8, 6)}</div>
            <div>source: {trimString(item.source, 8, 6)}</div>
            <div>value:</div>
            {item.value &&
              item.value.length > 0 &&
              item.value.map((itemV) => (
                <div style={{ paddingLeft: 5 }}>
                  {itemV.amount} {itemV.denom}
                </div>
              ))}
          </div>
        ))}
    </div>
  );

  return (
    <main className="block-body">
      <Tablist
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gridGap="8px"
        marginTop={25}
      >
        <Btn
          text="txs"
          checkedSwitch={selected === 'txs'}
          onSelect={() => setSelected('txs')}
        />
        <Btn
          text="queries"
          checkedSwitch={selected === 'queries'}
          onSelect={() => setSelected('queries')}
        />
      </Tablist>
      <Pane marginTop={30} marginBottom={50} display="grid">
        {/* <Txs /> */}
        {selected === 'txs' && (
          <>
            <div>amount</div>
            <input
              value={amountStake}
              style={{ width: 550, marginBottom: 20 }}
              onChange={(e) => setAmountStake(e.target.value)}
            />
            <div>validatorAddress</div>
            <input
              value={validatorAddress}
              style={{ width: 550 }}
              onChange={(e) => setValidatorAddress(e.target.value)}
            />
            <button
              className="btn"
              style={{ maxWidth: 250, marginTop: 50 }}
              onClick={delegateTokens}
              type="button"
            >
              delegateTokens
            </button>
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            <div>from</div>
            <input
              value={from}
              style={{ width: 550, marginBottom: 20 }}
              onChange={(e) => setFrom(e.target.value)}
            />
            <div>to</div>
            <input
              value={to}
              style={{ width: 550 }}
              onChange={(e) => setTo(e.target.value)}
            />
            <button
              className="btn"
              style={{ maxWidth: 200, marginTop: 50 }}
              onClick={link}
              type="button"
            >
              link
            </button>
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            <span
              style={{
                position: 'fixed',
                right: '10%',
                fontSize: '20px',
                color: '#3fb990',
              }}
            >
              {trimString(hashTx, 8, 8)}
            </span>
            <Convert
              amount={amount}
              select={select}
              setSelect={setSelect}
              setAmount={setAmount}
              convert={convert}
              time={time}
              setTime={setTime}
            />
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            <div>address</div>
            <input
              value={addressEnergyRoute}
              style={{ width: 550, marginBottom: 20 }}
              onChange={(e) => setAddressEnergyRoute(e.target.value)}
            />
            <div>alias</div>
            <input
              value={alias}
              style={{ width: 550 }}
              onChange={(e) => setAlias(e.target.value)}
            />
            <button
              className="btn"
              style={{ maxWidth: 250, marginTop: 50 }}
              onClick={createEnergyRoute}
              type="button"
            >
              createEnergyRoute
            </button>
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            amount
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 100px 100px',
                marginBottom: 5,
                gridGap: '2px',
              }}
            >
              <input
                value={amount}
                style={{ width: 100, height: 42, textAlign: 'end' }}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Btn
                text="volt"
                checkedSwitch={select === 'volt'}
                onSelect={() => setSelect('volt')}
              />
              <Btn
                text="amper"
                checkedSwitch={select === 'amper'}
                onSelect={() => setSelect('amper')}
              />
            </div>
            <button
              className="btn"
              style={{ maxWidth: 250, marginTop: 50 }}
              onClick={editEnergyRoute}
              type="button"
            >
              editEnergyRoute
            </button>
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            destination
            <input
              value={destination}
              style={{
                width: 550,
                height: 42,
                textAlign: 'end',
                marginBottom: 20,
              }}
              onChange={(e) => setDestination(e.target.value)}
            />
            alias
            <input
              value={aliasRouteAlias}
              style={{ width: 550, height: 42, textAlign: 'end' }}
              onChange={(e) => setAliasRouteAlias(e.target.value)}
            />
            <button
              className="btn"
              style={{ maxWidth: 250, marginTop: 50 }}
              onClick={editEnergyRouteAlias}
              type="button"
            >
              editEnergyRouteAlias
            </button>
            <div style={{ margin: '50px 0', border: '1px solid #fff' }} />
            amount
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 100px 100px 100px',
                marginBottom: 5,
                gridGap: '2px',
              }}
            >
              <input
                value={amountSend}
                style={{ width: 100, height: 42, textAlign: 'end' }}
                onChange={(e) => setAmountSend(e.target.value)}
              />
              <Btn
                text="nick"
                checkedSwitch={select === 'nick'}
                onSelect={() => setSelect('nick')}
              />
              <Btn
                text="volt"
                checkedSwitch={select === 'volt'}
                onSelect={() => setSelect('volt')}
              />
              <Btn
                text="amper"
                checkedSwitch={select === 'amper'}
                onSelect={() => setSelect('amper')}
              />
            </div>
            addressTo
            <input
              value={addressTo}
              style={{
                width: 450,
                marginBottom: 30,
                height: 42,
                textAlign: 'end',
              }}
              onChange={(e) => setAddressTo(e.target.value)}
            />
            <button
              className="btn"
              style={{ maxWidth: 250, marginTop: 50 }}
              onClick={send}
              type="button"
            >
              send
            </button>
          </>
        )}
        {selected === 'queries' && <Queries />}
      </Pane>
    </main>
  );
}

export default TestKeplr;
