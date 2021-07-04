import React, { useState, useEffect } from 'react';
import LocalizedStrings from 'react-localization';
import { Link } from 'react-router-dom';
import {
  ActionBar,
  Button,
  Input,
  Pane,
  Text,
  Select,
  Textarea,
  FilePicker,
  Battery,
  Icon,
  IconButton,
} from '@cybercongress/gravity';
import TextareaAutosize from 'react-textarea-autosize';
import { Tooltip } from '../tooltip/tooltip';
import { ContainetLedger } from './container';
import { Dots } from '../ui/Dots';
import Account from '../account/account';
import { FormatNumber } from '../formatNumber/formatNumber';
import { LinkWindow } from '../link/link';
import { formatNumber, trimString } from '../../utils/utils';
import ButtonImgText from '../Button/buttonImgText';

import { i18n } from '../../i18n/en';

import { CYBER } from '../../utils/config';

const { DENOM_CYBER, DENOM_CYBER_G, DIVISOR_CYBER_G } = CYBER;

const param = {
  slashing: [
    'signed_blocks_window',
    'min_signed_per_window',
    'downtime_jail_duration',
    'slash_fraction_double_sign',
    'slash_fraction_downtime',
  ],
  bandwidth: [
    'tx_cost',
    'link_msg_cost',
    'non_link_msg_cost',
    'recovery_period',
    'adjust_price_period',
    'base_credit_price',
    'desirable_bandwidth',
    'max_block_bandwidth',
  ],
  distribution: [
    'community_tax',
    'base_proposer_reward',
    'bonus_proposer_reward',
    'withdraw_addr_enabled',
  ],
  mint: [
    'mint_denom',
    'inflation_rate_change',
    'inflation_max',
    'inflation_min',
    'goal_bonded',
    'blocks_per_year',
  ],
  evidence: ['max_evidence_age'],
  auth: [
    'max_memo_characters',
    'tx_sig_limit',
    'tx_size_cost_per_byte',
    'sig_verify_cost_ed25519',
    'sig_verify_cost_secp256k1',
  ],
  rank: ['calculation_period', 'damping_factor', 'tolerance'],
  staking: [
    'unbonding_time',
    'max_validators',
    'max_entries',
    'historical_entries',
    'bond_denom',
  ],
  gov: {
    deposit_params: ['min_deposit', 'max_deposit_period'],
    voting_params: ['voting_period'],
    tally_params: ['quorum', 'threshold', 'veto'],
  },
};

const imgLedger = require('../../image/ledger.svg');
const imgKeplr = require('../../image/keplr-icon.svg');
const imgMetaMask = require('../../image/mm-logo.svg');
const imgRead = require('../../image/duplicate-outline.svg');
const imgEth = require('../../image/Ethereum_logo_2014.svg');
const imgCyber = require('../../image/blue-circle.png');
const imgCosmos = require('../../image/cosmos-2.svg');

const T = new LocalizedStrings(i18n);
const ledger = require('../../image/select-pin-nano2.svg');

const toPascalCase = (str) =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[a-zA-Z0-9]+/g)
    .map((cht) => cht.charAt(0).toUpperCase() + cht.substr(1).toLowerCase())
    .join('');

export const ActionBarContentText = ({ children, ...props }) => (
  <Pane
    display="flex"
    fontSize="20px"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
    marginRight="15px"
    {...props}
  >
    {children}
  </Pane>
);

export const ButtonIcon = ({ img, active, disabled, text, ...props }) => (
  <Pane>
    <Tooltip placement="top" tooltip={<Pane>{text}</Pane>}>
      <button
        type="button"
        style={{
          // boxShadow: active ? '0px 6px 3px -2px #36d6ae' : 'none',
          margin: '0 10px',
          padding: '5px 0',
        }}
        className={`container-buttonIcon ${active ? 'active-icon' : ''}`}
        disabled={disabled}
        {...props}
      >
        <img src={img} alt="img" />
      </button>
    </Tooltip>
  </Pane>
);

export const JsonTransaction = () => (
  <ActionBar>
    <ActionBarContentText>
      Confirm transaction on your Ledger{' '}
      <img
        alt="legder"
        style={{
          paddingTop: '8px',
          marginLeft: '10px',
          width: '150px',
          height: '50px',
        }}
        src={ledger}
      />
    </ActionBarContentText>
  </ActionBar>
);

export const TransactionSubmitted = () => (
  <ActionBar>
    <ActionBarContentText>
      Please wait while we confirm the transaction on the blockchain{' '}
      <Dots big />
    </ActionBarContentText>
  </ActionBar>
);

