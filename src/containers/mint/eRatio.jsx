import React from 'react';
import { Icon, Pane } from '@cybercongress/gravity';
import { Tooltip } from '../../components/tooltip/tooltip';

function ERatio({ eRatio }) {
  return (
    <>
      <div
        style={{
          fontSize: '20px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        E-Ratio{' '}
        <Pane marginLeft={5}>
          <Tooltip placement="top" tooltip="text">
            <Icon icon="info-sign" color="#3ab793d4" />
          </Tooltip>
        </Pane>
      </div>
      <div className="svg_wrap">
        <svg viewBox="0 0 40 40">
          <circle className="svg_background" />
          <circle
            className="svg_calc"
            strokeDasharray={`${eRatio * 1.27} 127`}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="svg_value">{eRatio}</div>
      </div>
    </>
  );
}

export default ERatio;
