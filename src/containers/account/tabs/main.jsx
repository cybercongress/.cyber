import React from 'react';
import { Pane, Text } from '@cybercongress/gravity';
import { formatNumber } from '../../../utils/utils';
import Dinamics from '../component/dinamics';
import { CYBER } from '../../../utils/config';

const Row = ({ text, number, procent, color }) => (
  <Pane display="flex" alignItems="center" paddingY={7}>
    <Pane display="flex" alignItems="center">
      <Pane
        width="30px"
        height="4px"
        backgroundColor={color}
        marginRight="10px"
      />
      <Pane width={100}>{text}</Pane>
    </Pane>
    <Pane flex="1 1" textAlign="right">
      {number} {CYBER.DENOM_CYBER.toUpperCase()}
    </Pane>
  </Pane>
);

const Main = ({ account, balance, ...props }) => {
  try {
    const { available, delegation, unbonding, rewards, total } = balance;
    return (
      <Pane {...props}>
        <Pane
          display="flex"
          paddingX={20}
          paddingY={20}
          boxShadow="0 0 3px #3ab793"
          borderRadius={4}
          className="container-account-balance"
        >
          {total > 0 && <Dinamics data={balance} />}
          <Pane className="account-balance">
            <Row
              text="Available"
              number={formatNumber(available)}
              procent={formatNumber((available / total) * 100, 3)}
              color="#00e676"
            />
            <Row
              text="Delegated"
              number={formatNumber(delegation)}
              procent={formatNumber((delegation / total) * 100, 3)}
              color="#d500f9"
            />
            <Row
              text="Unbonding"
              number={formatNumber(unbonding)}
              procent={formatNumber((unbonding / total) * 100, 3)}
              color="#00e5ff"
            />
            <Row
              text="Reward"
              number={formatNumber(rewards)}
              procent={formatNumber((rewards / total) * 100, 3)}
              color="#651fff"
            />
            {balance.commission && (
              <Row
                text="Commission"
                number={formatNumber(balance.commission)}
                procent={formatNumber((balance.commission / total) * 100, 3)}
                color="#1de9b6"
              />
            )}
          </Pane>
        </Pane>
      </Pane>
    );
  } catch (error) {
    console.log(`error Main`, error);
    return <div>oops...</div>;
  }
};

export default Main;
