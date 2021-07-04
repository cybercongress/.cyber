import React from 'react';
import { Text, TableEv as Table } from '@cybercongress/gravity';

const RowTable = ({ text, cybWon }) => (
  <Table.Row borderBottom="none">
    <Table.TextCell>
      <Text fontSize="16px" color="#fff">
        {text}
      </Text>
    </Table.TextCell>

    <Table.TextCell textAlign="end">
      <Text fontSize="16px" color="#fff">
        {cybWon}
      </Text>
    </Table.TextCell>
  </Table.Row>
);

export default RowTable;
