import React from 'react';
import { Link } from 'react-router-dom';
import { TableEv as Table, Pane } from '@cybercongress/gravity';
import { NoItems, Cid } from '../../../components';
import { trimString } from '../../../utils/utils';
import AvatarIpfs from '../../account/component/avatarIpfs';

function CommunityTab({ data, node }) {
  if (Object.keys(data).length > 0) {
    const rowItem = Object.keys(data)
      .sort((a, b) => data[b].amount - data[a].amount)
      .map(key => (
        <AvatarIpfs key={key} showAddress node={node} addressCyber={key} />
      ));

    return (
      <Pane marginX="auto" width="60%" marginY={25}>
        <Pane fontSize="18px">Community</Pane>
        <Pane
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(100px, 100px))"
          width="100%"
          gridGap="10px"
        >
          {rowItem}
        </Pane>
      </Pane>
    );
  }
  return <NoItems text="No cyberLinks" />;
}

export default CommunityTab;
