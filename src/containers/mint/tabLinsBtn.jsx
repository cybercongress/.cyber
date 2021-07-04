import React from 'react';
import { Pane, Tablist } from '@cybercongress/gravity';
import { PillNumber, TabBtn } from '../../components';

function TabBtnList({ slotsData = 0, selected }) {
  return (
    <Tablist
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
      gridGap="10px"
      marginBottom={24}
    >
      <TabBtn
        key="Investmint"
        isSelected={selected === 'investmint'}
        to="/mint"
        text={
          <Pane display="flex" alignItems="center">
            <Pane>Investmint</Pane>
          </Pane>
        }
      />
      <TabBtn
        key="Slots"
        isSelected={selected === 'slots'}
        to="/mint/slots"
        text={
          <Pane display="flex" alignItems="center">
            <Pane>Solds</Pane>
            <PillNumber
              marginLeft={5}
              height="20px"
              active={selected === 'slots'}
            >
              {slotsData}
            </PillNumber>
          </Pane>
        }
      />
    </Tablist>
  );
}

export default TabBtnList;
