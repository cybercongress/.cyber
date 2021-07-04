import React, { useEffect, useState } from 'react';
import { Pane, Text } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { PocketCard } from '../components';
import { Copy, Dots, LinkWindow } from '../../../components';
import { formatNumber } from '../../../utils/utils';
import {
  getAvatar,
  getFollows,
  getFollowers,
  getTweet,
  getContent,
  getGraphQLQuery,
  getIpfsHash,
} from '../../../utils/search/utils';
import { setStageTweetActionBar } from '../../../redux/actions/pocket';
import { POCKET, PATTERN_CYBER } from '../../../utils/config';
import AvatarIpfs from '../../account/component/avatarIpfs';

const FileType = require('file-type');
const isSvg = require('is-svg');
const dateFormat = require('dateformat');
const img = require('../../../image/logo-cyb-v3.svg');

const STAGE_ADD_AVATAR = 0;
const STAGE_ADD_FIRST_FOLLOWER = 1;
const STAGE_ADD_FIRST_TWEET = 2;
const STAGE_READY = 3;

const QueryCyberlink = (address, yesterday, time) =>
  `query MyQuery {
    cyberlink_aggregate(where: {_and: [{timestamp: {_gte: "${yesterday}"}}, {timestamp: {_lt: "${time}"}}, {object_from: {_eq: "QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx"}}, {subject: {_in: [${address}]}}]}) {
      aggregate {
        count
      }
    }
  }`;

const useNewsToday = (account) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    const addressFollows = [];

    if (account.match(PATTERN_CYBER)) {
      const feachData = async () => {
        const responseFollows = await getFollows(account);
        if (responseFollows !== null && responseFollows.total_count > 0) {
          for (const item of responseFollows.txs) {
            const cid = item.tx.value.msg[0].value.links[0].to;
            const addressResolve = await getContent(cid);
            if (addressResolve) {
              const addressFollow = addressResolve;
              if (addressFollow.match(PATTERN_CYBER)) {
                addressFollows.push(`"${addressFollow}"`);
              }
            }
          }
          setFollows(addressFollows);
        }
      };
      feachData();
    }
  }, [account]);

  useEffect(() => {
    if (follows.length > 0) {
      feachDataCyberlink(follows);
    }
  }, [follows]);

  const feachDataCyberlink = async (followsProps) => {
    const d = new Date();
    const time = dateFormat(d, 'yyyy-mm-dd');
    const yesterday = dateFormat(
      new Date(Date.parse(d) - 86400000),
      'yyyy-mm-dd'
    );
    const response = await getGraphQLQuery(
      QueryCyberlink(followsProps, yesterday, time)
    );
    if (
      response.cyberlink_aggregate &&
      response.cyberlink_aggregate.aggregate
    ) {
      setCount(response.cyberlink_aggregate.aggregate.count);
      setLoading(false);
    }
  };

  return {
    count,
    loading,
  };
};

