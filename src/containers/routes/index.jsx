import React, { useState, useEffect, useContext } from 'react';
import { coin, coins } from '@cosmjs/launchpad';
import { SigningCyberClient, SigningCyberClientOptions } from 'js-cyber';
import { Tablist, Pane, Tab } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import { AppContext } from '../../context';
import { CYBER } from '../../utils/config';
import { trimString, formatNumber, fromBech32 } from '../../utils/utils';

const Btn = ({ onSelect, checkedSwitch, text, ...props }) => (
  <Tab
    isSelected={checkedSwitch}
    onSelect={onSelect}
    color="#36d6ae"
    boxShadow="0px 0px 10px #36d6ae"
    minWidth="100px"
    marginX={0}
    paddingX={10}
    paddingY={10}
    fontSize="18px"
    height={42}
    {...props}
  >
    {text}
  </Tab>
);

function RoutedEnergy({ defaultAccount }) {
  const { keplr, jsCyber } = useContext(AppContext);
  const [hashTx, setHashTx] = useState('');
  const [addressEnergyRoute, setAddressEnergyRoute] = useState(
    'bostrom1njj4p35u8pggm7nypg3y66rypgvk2atjuudglu'
  );
  const [alias, setAlias] = useState('');
  const [aliasRouteAlias, setAliasRouteAlias] = useState('');
  const [amount, setAmount] = useState(0);
  const [select, setSelect] = useState('volt');
  const [selected, setSelected] = useState('txs');
  const [sourceRoutes, setSourceRoutes] = useState([]);
  const [destinationRoutes, setDestinationRoutes] = useState([]);
  const [destinationRoutedEnergy, setDestinationRoutedEnergy] = useState([]);
  const [sourceRoutedEnergy, setSourceRoutedEnergy] = useState([]);
  const [destination, setDestination] = useState(
    'bostrom1njj4p35u8pggm7nypg3y66rypgvk2atjuudglu'
  );
  const [addressActive, setAddressActive] = useState(null);

  useEffect(() => {
    const { account } = defaultAccount;
    let addressPocket = null;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      const { keys, bech32 } = account.cyber;
      if (keys === 'keplr') {
        addressPocket = bech32;
      }
    }
    setAddressActive(addressPocket);
  }, [defaultAccount.name]);

  useEffect(() => {
    const sourceRouted = async () => {
      if (jsCyber && jsCyber !== null && addressActive !== null) {
        try {
          console.log(`jsCyber`, jsCyber);
          const queryResultsourceRoutes = await jsCyber.sourceRoutes(
            addressActive
          );
          console.log(`queryResultsourceRoutes`, queryResultsourceRoutes)
          setSourceRoutes(queryResultsourceRoutes.routes);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultdestinationRoutes = await jsCyber.destinationRoutes(
            addressActive
          );
          console.log(
            `queryResultdestinationRoutes`,
            queryResultdestinationRoutes
          );
          setDestinationRoutes(queryResultdestinationRoutes.routes);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultdestinationRoutedEnergy = await jsCyber.destinationRoutedEnergy(
            addressActive
          );
          setDestinationRoutedEnergy(queryResultdestinationRoutedEnergy.value);
        } catch (error) {
          console.log(error);
        }
        try {
          const queryResultsourceRoutedEnergy = await jsCyber.sourceRoutedEnergy(
            addressActive
          );
          setSourceRoutedEnergy(queryResultsourceRoutedEnergy.value);
        } catch (error) {
          console.log(error);
        }
      }
    };
    sourceRouted();
  }, [jsCyber, addressActive, hashTx]);

  const createEnergyRoute = async () => {
    if (keplr !== null) {
      const firstAddress = (await keplr.signer.getAccounts())[0].address;
      const response = await keplr.createEnergyRoute(
        firstAddress,
        addressEnergyRoute,
        alias
      );
      console.log(`response`, response)
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
        console.log(`response`, response)
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
        console.log(`response`, response)
        setHashTx(response.transactionHash);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const Txs = () => (

  // );

  const Queries = () => (
    <div>
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
          </>
        )}
        {selected === 'queries' && <Queries />}
      </Pane>
    </main>
  );
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    node: store.ipfs.ipfs,
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(RoutedEnergy);
