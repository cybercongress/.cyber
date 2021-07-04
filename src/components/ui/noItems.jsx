import React from 'react';
import { Pane, Text, Tooltip } from '@cybercongress/gravity';

const noitem = require('../../image/noitem.svg');

const Img = ({ img }) => (
  <img style={{ width: '45px', height: '45px' }} src={img} alt="img" />
);

const NoItems = ({ text }) => (
  <Pane display="flex" paddingY={40} alignItems="center" flexDirection="column">
    <Img img={noitem} />
    <Text fontSize="18px" color="#fff">
      {text}
    </Text>
  </Pane>
);

export default NoItems;
