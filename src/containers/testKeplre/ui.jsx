import React from 'react';
import { Tab } from '@cybercongress/gravity';

const Btn = ({ onSelect, checkedSwitch, text, ...props }) => (
  <Tab
    isSelected={checkedSwitch}
    onSelect={onSelect}
    color="#36d6ae"
    boxShadow="0px 0px 10px #36d6ae"
    minWidth="100px"
    marginX={0}
    paddingX={10}
    paddingY={10}
    fontSize="18px"
    height={42}
    {...props}
  >
    {text}
  </Tab>
);

export { Btn };
