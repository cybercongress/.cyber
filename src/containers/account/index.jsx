import React, { useContext, useEffect, useState } from 'react';
import { Tablist, Tab, Pane, Text, ActionBar } from '@cybercongress/gravity';
import { Route, Link, useParams, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import GetLink from './tabs/link';
import { getIpfsHash, getTweet, chekFollow } from '../../utils/search/utils';
// import Balance fro./mainnce';
import Heroes from './tabs/heroes';
import { fromBech32, formatNumber, asyncForEach } from '../../utils/utils';
import { Loading, Copy, ContainerCard, Card, Dots } from '../../components';
import ActionBarContainer from './actionBar';
import GetTxs from './tabs/txs';
import Main from './tabs/main';
import TableDiscipline from '../gol/table';
import FeedsTab from './tabs/feeds';
import FollowsTab from './tabs/follows';
import AvatarIpfs from './component/avatarIpfs';
import CyberLinkCount from './component/cyberLinkCount';
import { AppContext } from '../../context';
import { useGetCommunity, useGetBalance, useGetHeroes } from './hooks';
import { CYBER } from '../../utils/config';

const TabBtn = ({ text, isSelected, onSelect, to }) => (
  <Link to={to}>
    <Tab
      key={text}
      isSelected={isSelected}
      onSelect={onSelect}
      paddingX={5}
      paddingY={20}
      marginX={3}
      borderRadius={4}
      color="#36d6ae"
      boxShadow="0px 0px 5px #36d6ae"
      fontSize="16px"
      whiteSpace="nowrap"
      width="100%"
    >
      {text}
    </Tab>
  </Link>
);

function AccountDetails({ node, mobile, defaultAccount }) {
  const { jsCyber } = useContext(AppContext);
  const { address } = useParams();
  const location = useLocation();
  const [updateAddress, setUpdateAddress] = useState(0);
  const { community } = useGetCommunity(address, updateAddress);
  const { balance, loadingBalanceInfo } = useGetBalance(address, updateAddress);
  const { staking, totalRewards, loadingHeroesInfo } = useGetHeroes(
    address,
    updateAddress
  );
  const [selected, setSelected] = useState('tweets');
  const [dataTweet, setDataTweet] = useState([]);
  const [tweets, setTweets] = useState(false);
  const [follow, setFollow] = useState(false);
  const [activeAddress, setActiveAddress] = useState(null);

  useEffect(() => {
    const { pathname } = location;
    if (pathname.match(/txs/gm) && pathname.match(/txs/gm).length > 0) {
      setSelected('txs');
    } else if (
      pathname.match(/wallet/gm) &&
      pathname.match(/wallet/gm).length > 0
    ) {
      setSelected('wallet');
    } else if (
      pathname.match(/heroes/gm) &&
      pathname.match(/heroes/gm).length > 0
    ) {
      setSelected('heroes');
    } else if (pathname.match(/gol/gm) && pathname.match(/gol/gm).length > 0) {
      setSelected('gol');
    } else if (
      pathname.match(/cyberlink/gm) &&
      pathname.match(/cyberlink/gm).length > 0
    ) {
      setSelected('cyberlink');
    } else if (
      pathname.match(/community/gm) &&
      pathname.match(/community/gm).length > 0
    ) {
      setSelected('community');
    } else {
      setSelected('tweets');
    }
  }, [location.pathname]);

  useEffect(() => {
    const getFeeds = async () => {
      let responseTweet = null;
      let dataTweets = [];

      responseTweet = await getTweet(address);
      console.log(`responseTweet`, responseTweet);
      if (responseTweet && responseTweet.txs && responseTweet.total_count > 0) {
        dataTweets = [...dataTweets, ...responseTweet.txs];
      }
      setDataTweet(dataTweets);
    };
    getFeeds();
  }, [address, updateAddress]);

  useEffect(() => {
    const chekFollowAddress = async () => {
      const addressFromIpfs = await getIpfsHash(address);
      if (defaultAccount.account !== null && defaultAccount.account.cyber) {
        const response = await chekFollow(
          defaultAccount.account.cyber.bech32,
          addressFromIpfs
        );
        if (response !== null && response.total_count > 0) {
          setFollow(false);
          setTweets(false);
        }
      }
    };
    chekFollowAddress();
  }, [defaultAccount.name, address]);

  useEffect(() => {
    const chekAddress = async () => {
      const { account } = defaultAccount;
      if (
        account !== null &&
        Object.prototype.hasOwnProperty.call(account, 'cyber')
      ) {
        const { keys } = account.cyber;
        if (keys !== 'read-only') {
          if (account.cyber.bech32 === address) {
            setFollow(false);
            setTweets(true);
            setActiveAddress({ ...account.cyber });
          } else {
            setFollow(true);
            setTweets(false);
            setActiveAddress({ ...account.cyber });
          }
        } else {
          setActiveAddress(null);
        }
      } else {
        setActiveAddress(null);
      }
    };
    chekAddress();
  }, [defaultAccount.name, address]);

  let content;
  if (selected === 'heroes') {
    if (loadingHeroesInfo) {
      content = <Dots />;
    } else {
      content = (
        <Route
          path="/network/bostrom/contract/:address/heroes"
          render={() => <Heroes data={staking} />}
        />
      );
    }
  }
  // console.log('balance', balance);
  if (selected === 'wallet') {
    if (loadingBalanceInfo) {
      content = <Dots />;
    } else {
      content = <Main balance={balance} />;
    }
  }

  if (selected === 'cyberlink') {
    content = <GetLink accountUser={address} />;
  }

  if (selected === 'txs') {
    content = (
      <Route
        path="/network/bostrom/contract/:address/txs"
        render={() => <GetTxs accountUser={address} />}
      />
    );
  }

  if (selected === 'gol') {
    content = (
      <Route
        path="/network/bostrom/contract/:address/gol"
        render={() => <TableDiscipline address={address} />}
      />
    );
  }

  if (selected === 'tweets') {
    content = (
      <Route
        path="/network/bostrom/contract/:address"
        render={() => <FeedsTab data={dataTweet} nodeIpfs={node} />}
      />
    );
    // connect = <FeedsTab data={dataTweet} nodeIpfs={node} />;
  }

  if (selected === 'community') {
    content = (
      <Route
        path="/network/bostrom/contract/:address/community"
        render={() => <FollowsTab node={node} community={community} />}
      />
    );
    // connect = <FollowsTab data={addressFollows} />;
  }

  return (
    <div>
      <main className="block-body">
        <Pane
          marginBottom={20}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="#fff" fontSize="18px">
            {address} <Copy text={address} />
          </Text>
        </Pane>
        <ContainerCard col={3}>
          <Card
            title="cyberlinks"
            value={<CyberLinkCount accountUser={address} />}
            stylesContainer={{
              width: '100%',
              maxWidth: 'unset',
              margin: 0,
            }}
          />
          <AvatarIpfs addressCyber={address} node={node} />
          <Card
            title={`total, ${CYBER.DENOM_CYBER.toUpperCase()}`}
            value={formatNumber(balance.total)}
            stylesContainer={{
              width: '100%',
              maxWidth: 'unset',
              margin: 0,
            }}
          />
        </ContainerCard>
        <Tablist
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(110px, 1fr))"
          gridGap="10px"
        >
          <TabBtn
            text="Heroes"
            isSelected={selected === 'heroes'}
            to={`/network/bostrom/contract/${address}/heroes`}
          />
          <TabBtn
            text="Wallet"
            isSelected={selected === 'wallet'}
            to={`/network/bostrom/contract/${address}/wallet`}
          />
          <TabBtn
            text="Cyberlinks"
            isSelected={selected === 'cyberlink'}
            to={`/network/bostrom/contract/${address}/cyberlink`}
          />
          <TabBtn
            text="Tweets"
            isSelected={selected === 'tweets'}
            to={`/network/bostrom/contract/${address}`}
          />
          <TabBtn
            text="Community"
            isSelected={selected === 'community'}
            to={`/network/bostrom/contract/${address}/community`}
          />
          <TabBtn
            text="Txs"
            isSelected={selected === 'txs'}
            to={`/network/bostrom/contract/${address}/txs`}
          />
          <TabBtn
            text="GoL"
            isSelected={selected === 'gol'}
            to={`/network/bostrom/contract/${address}/gol`}
          />
        </Tablist>
        <Pane
          display="flex"
          marginTop={20}
          marginBottom={50}
          justifyContent="center"
          flexDirection="column"
        >
          {content}
        </Pane>
      </main>
      {!mobile &&
        (activeAddress !== null ? (
          <ActionBarContainer
            updateAddress={() => setUpdateAddress(updateAddress + 1)}
            addressSend={address}
            type={selected}
            follow={follow}
            tweets={tweets}
            defaultAccount={activeAddress}
            totalRewards={totalRewards}
          />
        ) : (
          <ActionBar>
            <Pane>
              <Link
                style={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  display: 'block',
                }}
                className="btn"
                to="/gol"
              >
                add address to your pocket
              </Link>
            </Pane>
          </ActionBar>
        ))}
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

export default connect(mapStateToProps)(AccountDetails);