export const Confirmed = ({ txHash, txHeight, cosmos, onClickBtnCloce }) => (
  <ActionBar>
    <ActionBarContentText display="inline">
      <Pane display="inline">Transaction</Pane>{' '}
      {cosmos ? (
        <LinkWindow to={`https://www.mintscan.io/txs/${txHash}`}>
          {trimString(txHash, 6, 6)}
        </LinkWindow>
      ) : (
        <Link to={`/network/bostrom/tx/${txHash}`}>
          {trimString(txHash, 6, 6)}
        </Link>
      )}{' '}
      <Pane display="inline">
        was included in the block <br /> at height{' '}
        {formatNumber(parseFloat(txHeight))}
      </Pane>
    </ActionBarContentText>
    <Button marginX={10} onClick={onClickBtnCloce}>
      Fuck Google
    </Button>
  </ActionBar>
);

export const TransactionError = ({ onClickBtn, errorMessage }) => (
  <ActionBar>
    <ActionBarContentText>Message Error: {errorMessage}</ActionBarContentText>
    <Button marginX={10} onClick={onClickBtn}>
      {T.actionBar.confirmedTX.continue}
    </Button>
  </ActionBar>
);

export const NoResultState = ({ onClickBtn, valueSearchInput }) => (
  <ActionBar>
    <ActionBarContentText>
      <Text fontSize="18px" color="#fff">
        You are the first one who are searching for{' '}
        <Text fontSize="18px" color="#fff" fontWeight={600}>
          {valueSearchInput}
        </Text>
      </Text>
    </ActionBarContentText>
    <Button onClick={onClickBtn}>Link it using Ledger</Button>
  </ActionBar>
);

export const StartState = ({ targetColor, valueSearchInput, onClickBtn }) => (
  <ActionBar>
    <Pane
      position="absolute"
      bottom={0}
      left="50%"
      marginRight="-50%"
      transform="translate(-50%, -50%)"
    >
      <button
        className="btn-home"
        type="button"
        onClick={onClickBtn}
        style={{
          backgroundColor: `${targetColor ? '#3ab793' : '#000'}`,
          color: `${targetColor ? '#fff' : '#3ab793'}`,
          opacity: `${valueSearchInput.length !== 0 ? 1 : 0}`,
        }}
      >
        {T.actionBar.home.btn}
      </button>

      <a
        style={{
          fontSize: '60px',
          transition: '0.4s',
          display: `${valueSearchInput.length === 0 ? 'block' : 'none'}`,
          opacity: `${valueSearchInput.length === 0 ? 1 : 0}`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          marginRight: '-50%',
          left: '50%',
          bottom: '0px',
          height: '42px',
        }}
        href="https://cybercongress.ai"
        target="_blank"
      >
        ~
      </a>
    </Pane>
  </ActionBar>
);

export const ConnectLadger = ({ connectLedger, onClickConnect }) => (
  <ActionBar>
    <ActionBarContentText display="inline-flex" flexDirection="column">
      <div>
        Connect Ledger, enter pin and open Cosmos app <Dots big />
      </div>
      {connectLedger === false && (
        <Pane fontSize="14px" color="#f00">
          Cosmos app is not open
        </Pane>
      )}
    </ActionBarContentText>
    {connectLedger === false && (
      <Button onClick={onClickConnect}>Connect</Button>
    )}
  </ActionBar>
);

export const CheckAddressInfo = () => (
  <ActionBar>
    <ActionBarContentText>
      {T.actionBar.connectLadger.getDetails} <Dots big />
    </ActionBarContentText>
  </ActionBar>
);

export const StartStageSearchActionBar = ({
  onClickBtn,
  contentHash,
  onChangeInputContentHash,
  showOpenFileDlg,
  inputOpenFileRef,
  onChangeInput,
  onClickClear,
  file,
  textBtn = 'Cyberlink',
  placeholder = 'add keywords, hash or file',
  keys = 'ledger',
}) => {
  return (
    <ActionBar>
      <Pane width="65%" alignItems="flex-end" display="flex">
        <ActionBarContentText>
          <Pane
            display="flex"
            flexDirection="column"
            position="relative"
            width="100%"
          >
            <TextareaAutosize
              value={contentHash}
              style={{
                height: 42,
                width: '100%',
                color: '#fff',
                paddingLeft: '10px',
                borderRadius: '20px',
                textAlign: 'start',
                paddingRight: '35px',
                paddingTop: '10px',
                paddingBottom: '10px',
              }}
              className="resize-none minHeightTextarea"
              onChange={(e) => onChangeInputContentHash(e)}
              placeholder={placeholder}
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = placeholder)}
            />
            <Pane
              position="absolute"
              right="0"
              bottom="0"
              transform="translate(0, -7px)"
            >
              <input
                ref={inputOpenFileRef}
                onChange={() => onChangeInput(inputOpenFileRef)}
                type="file"
                style={{ display: 'none' }}
              />
              <button
                className={
                  file !== null && file !== undefined
                    ? 'btn-add-close'
                    : 'btn-add-file'
                }
                onClick={
                  file !== null && file !== undefined
                    ? onClickClear
                    : showOpenFileDlg
                }
              />
            </Pane>
          </Pane>
        </ActionBarContentText>
        <ButtonImgText
          text={
            <Pane alignItems="center" display="flex">
              {textBtn}{' '}
              <img
                src={imgCyber}
                alt="cyber"
                style={{
                  width: 20,
                  height: 20,
                  marginLeft: '5px',
                  paddingTop: '2px',
                  objectFit: 'contain',
                }}
              />
            </Pane>
          }
          disabled={!contentHash.length}
          onClick={onClickBtn}
          img={keys === 'ledger' ? imgLedger : imgKeplr}
        />
      </Pane>
    </ActionBar>
  );
};

