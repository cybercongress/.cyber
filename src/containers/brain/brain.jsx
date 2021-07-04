/* eslint-disable no-await-in-loop */
import React, { useEffect, useState, useContext } from 'react';
import { Text, Pane, Tablist, ActionBar } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import { Link, Route, useLocation } from 'react-router-dom';
import {
  getBalance,
  getTotalEUL,
  getIpfsHash,
  getRankGrade,
} from '../../utils/search/utils';
import { trimString } from '../../utils/utils';
import { TabBtn } from '../../components';

import { CYBER, TAKEOFF } from '../../utils/config';

import ActionBarContainer from './actionBarContainer';
import {
  GovernmentTab,
  MainTab,
  CybernomicsTab,
  KnowledgeTab,
  AppsTab,
  HelpTab,
  PathTab,
  HallofFameTab,
} from './tabs';
import {
  useGetTweets,
  useGetCybernomics,
  useGetStatisticsCyber,
} from './hooks';
import { AppContext } from '../../context';

import Port from '../port';

import { chekPathname } from './utils/utils';

const search = async (client, hash) => {
  try {
    const responseSearchResults = await client.search(hash);
    console.log(`responseSearchResults`, responseSearchResults);
    return responseSearchResults.result ? responseSearchResults.result : [];
  } catch (error) {
    return [];
  }
};

