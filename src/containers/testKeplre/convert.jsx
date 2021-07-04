import React from 'react';
import { Button } from '@cybercongress/gravity';
import { Btn } from './ui';

const Convert = ({
  amount,
  select,
  setSelect,
  setAmount,
  convert,
  time,
  setTime,
}) => {
  return (
    <>
      amount
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '150px 100px 100px',
          marginBottom: 5,
          gridGap: '2px',
        }}
      >
        <input
          value={amount}
          style={{ width: 100, height: 42, textAlign: 'end' }}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Btn
          text="volt"
          checkedSwitch={select === 'volt'}
          onSelect={() => setSelect('volt')}
        />
        <Btn
          text="amper"
          checkedSwitch={select === 'amper'}
          onSelect={() => setSelect('amper')}
        />
      </div>
      time
      <input
        value={time}
        style={{ width: 100, marginBottom: 30, height: 42, textAlign: 'end' }}
        onChange={(e) => setTime(e.target.value)}
      />
      <Button
        className="btn"
        maxWidth="160px"
        onClick={convert}
        type="button"
        disabled={amount <= 0}
      >
        convert
      </Button>
    </>
  );
};

export default Convert;
