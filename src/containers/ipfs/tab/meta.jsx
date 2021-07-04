import React from 'react';
import { Pane } from '@cybercongress/gravity';
import { ObjectInspector, chromeDark } from '@tableflip/react-inspector';
import { formatCurrency } from '../../../utils/utils';

const objectInspectorTheme = {
  ...chromeDark,
  BASE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '19px',
  TREENODE_FONT_SIZE: '13px',
  TREENODE_LINE_HEIGHT: '19px',
};

const PREFIXES = [
  {
    prefix: 'T',
    power: 1024 * 10 ** 9,
  },
  {
    prefix: 'G',
    power: 1024 * 10 ** 6,
  },
  {
    prefix: 'M',
    power: 1024 * 10 ** 3,
  },
  {
    prefix: 'K',
    power: 1024,
  },
];

const RowItem = ({ text, value }) => (
  <Pane display="flex" marginBottom={10}>
    <Pane width={50}>{text}:</Pane>
    <Pane>{value}</Pane>
  </Pane>
);

function MetaTab({ data, cid }) {
  try {
    return (
      <>
        <Pane
          width="60%"
          marginX="auto"
          marginY={0}
          paddingX={10}
          paddingY={10}
        >
          <RowItem text="CID" value={cid} />
          <RowItem
            text="SIZE"
            value={formatCurrency(data.size, 'B', 3, PREFIXES)}
          />
          <RowItem text="LINKS" value={data.blockSizes.length} />
          <RowItem text="DATA" value="" />
        </Pane>
        <div
          style={{ padding: '20px', width: '60%', margin: '0 auto' }}
          className="objectInspector"
        >
          <ObjectInspector
            showMaxKeys={100}
            data={data}
            theme={objectInspectorTheme}
            // expandPaths={toExpandPathsNotation(localPath)}
          />
        </div>
      </>
    );
  } catch (error) {
    return <NoItems text="oops..." />;
  }
}

export default MetaTab;
