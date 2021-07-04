import React from 'react';
import { Pane, Tablist } from '@cybercongress/gravity';
import { PillNumber, TabBtn } from '../../../components';

function TabBtnList({ countHeroes, selected }) {
  return (
    <Tablist
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
      gridGap="10px"
      marginBottom={24}
    >
      <TabBtn
        key="Active"
        isSelected={selected === 'active'}
        to="/heroes"
        text={
          <Pane display="flex" alignItems="center">
            <Pane>Active</Pane>
            <PillNumber
              marginLeft={5}
              height="20px"
              active={selected === 'active'}
            >
              {countHeroes.active}
            </PillNumber>
          </Pane>
        }
      />
      <TabBtn
        key="Jailed"
        isSelected={selected === 'jailed'}
        to="/heroes/jailed"
        text={
          <Pane display="flex" alignItems="center">
            <Pane>Jailed</Pane>
            <PillNumber
              marginLeft={5}
              height="20px"
              active={selected === 'jailed'}
            >
              {countHeroes.jailed}
            </PillNumber>
          </Pane>
        }
      />
    </Tablist>
  );
}

export default TabBtnList;