export const GovernanceStartStageActionBar = ({
  valueSelect,
  onChangeSelect,
  onClickBtn,
}) => (
  <ActionBar>
    <ActionBarContentText>
      <select
        style={{ height: 42, width: '60%' }}
        className="select-green"
        value={valueSelect}
        onChange={onChangeSelect}
      >
        <option value="textProposal">Text Proposal</option>
        <option value="communityPool">Community Pool Spend</option>
        <option value="paramChange">Param Change</option>
        <option value="softwareUpgrade">Software Upgrade</option>
      </select>
    </ActionBarContentText>
    <Button onClick={onClickBtn}>Propose</Button>
  </ActionBar>
);

export const GovernanceChangeParam = ({
  valueSelect,
  onChangeSelect,
  onClickBtn,
  onClickBtnAddParam,
  valueParam = '',
  onChangeInputParam,
  changeParam,
  onClickDeleteParam,
  onClickBtnCloce,
  valueTitle,
  onChangeInputTitle,
  onChangeInputDescription,
  valueDescription,
  valueDeposit,
  onChangeInputDeposit,
}) => {
  const item = [];
  let itemChangeParam = [];

  Object.keys(param).map((key) => {
    if (param[key].constructor.name === 'Array') {
      item.push(
        <option
          style={{ color: '#fff', fontSize: '20px' }}
          disabled="disabled"
          key={key}
          value=""
        >
          {key}
        </option>
      );
      const temp = param[key].map((items) => (
        <option
          key={items}
          value={JSON.stringify({
            subspace: key,
            key: toPascalCase(items),
            value: '',
          })}
        >
          {toPascalCase(items)}
        </option>
      ));
      if (temp) {
        item.push(...temp);
      }
    }
  });

  if (changeParam.length > 0) {
    itemChangeParam = changeParam.map((items, index) => (
      <Pane width="100%" display="flex" key={items.key}>
        <Pane flex={1}>{items.key}</Pane>
        <Pane flex={1}>{items.value}</Pane>
        <IconButton
          onClick={() => onClickDeleteParam(index)}
          appearance="minimal"
          height={24}
          icon="trash"
          intent="danger"
        />
      </Pane>
    ));
  }

  return (
    <ActionBar>
      <ContainetLedger
        styles={{ height: 'unset' }}
        logo
        onClickBtnCloce={onClickBtnCloce}
      >
        <Pane display="flex" flexDirection="column" alignItems="center">
          <Text fontSize="25px" lineHeight="40px" color="#fff">
            Parameter Change Proposal
          </Text>
          <Pane marginY={10} width="100%">
            <Text color="#fff">title</Text>
            <input
              value={valueTitle}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputTitle}
              placeholder="title"
            />
          </Pane>
          <Pane width="100%">
            <Text color="#fff">description</Text>
            <textarea
              onChange={onChangeInputDescription}
              value={valueDescription}
              className="resize-none"
            />
          </Pane>
          <Pane marginY={10} width="100%">
            <Text color="#fff">deposit, GEUL</Text>
            <input
              value={valueDeposit}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputDeposit}
              placeholder="amount, GEUL"
            />
          </Pane>
          <Pane marginBottom={10}>
            <Text color="#fff">parameters</Text>
            <Pane display="flex">
              <select
                style={{ height: 42, marginLeft: 0, width: '210px' }}
                className="select-green"
                value={valueSelect}
                onChange={onChangeSelect}
              >
                {item !== undefined && item}
              </select>
              <input
                value={valueParam}
                disabled={valueSelect.length === 0}
                style={{
                  height: 42,
                  width: '200px',
                  marginRight: 15,
                }}
                onChange={onChangeInputParam}
                placeholder="value"
              />
              <Button
                disabled={valueSelect.length === 0 || valueParam.length === 0}
                onClick={onClickBtnAddParam}
              >
                Add
              </Button>
            </Pane>
          </Pane>
          {itemChangeParam.length > 0 && (
            <>
              <Pane marginBottom={10} width="100%" display="flex">
                <Pane flex={1}>Change Param</Pane>
                <Pane flex={1}>Value</Pane>
              </Pane>
              <Pane marginBottom={20} width="100%">
                {itemChangeParam}
              </Pane>
            </>
          )}

          <Button
            disabled={itemChangeParam.length === 0}
            marginTop={25}
            onClick={onClickBtn}
          >
            Create Governance
          </Button>
        </Pane>
      </ContainetLedger>
    </ActionBar>
  );
};

