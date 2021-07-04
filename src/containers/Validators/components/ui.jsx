import React from 'react';
import { Pane, Pill, Tooltip, Text } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';

const statusHeroes = {
  BOND_STATUS_UNSPECIFIED: 0,
  /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
  BOND_STATUS_UNBONDED: 1,
  /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
  BOND_STATUS_UNBONDING: 2,
  /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
  BOND_STATUS_BONDED: 3,
};

export const TextTable = ({ children, fontSize, color, display, ...props }) => (
  <Text
    fontSize={`${fontSize || 13}px`}
    color={`${color || '#fff'}`}
    display={`${display || 'inline-flex'}`}
    alignItems="center"
    {...props}
  >
    {children}
  </Text>
);

export const StatusTooltip = ({ status }) => {
  let statusColor;

  switch (statusHeroes[status]) {
    case 1:
      statusColor = 'red';
      break;
    case 2:
      statusColor = 'yellow';
      break;
    case 3:
      statusColor = 'green';
      break;
    default:
      statusColor = 'neutral';
      break;
  }

  return (
    <Pane marginRight={10} display="flex" alignItems="center">
      <Tooltip
        appearance="card"
        content={
          <Pane display="flex" alignItems="center" paddingX={18} paddingY={18}>
            <Text>
              Validator status:&nbsp;
              {statusHeroes[status] === 1 && 'unbonded'}
              {statusHeroes[status] === 2 && 'unbonding'}
              {statusHeroes[status] === 3 && 'bonded'}
            </Text>
          </Pane>
        }
      >
        <Pill
          height={7}
          width={7}
          borderRadius="50%"
          paddingX={4}
          paddingY={0}
          // marginX={20}
          isSolid
          color={statusColor}
        />
      </Tooltip>
    </Pane>
  );
};

export const TextBoard = () => (
  <Pane
    boxShadow="0px 0px 5px #36d6ae"
    paddingX={20}
    paddingY={20}
    marginY={20}
  >
    <Text fontSize="16px" color="#fff">
      If all heroes collectively will be able to gather 100 heroes, and this
      number can last for 10000 blocks, additionally 2 TCYB will be allocated to
      heroes who take part in <Link to="/search/Genesis">Genesis</Link>. If the
      number of heroes will increase to or over 146, additional 3 TCYB will be
      allocated. All rewards in that discipline will be distributed to
      validators per capita.
    </Text>
  </Pane>
);