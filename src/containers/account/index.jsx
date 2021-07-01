import React from 'react';
import { Tablist, Tab, Pane, Text, ActionBar } from '@cybercongress/gravity';
import { Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import GetLink from './link';
import {
  getBalance,
  getTotalEUL,
  getDistribution,
  getRewards,
  getIpfsHash,
  getAmountATOM,
  getValidatorsInfo,
  getFollows,
  getContent,
  getTweet,
  chekFollow,
  getIndexStats,
  getGraphQLQuery,
  getAvatar,
  getFollowers,
  getTotalRewards,
} from '../../utils/search/utils';
// import Balance fro./mainnce';
import Heroes from './heroes';
import Unbondings from './unbondings';
import { fromBech32, formatNumber, asyncForEach } from '../../utils/utils';
import { Loading, Copy, ContainerCard, Card, Dots } from '../../components';
import ActionBarContainer from './ActionBarContainer';
import GetTxs from './txs';
import Main from './main';
import GetMentions from './mentions';
import TableDiscipline from '../gol/table';
import { getEstimation } from '../../utils/fundingMath';
import { setGolTakeOff } from '../../redux/actions/gol';
import FeedsTab from './feeds';
import FollowsTab from './follows';
import AvatarIpfs from './avatarIpfs';
import CyberLinkCount from './cyberLinkCount';

import { COSMOS, PATTERN_CYBER, TAKEOFF } from '../../utils/config';

const FileType = require('file-type');
const isSvg = require('is-svg');
const img = require('../../image/logo-cyb-v3.svg');

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

const Query = (address) =>
  `query txs {
    takeoff_aggregate(where: {donors: {_eq: "${address}"}}) {
    aggregate {
      sum {
        cybs
      }
    }
  }
}`;

class AccountDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      keywordHash: '',
      addressLocalStor: null,
      loadingAddressInfo: true,
      loadingGoL: true,
      loadingTweews: true,
      validatorAddress: null,
      consensusAddress: null,
      addressLedger: null,
      totalRewards: { rewards: [] },
      following: [],
      followers: [],
      avatar: null,
      dataTweet: [],
      linksCount: 0,
      follow: true,
      tweets: false,
      takeoffDonations: 0,
      community: {
        following: [],
        followers: [],
        friends: [],
      },
      balance: {
        available: 0,
        delegation: 0,
        unbonding: 0,
        rewards: 0,
        total: 0,
      },
      staking: {
        delegations: [],
        unbonding: [],
      },
      selected: 'tweets',
      won: 0,
    };
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps, prevState) {
    const { followers, following } = this.state;
    const { location, match, defaultAccount } = this.props;
    if (prevProps.location.pathname !== location.pathname) {
      this.getBalanseAccount();
      this.chekPathname();
    }
    if (prevProps.match.params.address !== match.params.address) {
      this.clearState();
      this.init();
    }

    if (prevProps.defaultAccount.name !== defaultAccount.name) {
      this.chekAddress();
      this.chekFollowAddress();
    }

    if (
      prevState.followers !== followers ||
      prevState.following !== following
    ) {
      this.getFriends();
    }
  }

  init = async () => {
    await this.setState({
      loadingGoL: true,
      community: {
        following: [],
        followers: [],
        friends: [],
      },
      following: [],
      followers: [],
    });
    await this.chekAddress();
    this.chekFollowAddress();
    this.getBalanseAccount();
    this.chekPathname();
    this.getTxsCosmos();
    this.getFollowing();
    this.getFollowersAddress();
    this.getFeeds();
  };

  clearState = () => {
    this.setState({
      account: '',
      keywordHash: '',
      loadingAddressInfo: true,
      loadingGoL: true,
      validatorAddress: null,
      consensusAddress: null,
      addressLedger: null,
      addressFollows: [],
      avatar: null,
      dataTweet: [],
      linksCount: 0,
      follow: true,
      tweets: false,
      takeoffDonations: TAKEOFF.FINISH_AMOUNT,
      community: {
        following: [],
        followers: [],
        friends: [],
      },
      balance: {
        available: 0,
        delegation: 0,
        unbonding: 0,
        rewards: 0,
        total: 0,
      },
      staking: {
        delegations: [],
        unbonding: [],
      },
      selected: 'tweets',
    });
  };

  chekFollowAddress = async () => {
    const { defaultAccount } = this.props;
    const { match } = this.props;
    const { address: addressProps } = match.params;
    const address = await getIpfsHash(addressProps);

    if (defaultAccount.account !== null && defaultAccount.account.cyber) {
      const response = await chekFollow(
        defaultAccount.account.cyber.bech32,
        address
      );
      if (response !== null && response.txs.length > 0) {
        this.setState({
          follow: false,
          tweets: false,
        });
      }
    }
  };

  chekAddress = async () => {
    const { location, defaultAccount } = this.props;
    const { pathname } = location;
    const { account } = defaultAccount;
    let locationAddress;
    if (
      pathname.match(/cyber[a-zA-Z0-9]{39}/gm) &&
      pathname.match(/cyber[a-zA-Z0-9]{39}/gm).length > 0
    ) {
      locationAddress = pathname.match(/cyber[a-zA-Z0-9]{39}/gm);
    }

    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      const { keys } = account.cyber;
      if (keys !== 'read-only') {
        if (account.cyber.bech32 === locationAddress[0]) {
          this.setState({
            follow: false,
            tweets: true,
            addressLocalStor: { ...account.cyber },
          });
        } else {
          this.setState({
            follow: true,
            tweets: false,
            addressLocalStor: { ...account.cyber },
          });
        }
      } else {
        this.setState({
          addressLocalStor: null,
        });
      }
    } else {
      this.setState({
        addressLocalStor: null,
      });
    }
  };

  getFollowing = async () => {
    const { match } = this.props;
    const { address } = match.params;
    let responseFollows = null;
    const followers = [];
    if (address) {
      const addressHash = await getIpfsHash(address);
      responseFollows = await getFollowers(addressHash);
      // console.log('!!!responseFollows', responseFollows);
    }

    if (responseFollows !== null && responseFollows.txs) {
      responseFollows.txs.forEach(async (item) => {
        const addressFollowers = item.tx.value.msg[0].value.address;
        this.setState((itemState) => ({
          followers: [...itemState.followers, addressFollowers],
        }));
        // followers.push(addressFollowers);
      });
      // this.setState({
      //   followers,
      // });
    }
  };

  getFollowersAddress = async () => {
    const { match } = this.props;
    const { address } = match.params;
    let responseFollows = null;
    const following = [];

    if (address) {
      responseFollows = await getFollows(address);
      // console.log('responseFollows', responseFollows);
    }

    if (responseFollows !== null && responseFollows.txs) {
      responseFollows.txs.forEach(async (item) => {
        const cid = item.tx.value.msg[0].value.links[0].to;
        const addressResolve = await getContent(cid);
        // console.log('addressResolve :>> ', addressResolve);
        if (addressResolve) {
          const addressFollow = addressResolve;
          // console.log('addressResolve :>> ', addressResolve);
          if (addressFollow.match(PATTERN_CYBER)) {
            // following.push(addressFollow);
            this.setState((itemState) => ({
              following: [...itemState.following, addressFollow],
            }));
            // this.setState({
            //   following,
            // });
            // console.log('following', following);
          }
        }
      });
    }
  };

  getFriends = () => {
    const { following, followers } = this.state;

    if (following.length > 0 && followers.length > 0) {
      const followingArr = [];
      const followersArr = followers.slice();
      const friendsArr = [];
      following.forEach((item) => {
        if (followersArr.indexOf(item) !== -1) {
          const index = followersArr.indexOf(item);
          followersArr.splice(index, 1);
          friendsArr.push(item);
        } else {
          followingArr.push(item);
        }
      });
      this.setState({
        community: {
          following: followingArr,
          followers: followersArr,
          friends: friendsArr,
        },
      });
    } else {
      if (following.length > 0 && followers.length === 0) {
        this.setState((itemState) => ({
          community: {
            ...itemState.community,
            following,
          },
        }));
      }
      if (following.length === 0 && followers.length > 0) {
        this.setState((itemState) => ({
          community: {
            ...itemState.community,
            followers,
          },
        }));
      }
    }
  };

  getFeeds = async () => {
    const { match } = this.props;
    const { address } = match.params;
    let responseTweet = null;
    let dataTweet = [];

    responseTweet = await getTweet(address);

    if (responseTweet && responseTweet.txs && responseTweet.txs.length > 0) {
      dataTweet = [...dataTweet, ...responseTweet.txs];
    }

    this.setState({
      dataTweet,
    });
  };

  getTxsCosmos = async () => {
    const { match } = this.props;
    const { address } = match.params;
    const { setGolTakeOffProps } = this.props;
    const addressCosmos = fromBech32(address, 'cosmos');
    let addEstimation = 0;

    const { takeoff_aggregate: takeoffAggregate } = await getGraphQLQuery(
      Query(addressCosmos)
    );
    if (
      takeoffAggregate &&
      takeoffAggregate.aggregate &&
      takeoffAggregate.aggregate.sum
    ) {
      addEstimation = takeoffAggregate.aggregate.sum.cybs;
    }
    setGolTakeOffProps(
      Math.floor(addEstimation * 10 ** 9),
      Math.floor(TAKEOFF.FINISH_ESTIMATION * 10 ** 9)
    );
    this.setState({
      loadingGoL: false,
    });
  };

  chekPathname = () => {
    const { location } = this.props;
    const { pathname } = location;

    if (pathname.match(/txs/gm) && pathname.match(/txs/gm).length > 0) {
      this.select('txs');
    } else if (
      pathname.match(/wallet/gm) &&
      pathname.match(/wallet/gm).length > 0
    ) {
      this.select('wallet');
    } else if (
      pathname.match(/heroes/gm) &&
      pathname.match(/heroes/gm).length > 0
    ) {
      this.select('heroes');
    } else if (pathname.match(/gol/gm) && pathname.match(/gol/gm).length > 0) {
      this.select('gol');
    } else if (
      pathname.match(/cyberlink/gm) &&
      pathname.match(/cyberlink/gm).length > 0
    ) {
      this.select('cyberlink');
    } else if (
      pathname.match(/community/gm) &&
      pathname.match(/community/gm).length > 0
    ) {
      this.select('community');
    } else {
      this.select('tweets');
    }
  };

  getBalanseAccount = async () => {
    const { match } = this.props;
    const { address } = match.params;

    let total;
    const staking = {
      delegations: [],
      unbonding: [],
    };

    const keywordHash = await getIpfsHash(address);
    let consensusAddress = null;
    let validatorAddress = null;

    await this.setState({ account: address, keywordHash });

    const result = await getBalance(address);
    console.log('result', result);

    const dataValidatorAddress = fromBech32(address, 'cybervaloper');
    const dataGetValidatorsInfo = await getValidatorsInfo(dataValidatorAddress);

    if (dataGetValidatorsInfo !== null) {
      consensusAddress = dataGetValidatorsInfo.consensus_pubkey;
      validatorAddress = dataValidatorAddress;
    }

    const resultGetDistribution = await getDistribution(dataValidatorAddress);

    if (resultGetDistribution) {
      result.val_commission = resultGetDistribution.val_commission;
    }
    if (result) {
      total = await getTotalEUL(result);
      if (result.delegations && result.delegations.length > 0) {
        staking.delegations = result.delegations.reduce(
          (obj, item) => ({
            ...obj,
            [item.validator_address]: {
              ...item,
            },
          }),
          {}
        );
        staking.delegations = await this.countReward(
          staking.delegations,
          address
        );
      }
      // console.log('staking', staking);
      if (result.unbonding && result.unbonding.length > 0) {
        const { delegations } = staking;
        result.unbonding.forEach((itemUnb) => {
          if (delegations[itemUnb.validator_address]) {
            delegations[itemUnb.validator_address].entries = itemUnb.entries;
          }
        });
        staking.unbonding = result.unbonding;
      }
    }
    this.setState({
      balance: total,
      validatorAddress,
      consensusAddress,
      staking,
      loadingAddressInfo: false,
    });
  };

  countReward = async (data, address) => {
    const delegations = data;
    const resultTotalRewards = await getTotalRewards(address);
    if (resultTotalRewards !== null) {
      this.setState({
        totalRewards: resultTotalRewards,
      });
      const { rewards } = resultTotalRewards;
      rewards.forEach((item) => {
        const addressValidator = item.validator_address;
        if (Object.hasOwnProperty.call(delegations, addressValidator)) {
          let amountReward = 0;
          const { reward } = item;
          if (reward !== null && reward[0] && reward[0].amount) {
            amountReward = parseFloat(reward[0].amount);
            delegations[addressValidator].reward = Math.floor(amountReward);
          } else {
            delegations[addressValidator].reward = amountReward;
          }
        }
      });
    }
    return delegations;
  };

  select = (selected) => {
    this.setState({ selected });
  };

  render() {
    const {
      account,
      balance,
      staking,
      selected,
      loadingAddressInfo,
      keywordHash,
      addressLedger,
      validatorAddress,
      consensusAddress,
      won,
      loadingGoL,
      takeoffDonations,
      dataTweet,
      follow,
      tweets,
      avatar,
      linksCount,
      following,
      followers,
      addressLocalStor,
      community,
      totalRewards,
    } = this.state;
    // console.log('following', following);

    const { node, mobile, match } = this.props;

    let content;
    if (selected === 'heroes') {
      if (loadingAddressInfo) {
        content = <Dots />;
      } else {
        content = (
          <Route
            path="/network/euler/contract/:address/heroes"
            render={() => <Heroes data={staking} />}
          />
        );
      }
    }
    // console.log('balance', balance);
    if (selected === 'wallet') {
      if (loadingAddressInfo) {
        content = <Dots />;
      } else {
        content = <Main balance={balance} />;
      }
    }

    if (selected === 'cyberlink') {
      content = <GetLink accountUser={account} />;
    }

    if (selected === 'txs') {
      content = (
        <Route
          path="/network/euler/contract/:address/txs"
          render={() => <GetTxs accountUser={account} />}
        />
      );
    }

    if (selected === 'gol') {
      if (loadingGoL) {
        content = <Dots />;
      } else {
        content = (
          <Route
            path="/network/euler/contract/:address/gol"
            render={() => (
              <TableDiscipline
                addressLedger={account}
                validatorAddress={validatorAddress}
                consensusAddress={consensusAddress}
                takeoffDonations={TAKEOFF.FINISH_AMOUNT}
              />
            )}
          />
        );
      }
    }

    if (selected === 'tweets') {
      content = (
        <Route
          path="/network/euler/contract/:address"
          render={() => <FeedsTab data={dataTweet} nodeIpfs={node} />}
        />
      );
      // connect = <FeedsTab data={dataTweet} nodeIpfs={node} />;
    }

    if (selected === 'community') {
      content = (
        <Route
          path="/network/euler/contract/:address/community"
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
              {account} <Copy text={account} />
            </Text>
          </Pane>
          <ContainerCard col={3}>
            <Card
              title="cyberlinks"
              value={<CyberLinkCount accountUser={account} />}
              stylesContainer={{
                width: '100%',
                maxWidth: 'unset',
                margin: 0,
              }}
            />
            <AvatarIpfs addressCyber={account} node={node} />
            <Card
              title="total, EUL"
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
              to={`/network/euler/contract/${account}/heroes`}
            />
            <TabBtn
              text="Wallet"
              isSelected={selected === 'wallet'}
              to={`/network/euler/contract/${account}/wallet`}
            />
            <TabBtn
              text="Cyberlinks"
              isSelected={selected === 'cyberlink'}
              to={`/network/euler/contract/${account}/cyberlink`}
            />
            <TabBtn
              text="Tweets"
              isSelected={selected === 'tweets'}
              to={`/network/euler/contract/${account}`}
            />
            <TabBtn
              text="Community"
              isSelected={selected === 'community'}
              to={`/network/euler/contract/${account}/community`}
            />
            <TabBtn
              text="Txs"
              isSelected={selected === 'txs'}
              to={`/network/euler/contract/${account}/txs`}
            />
            {/* <TabBtn
              text="Mentions"
              isSelected={selected === 'mentions'}
              to={`/network/euler/contract/${account}/mentions`}
            /> */}
            <TabBtn
              text="GoL"
              isSelected={selected === 'gol'}
              to={`/network/euler/contract/${account}/gol`}
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
          (addressLocalStor !== null ? (
            <ActionBarContainer
              updateAddress={() => this.init()}
              addressSend={account}
              type={selected}
              follow={follow}
              tweets={tweets}
              defaultAccount={addressLocalStor}
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
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    node: store.ipfs.ipfs,
    defaultAccount: store.pocket.defaultAccount,
  };
};

const mapDispatchprops = (dispatch) => {
  return {
    setGolTakeOffProps: (amount, prize) =>
      dispatch(setGolTakeOff(amount, prize)),
  };
};

export default connect(mapStateToProps, mapDispatchprops)(AccountDetails);
