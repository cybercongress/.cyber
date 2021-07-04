import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pane } from '@cybercongress/gravity';
import { trimString } from '../../../utils/utils';
import { getAvatar, getAvatarIpfs } from '../../../utils/search/utils';
import { PATTERN_CYBER } from '../../../utils/config';

const img = require('../../../image/logo-cyb-v3.svg');

function AvatarIpfs({
  addressCyber = 'cyber',
  width = '80px',
  height = '80px',
  showAddress,
  node,
}) {
  const [avatar, setAvatar] = useState(null);
  let trimAddress = '';
  if (addressCyber.length > 0) {
    trimAddress = addressCyber.replace(/cyber/g, '');
  }

  useEffect(() => {
    if (addressCyber.match(PATTERN_CYBER)) {
      setAvatar(null);
      feachAvatar(addressCyber);
    }
  }, [addressCyber, node]);

  const feachAvatar = async address => {
    const response = await getAvatar(address);

    if (response !== null && response.total_count === 0) {
      if (node !== null) {
        const cidTo =
          response.txs[response.txs.length - 1].tx.value.msg[0].value.links[0]
            .to;
        const responseImg = await getAvatarIpfs(cidTo, node);
        if (responseImg && responseImg !== null) {
          setAvatar(responseImg);
        }
      }
    }
  };

  return (
    <Link to={`/network/bostrom/contract/${addressCyber}`}>
      <Pane display="flex" flexDirection="column" alignItems="center">
        <img
          style={{
            width,
            height,
            borderRadius: avatar !== null ? '50%' : 'none',
            objectFit: 'cover',
          }}
          alt="img-avatar"
          src={
            avatar !== null ? avatar : `https://robohash.org/${addressCyber}`
          }
        />
        {showAddress && trimAddress.length > 6 && (
          <Pane>{`${trimAddress.slice(0, 3)}...${trimAddress.slice(-3)}`}</Pane>
        )}
      </Pane>
    </Link>
  );
}

export default AvatarIpfs;
