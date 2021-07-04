import React, { useEffect, useState } from 'react';
import {
  getFollowers,
  getIpfsHash,
  getFollows,
  getContent,
} from '../../../utils/search/utils';
import { PATTERN_CYBER } from '../../../utils/config';

function useGetCommunity(address, updateAddress) {
  const [community, setCommunity] = useState({
    following: [],
    followers: [],
    friends: [],
  });

  useEffect(() => {
    const getFollowing = async () => {
      let responseFollows = null;
      if (address) {
        const addressHash = await getIpfsHash(address);
        responseFollows = await getFollowers(addressHash);
        // console.log('!!!responseFollows', responseFollows);
      }

      if (responseFollows !== null && responseFollows.txs) {
        responseFollows.txs.forEach(async (item) => {
          const addressFollowers = item.tx.value.msg[0].value.address;
          setCommunity((items) => ({
            ...items,
            followers: { ...items.followers, addressFollowers },
          }));
        });
      }
    };
    getFollowing();
  }, [address]);

  useEffect(() => {
    const getFollowersAddress = async () => {
      let responseFollows = null;

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
              setCommunity((items) => ({
                ...items,
                following: { ...items.following, addressFollow },
              }));
            }
          }
        });
      }
    };
    getFollowersAddress();
  }, [address]);

  useEffect(() => {
    const { following, followers } = community;
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
        setCommunity((itemState) => ({
          ...itemState,
          following,
        }));
      }
      if (following.length === 0 && followers.length > 0) {
        setCommunity((itemState) => ({
          ...itemState,
          followers,
        }));
      }
    }
  }, [community.following, community.followers]);

  return { community, updateAddress };
}

export default useGetCommunity;
