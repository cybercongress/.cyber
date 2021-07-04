import { useEffect, useState, useRef } from 'react';
import dateFormat from 'dateformat';
import db from '../../../db';
import { getFollows, getTweet, getContent } from '../../../utils/search/utils';
import { CYBER, PATTERN_CYBER } from '../../../utils/config';

const getIndexdDb = async (cid) => {
  let addressResolve = null;
  const dataIndexdDb = await db.table('following').get({ cid });
  if (dataIndexdDb !== undefined) {
    addressResolve = dataIndexdDb.content;
  } else {
    const responseGetContent = await getContent(cid);
    addressResolve = responseGetContent;
    const ipfsContentAddtToInddexdDB = {
      cid,
      content: addressResolve,
    };
    db.table('following')
      .add(ipfsContentAddtToInddexdDB)
      .then((id) => {
        console.log('item :>> ', id);
      });
  }
  return addressResolve;
};

const useGetTweets = (defaultAccount, node = null) => {
  const [tweets, setTweets] = useState({});
  const [tweetData, setTweetData] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(true);
  const [addressActive, setAddressActive] = useState(null);
  const [addressFollowData, setAddressFollowData] = useState({});
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(CYBER.CYBER_WEBSOCKET_URL);
    ws.current.onopen = () => {
      console.log('ws opened');
      ws.current.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          id: '0',
          params: {
            query:
              "tm.event='Tx' AND message.action='link' AND cyberlink.objectFrom='QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx'",
          },
        })
      );
    };
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.result && Object.keys(message.result).length > 0) {
        updateWs(message.result.events);
      }
    };
    ws.current.onclose = () => console.log('ws closed');
    return () => {
      ws.current.close();
    };
  }, []);

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
    setLoadingTweets(true);
    setTweets({});
    setTweetData([]);
    setAddressFollowData({});
    setAddressActive(addressPocket);
  }, [defaultAccount.name]);

  useEffect(() => {
    const feachData = async () => {
      let responseFollows = null;
      if (addressActive !== null && addressActive.bech32.match(PATTERN_CYBER)) {
        responseFollows = await getFollows(addressActive.bech32);
        if (responseFollows !== null && responseFollows.total_count > 0) {
          getFollow(responseFollows);
        }
      }
      if (
        addressActive === null ||
        responseFollows === null ||
        responseFollows.total_count === 0
      ) {
        const responseTwit = await getTweet(CYBER.CYBER_CONGRESS_ADDRESS);
        if (
          responseTwit &&
          responseTwit !== null &&
          responseTwit.total_count > 0
        ) {
          setTweetData((item) => [...item, ...responseTwit.txs]);
        } else {
          setLoadingTweets(false);
        }
      }
    };
    feachData();
  }, [addressActive]);

  useEffect(() => {
    let tweetTemp = {};
    if (Object.keys(tweetData).length > 0) {
      tweetTemp = tweetData.reduce(
        (obj, item) => ({
          ...obj,
          [item.tx.value.msg[0].value.links[0].to]: {
            status: node !== null ? 'understandingState' : 'impossibleLoad',
            text: item.tx.value.msg[0].value.links[0].to,
            address: item.tx.value.msg[0].value.address,
            content: false,
            time: item.timestamp,
          },
        }),
        {}
      );
      setTweets(tweetTemp);
      setLoadingTweets(false);
    }
  }, [tweetData]);

  const getFollow = async (responseFollows) => {
    responseFollows.txs.forEach(async (item) => {
      let addressResolve = null;
      const cid = item.tx.value.msg[0].value.links[0].to;
      const response = await getIndexdDb(cid);
      addressResolve = response;
      if (addressResolve && addressResolve !== null) {
        let addressFollow = null;
        addressFollow = addressResolve;

        if (addressFollow.match(PATTERN_CYBER)) {
          setAddressFollowData((itemState) => ({
            ...itemState,
            [addressFollow]: cid,
          }));
          const responseTwit = await getTweet(addressFollow);
          if (responseTwit && responseTwit.txs && responseTwit.txs.length > 0) {
            setTweetData((items) => [...items, ...responseTwit.txs]);
          }
        }
      }
    });
  };

  const updateWs = async (data) => {
    const subject = data['cybermeta.subject'][0];
    const objectTo = data['cyberlink.objectTo'][0];
    const d = new Date();
    const timestamp = dateFormat(d, 'isoUtcDateTime');
    if (
      Object.keys(addressFollowData).length > 0 &&
      Object.prototype.hasOwnProperty.call(addressFollowData, subject)
    ) {
      setTweets((item) => ({
        [objectTo]: {
          status: node !== null ? 'understandingState' : 'impossibleLoad',
          text: objectTo,
          address: subject,
          content: false,
          time: timestamp,
        },
        ...item,
      }));
    }
  };

  return {
    tweets,
    loadingTweets,
  };
};

export default useGetTweets;
