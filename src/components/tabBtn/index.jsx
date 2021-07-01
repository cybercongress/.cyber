import React from 'react';
import { Link } from 'react-router-dom';
import { Tab } from '@cybercongress/gravity';

const TabBtn = ({ key, text, isSelected, onSelect, to, ...props }) => {
  if (to) {
    return (
      <Link to={to}>
        <Tab
          key={key}
          isSelected={isSelected}
          onSelect={onSelect}
          paddingX={10}
          paddingY={20}
          marginX={3}
          borderRadius={5}
          color="#36d6ae"
          boxShadow="0px 0px 5px #36d6ae"
          fontSize="16px"
          whiteSpace="nowrap"
          width="100%"
          {...props}
        >
          {text}
        </Tab>
      </Link>
    );
  }
  return (
    <Tab
      key={key}
      isSelected={isSelected}
      onSelect={onSelect}
      paddingX={10}
      paddingY={20}
      marginX={3}
      borderRadius={5}
      color="#36d6ae"
      boxShadow="0px 0px 5px #36d6ae"
      fontSize="16px"
      whiteSpace="nowrap"
      width="100%"
      {...props}
    >
      {text}
    </Tab>
  );
};

export default TabBtn;