export const GovernanceSoftwareUpgrade = ({
  onClickBtn,
  onClickBtnCloce,
  onChangeInputTitle,
  onChangeInputDescription,
  onChangeInputDeposit,
  valueDescription,
  valueTitle,
  valueDeposit,
  valueHeightUpgrade,
  valueNameUpgrade,
  onChangeInputValueNameUpgrade,
  onChangeInputValueHeightUpgrade,
}) => {
  return (
    <ActionBar>
      <ContainetLedger logo onClickBtnCloce={onClickBtnCloce}>
        <Pane display="flex" flexDirection="column" alignItems="center">
          <Text fontSize="25px" lineHeight="40px" color="#fff">
            Software Upgrade Proposal
          </Text>
          <Pane marginY={10} width="100%">
            <Text color="#fff">title</Text>
            <input
              value={valueTitle}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputTitle}
              placeholder="title"
            />
          </Pane>
          <Pane marginBottom={10} width="100%">
            <Text color="#fff">description</Text>
            <textarea
              onChange={onChangeInputDescription}
              value={valueDescription}
              className="resize-none"
            />
          </Pane>
          <Pane marginY={10} width="100%">
            <Text color="#fff">Upgrade name</Text>
            <input
              value={valueNameUpgrade}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputValueNameUpgrade}
              placeholder="title"
            />
          </Pane>
          <Pane marginY={10} width="100%">
            <Text color="#fff">Upgrade height</Text>
            <input
              value={valueHeightUpgrade}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputValueHeightUpgrade}
              placeholder="title"
            />
          </Pane>
          <Pane width="100%">
            <Text color="#fff">deposit, GEUL</Text>
            <input
              value={valueDeposit}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputDeposit}
              placeholder="amount, GEUL"
            />
          </Pane>
          <Button marginTop={25} onClick={onClickBtn}>
            Create Governance
          </Button>
        </Pane>
      </ContainetLedger>
    </ActionBar>
  );
};

export const TextProposal = ({
  onClickBtn,
  // addrProposer,
  onClickBtnCloce,
  onChangeInputTitle,
  onChangeInputDescription,
  onChangeInputDeposit,
  valueDescription,
  valueTitle,
  valueDeposit,
}) => (
  <ActionBar>
    <ContainetLedger logo onClickBtnCloce={onClickBtnCloce}>
      <Pane display="flex" flexDirection="column" alignItems="center">
        <Text fontSize="25px" lineHeight="40px" color="#fff">
          Text Proposal
        </Text>
        {/* <Text fontSize="18px" lineHeight="40px" color="#fff">
          proposer
        </Text>
        <Text color="#fff">{addrProposer}</Text> */}
        <Pane marginY={10} width="100%">
          <Text color="#fff">title</Text>
          <input
            value={valueTitle}
            style={{
              height: 42,
              width: '100%',
            }}
            onChange={onChangeInputTitle}
            placeholder="title"
          />
        </Pane>
        <Pane marginBottom={10} width="100%">
          <Text color="#fff">description</Text>
          <textarea
            onChange={onChangeInputDescription}
            value={valueDescription}
            className="resize-none"
          />
        </Pane>
        <Pane width="100%">
          <Text color="#fff">deposit, GEUL</Text>
          <input
            value={valueDeposit}
            style={{
              height: 42,
              width: '100%',
            }}
            onChange={onChangeInputDeposit}
            placeholder="amount, GEUL"
          />
        </Pane>
        <Button marginTop={25} onClick={onClickBtn}>
          Create Governance
        </Button>
      </Pane>
    </ContainetLedger>
  </ActionBar>
);

export const ParamChange = ({ valueSelect, onChangeSelect, onClickBtn }) => (
  <ActionBar>
    <ActionBarContentText>
      {/* <select
        style={{ height: 42, width: '60%' }}
        className="select-green"
        value={valueSelect}
        onChange={onChangeSelect}
      >
        <option value="textProposal">Text Proposal</option>
        <option value="paramChange">Param Change</option>
        <option value="communityPool">Community Pool Spend</option>
      </select> */}
    </ActionBarContentText>
    <Button onClick={onClickBtn}>Create Governance</Button>
  </ActionBar>
);

