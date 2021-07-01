import React from 'react';
import { Pane } from '@cybercongress/gravity';
import { Copy, Dots, Tooltip, LinkWindow } from '../../../components';
import { trimString, formatNumber, getDecimal } from '../../../utils/utils';

const imgLedger = require('../../../image/ledger.svg');
const imgKeplr = require('../../../image/keplr-icon.svg');
const imgMetaMask = require('../../../image/mm-logo.svg');
const imgRead = require('../../../image/duplicate-outline.svg');
const imgHelp = require('../../../image/ionicons_svg_ios-help-circle-outline.svg');
const editOutline = require('../../../image/create-outline.svg');
const editDone = require('../../../image/ionicons_svg_ios-checkmark-circle.svg');
const deleteIcon = require('../../../image/trash-outline.svg');
const imgEth = require('../../../image/Ethereum_logo_2014.svg');
const imgCyber = require('../../../image/blue-circle.png');
const imgCosmos = require('../../../image/cosmos-2.svg');
const imgCyberSigner = require('../../../image/wallet-outline.svg');

const imgData = {
  ledger: imgLedger,
  keplr: imgKeplr,
  MetaMask: imgMetaMask,
  'read-only': imgRead,
  cyber: imgCyber,
  cosmos: imgCosmos,
  eth: imgEth,
  cyberSigner: imgCyberSigner,
};

export const FormatNumber = ({
  number,
  fontSizeDecimal,
  currency,
  ...props
}) => (
  <Pane display="grid" gridTemplateColumns="1fr 45px" gridGap="5px" {...props}>
    <Pane display="flex" alignItems="center">
      <span>{formatNumber(Math.floor(number))}</span>.
      <div style={{ width: 30, fontSize: `${fontSizeDecimal || 14}px` }}>
        {getDecimal(number)}
      </div>
    </Pane>
    <div>{currency}</div>
  </Pane>
);

export const ButtonIcon = ({
  icon,
  onClickButtonIcon,
  width = 25,
  height = 25,
  customClass = '',
  textTooltip = '',
  ...props
}) => {
  return (
    <Pane {...props}>
      {/* //   <Tooltip placement="bottom" tooltip={<Pane>{textTooltip}</Pane>}> */}
      <button
        className={`container-buttonIcon ${customClass}`}
        type="button"
        onClick={onClickButtonIcon}
      >
        <img src={icon} alt="edit" style={{ width, height }} />
      </button>
      {/* //   </Tooltip> */}
    </Pane>
  );
};

export const ContainerAddressInfo = ({ children, ...props }) => (
  <Pane
    width="100%"
    display="grid"
    gridTemplateColumns="1fr 1fr"
    gridGap="5px"
    alignItems="baseline"
    className="cosmos-address-container"
    {...props}
  >
    {children}
  </Pane>
);

const InfoAddress = ({ pk, hdpath, ...props }) => {
  return (
    <Pane {...props}>
      <Tooltip
        placement="bottom"
        tooltip={
          <>
            {pk && <Pane>pk: {trimString(pk, 4, 4)}</Pane>}
            {hdpath && (
              <Pane>
                path:{' '}
                {`${hdpath[0]}/${hdpath[1]}/${hdpath[2]}/${hdpath[3]}/${hdpath[4]}`}
              </Pane>
            )}
          </>
        }
      >
        <img style={{ width: 15, height: 15 }} src={imgHelp} alt="imgHelp" />
      </Tooltip>
    </Pane>
  );
};

export const Address = ({ address, addressLink, onClickDeleteAddress, network }) => (
  <Pane
    className="cosmos-address"
    display="flex"
    marginBottom={5}
    alignItems="center"
  >
    <img
      style={{ width: 18, height: 15, marginRight: 8, objectFit: 'contain' }}
      src={imgData[network]}
      alt="imgAddress"
    />
    <img
      style={{ width: 15, height: 15, marginRight: 8, objectFit: 'contain' }}
      src={imgData[address.keys]}
      alt="imgAddress"
    />
    <Pane width={135}>{addressLink}</Pane>
    <Pane display="flex" className="img-method-addedAddress">
      {address.pk && (
        <InfoAddress marginLeft={5} hdpath={address.path} pk={address.pk} />
      )}
      <Copy style={{ marginLeft: 2 }} text={address.bech32} />
      <ButtonIcon
        marginLeft={5}
        width={16}
        height={16}
        icon={deleteIcon}
        textTooltip="delete address"
        onClickButtonIcon={onClickDeleteAddress}
      />
    </Pane>
  </Pane>
);

export const Vitalik = () => (
  <Pane
    height="23px"
    width="23px"
    boxShadow="0 0 2px 1px #009688"
    borderRadius="50%"
    display="flex"
    alignItems="center"
    justifyContent="space-around"
  >
    <Pane
      height="4px"
      width="7px"
      boxShadow="0 0 2px 1px #009688"
      borderRadius="50%"
      transform="rotate(25deg)"
      marginBottom="3px"
    />
    <Pane
      height="4px"
      width="7px"
      boxShadow="0 0 2px 1px #009688"
      borderRadius="50%"
      transform="rotate(-25deg)"
      marginBottom="3px"
    />
  </Pane>
);

export function PocketCard({ children, select, ...props }) {
  return (
    <Pane
      boxShadow={select ? '0 0 8px 1px #00b0ff' : '0px 0px 5px #36d6ae'}
      className="container-card-pocket cursor-pointer"
      width="100%"
      maxWidth="unset"
      height="auto"
      paddingX={20}
      paddingY={20}
      {...props}
    >
      {children}
    </Pane>
  );
}
