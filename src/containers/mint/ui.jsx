import React from 'react';
import { Tab, Pane, Pill, Text } from '@cybercongress/gravity';
import {
  trimString,
  formatNumber,
  getDecimal,
  formatCurrencyNumber,
} from '../../utils/utils';
import { Dots, Tooltip } from '../../components';

const Btn = ({ onSelect, checkedSwitch, text, disabledBtn, ...props }) => (
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

const FormatNumber = ({
  number,
  fontSizeDecimal,
  fontSizeNumber,
  currency = 'BOOT',
  ...props
}) => {
  const formatNumberCurrency = formatCurrencyNumber(number, currency);
  const decimal = getDecimal(formatNumberCurrency.number);

  return (
    <Pane display="flex" alignItems="baseline" {...props}>
      <Pane display="flex" alignItems="baseline" marginRight={5}>
        <span style={{ fontSize: `${fontSizeNumber || 20}px` }}>
          {formatNumber(Math.floor(formatNumberCurrency.number))}
        </span>
        {decimal > 0 && (
          <>
            .
            <div style={{ fontSize: `${fontSizeDecimal || 14}px` }}>
              {getDecimal(formatNumberCurrency.number)}
            </div>
          </>
        )}
      </Pane>
      <div>{formatNumberCurrency.currency}</div>
    </Pane>
  );
};

const ItemBalance = ({ text, amount }) => {
  return (
    <Pane marginBottom={15}>
      <Pane color="#979797" fontSize="16px">
        {text}
      </Pane>
      {amount === null ? <Dots /> : <FormatNumber number={amount} />}
    </Pane>
  );
};

const StatusTooltip = ({ status }) => {
  let statusColor;

  switch (status) {
    case 'empty':
      statusColor = 'red';
      break;
    case 'closed':
      statusColor = 'yellow';
      break;
    case 'active':
      statusColor = 'green';
      break;
    default:
      statusColor = 'neutral';
      break;
  }

  return (
    <Pane marginRight={10} display="flex" alignItems="center">
      <Tooltip
        placement="right"
        tooltip={
          <Pane display="flex" alignItems="center" paddingX={10} paddingY={10}>
            Slot status:&nbsp; {status}
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

export { Btn, FormatNumber, ItemBalance, StatusTooltip };