export const CommunityPool = ({
  onClickBtn,
  // addrProposer,
  onClickBtnCloce,
  onChangeInputTitle,
  onChangeInputDescription,
  onChangeInputDeposit,
  valueDescription,
  valueTitle,
  valueDeposit,
  valueAddressRecipient,
  onChangeInputAmountRecipient,
  onChangeInputAddressRecipient,
  valueAmountRecipient,
}) => (
  <ActionBar>
    <ContainetLedger logo onClickBtnCloce={onClickBtnCloce}>
      <Pane display="flex" flexDirection="column" alignItems="center">
        <Text fontSize="25px" lineHeight="40px" color="#fff">
          Community Pool Spend
        </Text>
        {/* <Text fontSize="18px" lineHeight="40px" color="#fff">
          proposer
        </Text>
        <Text color="#fff">{addrProposer}</Text> */}
        <Pane marginY={10} width="100%">
          <Text color="#fff">title</Text>
          <input
            value={valueTitle}
            style={{
              height: 42,
              width: '100%',
            }}
            onChange={onChangeInputTitle}
            placeholder="title"
          />
        </Pane>
        <Pane marginBottom={10} width="100%">
          <Text color="#fff">description</Text>
          <textarea
            onChange={onChangeInputDescription}
            value={valueDescription}
            className="resize-none"
          />
        </Pane>
        <Pane marginBottom={10} width="100%">
          <Text color="#fff">recipient</Text>
          <Pane display="grid" gridTemplateColumns="0.8fr 0.2fr" gridGap="10px">
            <input
              value={valueAddressRecipient}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputAddressRecipient}
              placeholder="address"
            />
            <input
              value={valueAmountRecipient}
              style={{
                height: 42,
                width: '100%',
              }}
              onChange={onChangeInputAmountRecipient}
              placeholder="GEUL"
            />
          </Pane>
        </Pane>
        <Pane width="100%">
          <Text color="#fff">deposit, EUL</Text>
          <input
            value={valueDeposit}
            style={{
              height: 42,
              width: '100%',
            }}
            onChange={onChangeInputDeposit}
            placeholder="amount, GEUL"
          />
        </Pane>
        <Button marginTop={25} onClick={onClickBtn}>
          Create Governance
        </Button>
      </Pane>
    </ContainetLedger>
  </ActionBar>
);

const ContentTooltip = ({ bwRemained, bwMaxValue, linkPrice }) => (
  <Pane
    minWidth={200}
    paddingX={18}
    paddingY={14}
    borderRadius={4}
    backgroundColor="#fff"
  >
    <Pane marginBottom={5}>
      <Text size={300}>
        You have {bwRemained} BP out of {bwMaxValue} BP.
      </Text>
    </Pane>
    <Pane marginBottom={5}>
      <Text size={300}>
        Full regeneration of bandwidth points or BP happens in 24 hours.
      </Text>
    </Pane>
    <Pane display="flex">
      <Text size={300}>Current rate for 1 cyberlink is {linkPrice} BP.</Text>
    </Pane>
  </Pane>
);

export const Cyberlink = ({
  bandwidth,
  onClickBtnCloce,
  address,
  contentHash,
  onClickBtn,
  query,
  disabledBtn,
  linkPrice,
}) => {
  return (
    <ActionBar>
      <ActionBarContentText flexDirection="column">
        <Pane>
          <Pane display="flex">
            <Pane display="flex" alignItems="center" marginRight={10}>
              <Pane fontSize="16px" marginRight={5}>
                address:
              </Pane>
              <Text fontSize="16px" lineHeight="25.888px" color="#fff">
                {address}
              </Text>
            </Pane>
            <Pane display="flex" alignItems="center">
              <Pane fontSize="16px" marginRight={5}>
                bandwidth:
              </Pane>
              <Battery
                style={{ width: '140px', height: '16px' }}
                bwPercent={Math.floor(
                  (bandwidth.remained / bandwidth.max_value) * 100
                )}
                contentTooltip={
                  <ContentTooltip
                    bwRemained={Math.floor(bandwidth.remained)}
                    bwMaxValue={Math.floor(bandwidth.max_value)}
                    linkPrice={Math.floor(linkPrice)}
                  />
                }
              />
            </Pane>
          </Pane>
          <Pane display="flex" flexDirection="column">
            <Text color="#fff" marginRight={10} fontSize="16px">
              {T.actionBar.link.from}{' '}
              {contentHash.length > 12
                ? trimString(contentHash, 6, 6)
                : contentHash}
            </Text>
            <Text color="#fff" fontSize="16px">
              {T.actionBar.link.to} {query}
            </Text>
          </Pane>
        </Pane>
      </ActionBarContentText>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // width: '100%',
        }}
      >
        <button
          type="button"
          className="btn-disabled"
          onClick={onClickBtn}
          style={{ height: 42, maxWidth: '200px' }}
          disabled={disabledBtn}
        >
          {T.actionBar.link.cyberIt}
        </button>
      </div>
    </ActionBar>
  );
};