function Brain({ node, mobile, defaultAccount }) {
  const location = useLocation();
  const { jsCyber } = useContext(AppContext);
  const { cybernomics } = useGetCybernomics();
  const { government, knowledge } = useGetStatisticsCyber();
  const { tweets, loadingTweets } = useGetTweets(defaultAccount, node);
  const [selected, setSelected] = useState('port');
  const [addressActive, setAddressActive] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState({});

  useEffect(() => {
    const { pathname } = location;
    const requere = chekPathname(pathname);
    setSelected(requere);
  }, [location.pathname]);

  useEffect(() => {
    const { account } = defaultAccount;
    let addressPocket = null;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      const { keys, bech32 } = account.cyber;
      addressPocket = {
        bech32,
        keys,
      };
    }
    setAddressActive(addressPocket);
  }, [defaultAccount.name]);

  useEffect(() => {
    const feachData = async () => {
      if (jsCyber !== null) {
        const keywordHash = await getIpfsHash('apps');
        const responseApps = await search(jsCyber, keywordHash);
        if (responseApps.length > 0) {
          const dataApps = responseApps.reduce(
            (obj, item) => ({
              ...obj,
              [item.cid]: {
                cid: item.cid,
                rank: item.rank,
                grade: getRankGrade(item.rank),
                status: node !== null ? 'understandingState' : 'impossibleLoad',
                query: 'apps',
                text: item.cid,
                content: false,
              },
            }),
            {}
          );
          setApps(dataApps);
        }
      }
    };
    feachData();
  }, [jsCyber]);

  useEffect(() => {
    const feachData = async () => {
      setLoading(true);
      if (jsCyber !== null && addressActive !== null) {
        const { bech32 } = addressActive;
        let totalAmount = 0;
        const responseGetBalanceBoot = await jsCyber.getBalance(bech32, 'boot');
        totalAmount += parseFloat(responseGetBalanceBoot.amount);
        const responseGetBalanceSboot = await jsCyber.getBalance(
          bech32,
          'sboot'
        );
        totalAmount += parseFloat(responseGetBalanceSboot.amount);
        setAmount(totalAmount);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    feachData();
  }, [addressActive, jsCyber]);

  let content;

  if (selected === 'port') {
    content = <Route path="/brain" render={() => <Port />} />;
  }

  if (selected === 'feed') {
    content = (
      <MainTab
        tweets={tweets}
        mobile={mobile}
        nodeIpfs={node}
        loadingTwit={loadingTweets}
      />
    );
  }

  if (selected === 'knowledge') {
    const { linksCount, cidsCount, accountsCount, inlfation } = knowledge;
    content = (
      <Route
        path="/brain/knowledge"
        render={() => (
          <KnowledgeTab
            linksCount={parseInt(linksCount, 10)}
            cidsCount={parseInt(cidsCount, 10)}
            accountsCount={parseInt(accountsCount, 10)}
            inlfation={parseFloat(inlfation)}
          />
        )}
      />
    );
  }

  if (selected === 'cybernomics') {
    content = (
      <Route
        path="/brain/cybernomics"
        render={() => <CybernomicsTab data={cybernomics} />}
      />
    );
  }

  if (selected === 'government') {
    const { proposals, communityPool } = government;
    content = (
      <Route
        path="/brain/government"
        render={() => (
          <GovernmentTab proposals={proposals} communityPool={communityPool} />
        )}
      />
    );
  }

  if (selected === 'apps') {
    content = (
      <Route
        path="/brain/apps"
        render={() => <AppsTab mobile={mobile} node={node} data={apps} />}
      />
    );
  }

  if (selected === 'help') {
    content = <Route path="/brain/help" render={() => <HelpTab />} />;
  }

  if (selected === 'gol') {
    content = <Route path="/brain/gol" render={() => <PathTab />} />;
  }

  if (selected === 'halloffame') {
    const { activeValidatorsCount, stakedCyb } = knowledge;
    content = (
      <Route
        path="/brain/halloffame"
        render={() => (
          <HallofFameTab
            stakedCyb={stakedCyb}
            activeValidatorsCount={activeValidatorsCount}
          />
        )}
      />
    );
  }

  return (
    <div>
      <main className="block-body">
        {!loading && amount === 0 && addressActive !== null && (
          <Pane
            boxShadow="0px 0px 5px #36d6ae"
            paddingX={20}
            paddingY={20}
            marginY={20}
          >
            <Text fontSize="16px" color="#fff">
              You do not have control over the brain. You need EUL tokens to let
              Her hear you. If you came from Ethereum or Cosmos you can{' '}
              <Link to="/gift">claim the gift</Link> of the Gods,{' '}
              <Link to="/gol/faucet">get with ETH</Link>
              on faucet or <Link to="/gol/takeoff">donate ATOM</Link> during
              takeoff. Then enjoy the greatest tournament in the universe:{' '}
              <Link to="/gol">Game of Links</Link>.
            </Text>
          </Pane>
        )}

        {addressActive === null && (
          <Pane
            boxShadow="0px 0px 5px #36d6ae"
            paddingX={20}
            paddingY={20}
            marginY={20}
          >
            <Text fontSize="16px" color="#fff">
              Subscribe to someone to make your feed work. Until then, we'll
              show you the project feed. Start by adding a ledger to{' '}
              <Link to="/pocket">your pocket</Link>.
            </Text>
          </Pane>
        )}

        <Tablist
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))"
          gridGap="8px"
          marginTop={25}
        >
          <TabBtn
            text="Knowledge"
            isSelected={selected === 'knowledge'}
            to="/brain/knowledge"
          />
          <TabBtn
            text="Arena"
            isSelected={selected === 'gol'}
            to="/brain/gol"
          />
          <TabBtn
            text="Cybernomics"
            isSelected={selected === 'cybernomics'}
            to="/brain/cybernomics"
          />
          <TabBtn
            text="Feed"
            isSelected={selected === 'feed'}
            to="/brain/feed"
          />
          <TabBtn text="Port" isSelected={selected === 'port'} to="/brain" />
          <TabBtn
            text="Gov"
            isSelected={selected === 'government'}
            to="/brain/government"
          />
          <TabBtn
            text="Hall of Fame"
            isSelected={selected === 'halloffame'}
            to="/brain/halloffame"
          />
          <TabBtn
            text="Apps"
            isSelected={selected === 'apps'}
            to="/brain/apps"
          />
          <TabBtn
            text="Help"
            isSelected={selected === 'help'}
            to="/brain/help"
          />
        </Tablist>
        <Pane
          marginTop={30}
          marginBottom={50}
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
          gridGap="20px"
        >
          {content}
        </Pane>
      </main>
      {!mobile &&
        addressActive !== null &&
        selected !== 'port' &&
        (addressActive.keys !== 'read-only' ? (
          <ActionBarContainer addressPocket={addressActive} />
        ) : (
          <ActionBar>
            <Pane fontSize="18px">
              this {trimString(addressActive.bech32, 8, 6)} cyber address is
              read-only
            </Pane>
          </ActionBar>
        ))}
      {!mobile && selected !== 'port' && addressActive === null && (
        <ActionBar>
          <Pane fontSize="18px">
            add cyber address in your <Link to="/pocket">pocket</Link>
          </Pane>
        </ActionBar>
      )}
    </div>
  );
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    node: store.ipfs.ipfs,
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(Brain);
