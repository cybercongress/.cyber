import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TableEv as Table, Pane } from '@cybercongress/gravity';
import { TextTable, Cid, NoItems } from '../../../components';
import { trimString } from '../../../utils/utils';
import AvatarIpfs from '../component/avatarIpfs';

function FollowsTab({ community, node }) {
  const { following, followers, friends } = community;

  const friendsItems = friends.map((item) => {
    return (
      <AvatarIpfs key={item} showAddress node={node} addressCyber={item} />
    );
  });

  const followingItems = following.map((item) => {
    return (
      <AvatarIpfs key={item} showAddress node={node} addressCyber={item} />
    );
  });

  const followersItems = followers.map((item) => {
    return (
      <AvatarIpfs key={item} showAddress node={node} addressCyber={item} />
    );
  });

  return (
    <Pane className="contentItem">
      <Pane marginBottom="20px">
        <Pane marginBottom="10px" fontSize="20px">
          Friends
        </Pane>
        {Object.keys(friendsItems).length > 0 ? (
          <Pane
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(100px, 100px))"
            width="100%"
            gridGap="10px"
          >
            {friendsItems}
          </Pane>
        ) : (
          <NoItems text="No Friends" />
        )}
      </Pane>
      <Pane marginBottom="20px">
        <Pane marginBottom="10px" fontSize="20px">
          Following
        </Pane>
        {Object.keys(followingItems).length > 0 ? (
          <Pane
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(100px, 100px))"
            width="100%"
            gridGap="10px"
          >
            {followingItems}
          </Pane>
        ) : (
          <NoItems text="No Following" />
        )}
      </Pane>
      <Pane>
        <Pane marginBottom="10px" fontSize="20px">
          Followers
        </Pane>
        {Object.keys(followersItems).length > 0 ? (
          <Pane
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(100px, 100px))"
            width="100%"
            gridGap="10px"
          >
            {followersItems}
          </Pane>
        ) : (
          <NoItems text="No Followers" />
        )}
      </Pane>
    </Pane>
  );
  // return <Noitem text="No follows" />;
}

export default FollowsTab;