export const Delegate = ({
  moniker,
  generateTx,
  onChangeInputAmount,
  toSend,
  disabledBtn,
  delegate,
}) => (
  <ActionBar>
    <ActionBarContentText>
      <Text fontSize="16px" color="#fff">
        {T.actionBar.delegate.enterAmount} {DENOM_CYBER_G.toUpperCase()}{' '}
        {delegate
          ? T.actionBar.delegate.delegate
          : T.actionBar.delegate.unDelegateFrom}{' '}
        <Text fontSize="20px" color="#fff" fontWeight={600}>
          {moniker}
        </Text>
      </Text>
      <input
        value={toSend}
        style={{
          height: 42,
          width: '100px',
          marginLeft: 20,
          textAlign: 'end',
        }}
        autoFocus
        onChange={onChangeInputAmount}
        placeholder="amount"
      />
    </ActionBarContentText>
    <button
      type="button"
      className="btn-disabled"
      onClick={generateTx}
      style={{ height: 42, maxWidth: '200px' }}
      disabled={disabledBtn}
    >
      {T.actionBar.delegate.generate}
    </button>
  </ActionBar>
);

export const ReDelegate = ({
  generateTx,
  onChangeInputAmount,
  toSend,
  disabledBtn,
  validators,
  validatorsAll,
  valueSelect,
  onChangeReDelegate,
}) => (
  <ActionBar>
    <ActionBarContentText>
      <Text fontSize="16px" color="#fff">
        Enter the amount{' '}
        <input
          value={toSend}
          autoFocus
          style={{
            height: 32,
            width: '70px',
            margin: '0px 5px',
            textAlign: 'end',
          }}
          onChange={onChangeInputAmount}
          placeholder="amount"
        />{' '}
        {DENOM_CYBER_G.toUpperCase()} restake from{' '}
        <Text fontSize="20px" color="#fff" fontWeight={600}>
          {validators.description.moniker}
        </Text>
      </Text>
      <Text marginX={5} fontSize="16px" color="#fff">
        to:
      </Text>
      <select
        style={{
          width: '120px',
        }}
        value={valueSelect}
        onChange={onChangeReDelegate}
      >
        <option value="">pick hero</option>
        {validatorsAll
          .filter((validator) => validator.status > 0)
          .map((item) => (
            <option
              key={item.operator_address}
              value={item.operator_address}
              style={{
                display:
                  validators.operator_address === item.operator_address
                    ? 'none'
                    : 'block',
              }}
            >
              {item.description.moniker}
            </option>
          ))}
      </select>
    </ActionBarContentText>
    <button
      type="button"
      className="btn-disabled"
      onClick={generateTx}
      style={{ height: 42, maxWidth: '200px' }}
      disabled={disabledBtn}
    >
      {T.actionBar.delegate.generate}
    </button>
  </ActionBar>
);

export const SendLedger = ({
  onClickBtn,
  valueInputAmount,
  valueInputAddressTo,
  onChangeInputAmount,
  onChangeInputAddressTo,
  disabledBtn,
  addressToValid,
  amountSendInputValid,
}) => (
  <ActionBar>
    <Pane display="flex" className="contentItem">
      <ActionBarContentText>
        <Input
          value={valueInputAddressTo}
          height={42}
          marginRight={10}
          width="300px"
          onChange={onChangeInputAddressTo}
          placeholder="cyber address To"
          isInvalid={addressToValid !== null}
          message={addressToValid}
        />

        <Input
          value={valueInputAmount}
          height={42}
          width="24%"
          onChange={onChangeInputAmount}
          placeholder="EUL"
          isInvalid={amountSendInputValid !== null}
          message={amountSendInputValid}
        />
      </ActionBarContentText>
      <button
        type="button"
        className="btn-disabled"
        disabled={disabledBtn}
        onClick={onClickBtn}
      >
        Generate Tx
      </button>
    </Pane>
  </ActionBar>
);

export const SendLedgerAtomTot = ({
  onClickBtn,
  address,
  availableStake,
  onClickBtnCloce,
  disabledBtn,
  amount,
  addressTo,
}) => (
  <ContainetLedger onClickBtnCloce={onClickBtnCloce}>
    <div className="display-flex align-items-center">
      <span className="actionBar-text">{address}</span>
      <button
        className="copy-address-btn"
        onClick={() => {
          navigator.clipboard.writeText(address);
        }}
      />
    </div>

    <div>
      <h3 className="text-align-center">Contribution Details</h3>
      <p className="text-align-center">{T.actionBar.send.wallet}</p>
      <span className="actionBar-text">{availableStake}</span>

      <div style={{ marginBottom: 30, marginTop: 30 }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ marginRight: 10 }}>address to:</span>
          <span>{addressTo}</span>
        </div>
        <div>
          <span style={{ marginRight: 10 }}>contribution amount:</span>
          <span>{amount} ATOMs</span>
        </div>
      </div>
      <div className="text-align-center">
        <button
          type="button"
          className="btn-disabled"
          disabled={disabledBtn}
          onClick={onClickBtn}
        >
          {T.actionBar.send.generate}
        </button>
      </div>
    </div>
  </ContainetLedger>
);

