import React from 'react';
import { TableEv as Table, Tooltip } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import { formatNumber, formatCurrency } from '../../../utils/utils';
import { FormatNumber, Dots } from '../../../components';
import { TextTable, StatusTooltip } from './ui';
import { CYBER } from '../../../utils/config';

function TableItem({
  item,
  staking,
  commission,
  selected,
  selectValidators,
  mobile,
  index,
  showJailed,
  loadingSelf,
  loadingBond,
}) {
  return (
    <Table.Row
      borderBottom="none"
      // backgroundColor={index === selectedIndex ? '#ffffff29' : '#000'}
      boxShadow={selected ? '0px 0px 7px #3ab793db' : ''}
      //   className='validators-table-row'
      onSelect={selectValidators}
      isSelectable
    >
      <Table.TextCell
        paddingX={5}
        textAlign="start"
        flexBasis={mobile ? 30 : 60}
        flex="none"
        isNumber
      >
        <TextTable>{index}</TextTable>
      </Table.TextCell>
      <Table.TextCell paddingX={5}>
        <TextTable>
          <StatusTooltip status={item.status} />
          <Link to={`/network/bostrom/hero/${item.operatorAddress}`}>
            {item.description.moniker}
          </Link>
        </TextTable>
      </Table.TextCell>
      <Table.TextCell paddingX={5} flex={0.7} textAlign="end">
        <TextTable>
          <FormatNumber number={commission} fontSizeDecimal={11.5} />
          &ensp;%
        </TextTable>
      </Table.TextCell>
      <Table.TextCell paddingX={5} textAlign="end" isNumber>
        <TextTable>
          <Tooltip
            content={`${formatNumber(parseFloat(item.tokens))} 
                ${CYBER.DENOM_CYBER.toUpperCase()}`}
          >
            <TextTable>
              {formatCurrency(item.tokens, CYBER.DENOM_CYBER.toUpperCase())}
            </TextTable>
          </Tooltip>
        </TextTable>
      </Table.TextCell>
      {!mobile && (
        <>
          <Table.TextCell paddingX={5} textAlign="end" isNumber>
            <TextTable>
              <FormatNumber number={staking} fontSizeDecimal={11.5} />
              &ensp;%
            </TextTable>
          </Table.TextCell>
          <Table.TextCell paddingX={5} textAlign="end">
            <TextTable>
              {loadingSelf ? (
                <Dots />
              ) : (
                <FormatNumber
                  number={item.shares !== undefined ? item.shares : 0}
                  fontSizeDecimal={11.5}
                />
              )}
              &ensp;%
            </TextTable>
          </Table.TextCell>
          <Table.TextCell paddingX={5} textAlign="end" isNumber>
            {loadingBond ? (
              <Dots />
            ) : (
              <Tooltip
                content={`${formatNumber(
                  Math.floor(
                    parseFloat(
                      item.delegation !== undefined ? item.delegation.amount : 0
                    )
                  )
                )} 
                ${CYBER.DENOM_CYBER.toUpperCase()}`}
              >
                <TextTable>
                  {formatCurrency(
                    parseFloat(
                      item.delegation !== undefined ? item.delegation.amount : 0
                    ),
                    CYBER.DENOM_CYBER.toLocaleUpperCase()
                  )}
                </TextTable>
              </Tooltip>
            )}
          </Table.TextCell>
        </>
      )}
      {showJailed && (
        <Table.TextCell paddingX={5} flex={1} textAlign="end" isNumber>
          <TextTable>{item.unbonding_height}</TextTable>
        </Table.TextCell>
      )}
    </Table.Row>
  );
}

export default TableItem;