function TweetCard({
  account,
  refresh,
  setStageTweetActionBarProps,
  node,
  ...props
}) {
  const { count: countNewsToday, loading: loadingNewsToday } = useNewsToday(
    account
  );
  const [stage, setStage] = useState(STAGE_ADD_AVATAR);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState({
    stage: false,
    loading: true,
  });
  const [myTweet, setMyTweet] = useState({
    count: 0,
    loading: true,
  });
  const [followers, setFollowers] = useState({
    count: 0,
    loading: true,
  });
  const [follows, setFollows] = useState({
    count: 0,
    loading: true,
  });

  useEffect(() => {
    feachData();
  }, [account, refresh]);

  const feachData = async () => {
    getAvatarAccounts(account);
    getFollowsCount(account);
    getMyTweet(account);
    getFollow(account);
  };
  useEffect(() => {
    if (!avatar.loading && !myTweet.loading && !follows.loading) {
      if (avatar.stage && myTweet.count !== 0 && follows.count !== 0) {
        setStage(STAGE_READY);
        setStageTweetActionBarProps(POCKET.STAGE_TWEET_ACTION_BAR.TWEET);
      }
      if (avatar.stage && myTweet.count === 0 && follows.count !== 0) {
        setStage(STAGE_ADD_FIRST_TWEET);
        setStageTweetActionBarProps(POCKET.STAGE_TWEET_ACTION_BAR.TWEET);
      }
      if (avatar.stage && follows.count === 0) {
        setStage(STAGE_ADD_FIRST_FOLLOWER);
        setStageTweetActionBarProps(POCKET.STAGE_TWEET_ACTION_BAR.FOLLOW);
      }
      if (!avatar.stage) {
        setStage(STAGE_ADD_AVATAR);
        setStageTweetActionBarProps(POCKET.STAGE_TWEET_ACTION_BAR.ADD_AVATAR);
      }
      setLoading(false);
    }
  }, [avatar, myTweet, follows]);

  const getAvatarAccounts = async (address) => {
    const response = await getAvatar(address);
    if (response !== null && response.total_count > 0) {
      setAvatar({ stage: true, loading: false });
    } else {
      setAvatar({ stage: false, loading: false });
    }
  };

  const getFollow = async (address) => {
    let count = 0;
    if (address) {
      const addressHash = await getIpfsHash(address);
      const response = await getFollowers(addressHash);
      if (response !== null && response.total_count > 0) {
        count = response.total_count;
      }
      setFollowers({ loading: false, count });
    }
  };

  const getFollowsCount = async (address) => {
    let count = 0;
    const response = await getFollows(address);
    if (response !== null && response.total_count > 0) {
      count = response.total_count;
    }
    setFollows({ loading: false, count });
  };

  const getMyTweet = async (address) => {
    let count = 0;
    const response = await getTweet(address);

    if (response !== null && response.total_count > 0) {
      count = response.total_count;
    }
    setMyTweet({ loading: false, count });
  };

  if (loading) {
    return (
      <PocketCard
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        {...props}
      >
        <Dots />
      </PocketCard>
    );
  }

  if (stage === STAGE_ADD_AVATAR) {
    return (
      <PocketCard display="flex" alignItems="flex-start" {...props}>
        <Text fontSize="16px" color="#fff">
          You can start{' '}
          <Link to={`/network/bostrom/contract/${account}`}>tweet</Link> right
          now. But adding avatar will let others recognize your content
        </Text>
      </PocketCard>
    );
  }

  if (stage === STAGE_ADD_FIRST_FOLLOWER) {
    return (
      <PocketCard
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        {...props}
      >
        <Text fontSize="16px" color="#fff">
          You can follow anybody while discovering content.{' '}
          <Link to="/brain">Feed</Link> will help you stay on track. Try, by
          following cyberCongress blog
        </Text>
      </PocketCard>
    );
  }

  if (stage === STAGE_ADD_FIRST_TWEET) {
    return (
      <PocketCard
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        {...props}
      >
        <Text fontSize="16px" color="#fff">
          Try to say Hello World
        </Text>
      </PocketCard>
    );
  }

  if (stage === STAGE_READY) {
    return (
      <PocketCard display="flex" flexDirection="row" {...props}>
        <Pane display="flex" flex={1}>
          <AvatarIpfs addressCyber={account} node={node} />
        </Pane>
        <Link style={{ margin: '0 10px' }} to="/brain">
          <Pane
            marginX={10}
            alignItems="center"
            display="flex"
            flexDirection="column"
          >
            <Pane fontSize="20px">
              {loadingNewsToday ? (
                <Dots />
              ) : (
                formatNumber(parseFloat(countNewsToday))
              )}
            </Pane>
            <Pane color="#fff">News today</Pane>
          </Pane>
        </Link>
        <Link
          style={{ margin: '0 10px' }}
          to={`/network/bostrom/contract/${account}`}
        >
          <Pane alignItems="center" display="flex" flexDirection="column">
            <Pane fontSize="20px">{formatNumber(myTweet.count)}</Pane>
            <Pane color="#fff">My tweet</Pane>
          </Pane>
        </Link>
        <Link
          style={{ margin: '0 10px' }}
          to={`/network/bostrom/contract/${account}/follows`}
        >
          <Pane
            marginX={10}
            alignItems="center"
            display="flex"
            flexDirection="column"
          >
            <Pane fontSize="20px">{formatNumber(followers.count)}</Pane>
            <Pane color="#fff">Followers</Pane>
          </Pane>
        </Link>
      </PocketCard>
    );
  }

  return null;
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    node: store.ipfs.ipfs,
  };
};

const mapDispatchprops = (dispatch) => {
  return {
    setStageTweetActionBarProps: (stage) =>
      dispatch(setStageTweetActionBar(stage)),
  };
};

export default connect(mapStateToProps, mapDispatchprops)(TweetCard);