export const ContributeATOMs = ({
  onClickBtn,
  address,
  availableStake,
  valueInput,
  gasUAtom,
  gasAtom,
  onChangeInput,
  onClickBtnCloce,
  onClickMax,
}) => (
  <ContainetLedger onClickBtnCloce={onClickBtnCloce}>
    <div className="display-flex align-items-center">
      <span className="actionBar-text">{address}</span>
      <button
        className="copy-address-btn"
        onClick={() => {
          navigator.clipboard.writeText(address);
        }}
      />
    </div>
    {availableStake > 0 && (
      <div>
        <h3 className="text-align-center">Send Details</h3>
        <p className="text-align-center">Your wallet contains:</p>
        <span className="actionBar-text">{availableStake}</span>
        <div style={{ marginTop: '25px', marginBottom: 10 }}>
          Enter the amount of ATOMs you wish to send to Cyber~Congress:
        </div>
        <div className="text-align-center">
          <input
            value={valueInput}
            style={{ marginRight: 10, textAlign: 'end' }}
            onChange={onChangeInput}
          />
          <button
            type="button"
            className="btn"
            onClick={onClickMax}
            style={{ height: 30 }}
          >
            Max
          </button>
        </div>
        <h6 style={{ margin: 20 }}>
          The fees you will be charged by the network on this transaction will
          {gasUAtom} uatom ( {gasAtom} ATOMs ).
        </h6>
        <div className="text-align-center">
          <button type="button" className="btn" onClick={onClickBtn}>
            Generate my transaction
          </button>
        </div>
      </div>
    )}
  </ContainetLedger>
);

export const SendAmount = ({ onClickBtn, address, onClickBtnCloce }) => (
  <div className="container-action height50 box-shadow-1px">
    <div style={{ position: 'absolute', padding: '0 5px', right: 3, top: 5 }}>
      <span>
        [
        <a
          onClick={onClickBtnCloce}
          style={{ color: 'rgb(225, 225, 225)', cursor: 'pointer' }}
        >
          exit
        </a>
        ]
      </span>
    </div>
    <div className="container-action-content height100">
      <div className="container-send">
        <div>
          <div>
            <span
              className="display-inline-block text-align-center"
              style={{
                marginBottom: 20,
                fontSize: '16px',
              }}
            >
              Send any amount of ATOMs directly to cyber~Congress multisig by
              your using Cosmos wallet
            </span>
            <div
              className="display-flex align-items-center"
              style={{
                justifyContent: 'center',
              }}
            >
              <span className="font-size-16">{address}</span>
              <button
                className="copy-address-btn"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                }}
              />
            </div>
          </div>
        </div>
        <div className="line-action-bar" />
        <div className="display-flex flex-direction-column align-items-center">
          <div className="display-flex flex-direction-column">
            {/* <span className="display-inline-block font-size-20 margin-bottom-10px">
              Ledger
            </span> */}
            <button className="btn" onClick={onClickBtn}>
              Send with Ledger
            </button>
          </div>
        </div>
      </div>
      {/* <span className="actionBar-text">
          You can send any amount of ATOMs to cyber•Congress multisig
          cosmos287fhhlgflsef
        </span>
      </div>
      <button className="btn" onClick={onClickBtn}>
        Track Contribution
      </button> */}
    </div>
  </div>
);

export const RewardsDelegators = ({
  data,
  onClickBtn,
  onClickBtnCloce,
  disabledBtn,
}) => {
  console.log('data :>> ', data);
  const itemReward = data.rewards.map((item) => {
    if (item.reward !== null) {
      return (
        <Pane
          key={item.validator_address}
          display="flex"
          justifyContent="space-between"
        >
          <Account address={item.validator_address} />
          <Pane>
            {formatNumber(Math.floor(item.reward[0].amount))}{' '}
            {CYBER.DENOM_CYBER.toUpperCase()}
          </Pane>
        </Pane>
      );
    }
  });
  return (
    <ContainetLedger onClickBtnCloce={onClickBtnCloce}>
      <Pane fontSize="20px" marginBottom={20}>
        Total rewards: {formatNumber(Math.floor(data.total[0].amount))}{' '}
        {CYBER.DENOM_CYBER.toUpperCase()}
      </Pane>
      Rewards:
      <Pane marginTop={10} marginBottom={30}>
        <Pane marginBottom={5} display="flex" justifyContent="space-between">
          <Pane>Address</Pane>
          <Pane>Amount</Pane>
        </Pane>
        <Pane>{itemReward}</Pane>
      </Pane>
      <div className="text-align-center">
        <button
          type="button"
          className="btn-disabled"
          disabled={disabledBtn}
          onClick={onClickBtn}
        >
          {T.actionBar.send.generate}
        </button>
      </div>
    </ContainetLedger>
  );
};

export const ConnectAddress = ({
  selectMethodFunc,
  selectMethod,
  selectNetworkFunc,
  selectNetwork,
  connctAddress,
  web3,
  selectAccount,
  keplr,
}) => {
  const [cyberNetwork, setCyberNetwork] = useState(true);
  const [cosmosNetwork, setCosmosNetwork] = useState(true);
  const [ethNetwork, setEthrNetwork] = useState(true);

  useEffect(() => {
    if (selectAccount && selectAccount !== null) {
      if (selectAccount.cyber) {
        setCyberNetwork(false);
      } else {
        setCyberNetwork(true);
      }
      if (selectAccount.cosmos) {
        setCosmosNetwork(false);
      } else {
        setCosmosNetwork(true);
      }
      if (selectAccount.eth) {
        setEthrNetwork(false);
      } else {
        setEthrNetwork(true);
      }
    } else {
      setEthrNetwork(true);
      setCosmosNetwork(true);
      setCyberNetwork(true);
    }
  }, [selectAccount]);

  return (
    <ActionBar>
      <ActionBarContentText>
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex={1}
        >
          {(cyberNetwork || cosmosNetwork) && (
            <>
              <ButtonIcon
                onClick={() => selectMethodFunc('ledger')}
                active={selectMethod === 'ledger'}
                img={imgLedger}
                text="ledger"
              />
              {keplr && (
                <ButtonIcon
                  onClick={() => selectMethodFunc('keplr')}
                  active={selectMethod === 'keplr'}
                  img={imgKeplr}
                  text="keplr"
                />
              )}
            </>
          )}
          {web3 && web3 !== null && ethNetwork && (
            <ButtonIcon
              onClick={() => selectMethodFunc('MetaMask')}
              active={selectMethod === 'MetaMask'}
              img={imgMetaMask}
              text="metaMask"
            />
          )}
          {(cyberNetwork || cosmosNetwork) && (
            <ButtonIcon
              onClick={() => selectMethodFunc('read-only')}
              active={selectMethod === 'read-only'}
              img={imgRead}
              text="read-only"
            />
          )}
        </Pane>
        <span style={{ fontSize: '18px' }}>in</span>
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex={1}
        >
          {selectMethod === 'MetaMask' && (
            <ButtonIcon
              img={imgEth}
              text="eth"
              onClick={() => selectNetworkFunc('eth')}
              active={selectNetwork === 'eth'}
            />
          )}
          {selectMethod !== 'MetaMask' && (
            <>
              {cyberNetwork && (
                <ButtonIcon
                  onClick={() => selectNetworkFunc('cyber')}
                  active={selectNetwork === 'cyber'}
                  img={imgCyber}
                  text="cyber"
                />
              )}
              {cosmosNetwork && (
                <ButtonIcon
                  img={imgCosmos}
                  text="cosmos"
                  onClick={() => selectNetworkFunc('cosmos')}
                  active={selectNetwork === 'cosmos'}
                />
              )}
            </>
          )}
        </Pane>
      </ActionBarContentText>
      <Button
        disabled={selectNetwork === '' || selectMethod === ''}
        onClick={() => connctAddress()}
      >
        connect
      </Button>
    </ActionBar>
  );
};

export const SetHdpath = ({
  hdpath,
  onChangeAccount,
  onChangeIndex,
  addressLedger,
  hdPathError,
  addAddressLedger,
}) => {
  return (
    <ActionBar>
      <ActionBarContentText>
        <Pane>
          <Pane
            display="flex"
            alignItems="center"
            flex={1}
            justifyContent="center"
          >
            <Text color="#fff" fontSize="20px">
              HD derivation path: {hdpath[0]}/{hdpath[1]}/
            </Text>
            <Input
              value={hdpath[2]}
              onChange={(e) => onChangeAccount(e)}
              width="50px"
              height={42}
              marginLeft={3}
              marginRight={3}
              fontSize="20px"
              textAlign="end"
            />
            <Text color="#fff" fontSize="20px">
              /{hdpath[3]}/
            </Text>
            <Input
              value={hdpath[4]}
              onChange={(e) => onChangeIndex(e)}
              width="50px"
              marginLeft={3}
              height={42}
              fontSize="20px"
              textAlign="end"
            />
          </Pane>
          {addressLedger !== null ? (
            <Pane>{trimString(addressLedger.bech32, 10, 3)}</Pane>
          ) : (
            <Dots />
          )}
        </Pane>
      </ActionBarContentText>
      <Button disabled={hdPathError} onClick={() => addAddressLedger()}>
        Apply
      </Button>
    </ActionBar>
  );
};
