import bech32 from 'bech32';
import { CYBER } from './config';

const DEFAULT_DECIMAL_DIGITS = 3;
const DEFAULT_CURRENCY = 'GoL';

const ORDER = {
  NONE: 'NONE',
  ASC: 'ASC',
  DESC: 'DESC',
};

const { BECH32_PREFIX_ACC_ADDR_CYBER } = CYBER;

const roundNumber = (num, scale) => {
  if (!`${num}`.includes('e')) {
    return +`${Math.floor(`${num}e+${scale}`)}e-${scale}`;
  }
  const arr = `${num}`.split('e');
  let sig = '';
  if (+arr[1] + scale > 0) {
    sig = '+';
  }
  const i = `${+arr[0]}e${sig}${+arr[1] + scale}`;
  const j = Math.floor(i);
  const k = +`${j}e-${scale}`;
  return k;
};

const formatNumber = (number, toFixed) => {
  let formatted = number;

  if (toFixed) {
    formatted = roundNumber(formatted, toFixed);
    formatted = formatted.toFixed(toFixed + 1);
  }
  // debugger;
  return formatted
    .toLocaleString('en')
    .replace(/(\.\d{0,})0+$/, '$1')
    .replace(/,/g, ' ');
};

const PREFIXES = [
  {
    prefix: 'T',
    power: 10 ** 12,
  },
  {
    prefix: 'G',
    power: 10 ** 9,
  },
  {
    prefix: 'M',
    power: 10 ** 6,
  },
  {
    prefix: 'K',
    power: 10 ** 3,
  },
];

export function formatCurrency(
  value,
  currency = DEFAULT_CURRENCY,
  decimalDigits = DEFAULT_DECIMAL_DIGITS,
  prefixCustom = PREFIXES
) {
  const { prefix = '', power = 1 } =
    prefixCustom.find(({ power }) => value >= power) || {};

  return `${roundNumber(
    value / power,
    decimalDigits
  )} ${prefix}${currency.toLocaleUpperCase()}`;
}

export const formatCurrencyNumber = (
  value,
  currency = DEFAULT_CURRENCY,
  decimalDigits = DEFAULT_DECIMAL_DIGITS,
  prefixCustom = PREFIXES
) => {
  const { prefix = '', power = 1 } =
    prefixCustom.find(({ power }) => value >= power) || {};

  return {
    number: roundNumber(value / power, decimalDigits),
    currency: `${prefix}${currency.toLocaleUpperCase()}`,
  };
};

const getDecimal = (number, toFixed) => {
  const nstring = number.toString();
  const narray = nstring.split('.');
  const result = narray.length > 1 ? narray[1] : '000';
  return result;
};

const run = async (func) => {
  try {
    await func();
  } catch (error) {
    setTimeout(run, 1000, func);
  }
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const timer = (func) => {
  setInterval(func, 1000);
};

const fromBech32 = (operatorAddr, prefix = BECH32_PREFIX_ACC_ADDR_CYBER) => {
  const address = bech32.decode(operatorAddr);
  return bech32.encode(prefix, address.words);
};

const trimString = (address, firstArg, secondArg) => {
  const first = firstArg || 3;
  const second = secondArg || 8;

  if (address && address.length > 11) {
    return `${address.substring(0, first)}...${address.substring(
      address.length - second
    )}`;
  }
  if (address && address.length < 11) {
    return address;
  }
  return '';
};

const msgType = (type) => {
  switch (type) {
    // cyberd
    case 'cyberd/Link':
      return 'Link';

    // bank
    case 'cosmos-sdk/MsgSend':
      return 'Send';
    case 'cosmos-sdk/MsgMultiSend':
      return 'Multi Send';

    // staking
    case 'cosmos-sdk/MsgCreateValidator':
      return 'Create Validator';
    case 'cosmos-sdk/MsgEditValidator':
      return 'Edit Validator';
    case 'cosmos-sdk/MsgDelegate':
      return 'Delegate';
    case 'cosmos-sdk/MsgUndelegate':
      return 'Undelegate';
    case 'cosmos-sdk/MsgBeginRedelegate':
      return 'Redelegate';

    // gov
    case 'cosmos-sdk/MsgSubmitProposal':
      return 'Submit Proposal';
    case 'cosmos-sdk/MsgDeposit':
      return 'Deposit';
    case 'cosmos-sdk/MsgVote':
      return 'Vote';

    // distribution
    case 'cosmos-sdk/MsgWithdrawValidatorCommission':
      return 'Withdraw Commission';
    case 'cosmos-sdk/MsgWithdrawDelegationReward':
      return 'Withdraw Reward';
    case 'cosmos-sdk/MsgModifyWithdrawAddress':
      return 'Modify Withdraw Address';

    // slashing
    case 'cosmos-sdk/MsgUnjail':
      return 'Unjail';

    // ibc
    case 'cosmos-sdk/IBCTransferMsg':
      return 'IBCTransfer';
    case 'cosmos-sdk/IBCReceiveMsg':
      return 'IBC Receive';

    default:
      return { type };
  }
};

const exponentialToDecimal = (exponential) => {
  let decimal = exponential.toString().toLowerCase();
  if (decimal.includes('e+')) {
    const exponentialSplitted = decimal.split('e+');
    let postfix = '';
    for (
      let i = 0;
      i <
      +exponentialSplitted[1] -
        (exponentialSplitted[0].includes('.')
          ? exponentialSplitted[0].split('.')[1].length
          : 0);
      i++
    ) {
      postfix += '0';
    }
    const addCommas = (text) => {
      let j = 3;
      let textLength = text.length;
      while (j < textLength) {
        text = `${text.slice(0, textLength - j)},${text.slice(
          textLength - j,
          textLength
        )}`;
        textLength++;
        j += 3 + 1;
      }
      return text;
    };
    decimal = addCommas(exponentialSplitted[0].replace('.', '') + postfix);
  }
  if (decimal.toLowerCase().includes('e-')) {
    const exponentialSplitted = decimal.split('e-');
    let prefix = '0.';
    for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
      prefix += '0';
    }
    decimal = prefix + exponentialSplitted[0].replace('.', '');
  }
  return decimal;
};

function dhm(t) {
  const cd = 24 * 60 * 60 * 1000;
  const ch = 60 * 60 * 1000;
  let d = Math.floor(t / cd);
  let h = Math.floor((t - d * cd) / ch);
  let m = Math.round((t - d * cd - h * ch) / 60000);
  const pad = function (n, unit) {
    return n < 10 ? `0${n}${unit}` : n;
  };
  if (m === 60) {
    h++;
    m = 0;
  }
  if (h === 24) {
    d++;
    h = 0;
  }
  return [`${d}d`, pad(h, 'h'), pad(m, 'm')].join(':');
}

const sort = (data, sortKey, ordering = ORDER.DESC) => {
  if (ordering === ORDER.NONE) {
    return data;
  }
  if (sortKey === 'timestamp') {
    return data.sort((a, b) => {
      const x = new Date(a[sortKey]);
      const y = new Date(b[sortKey]);
      if (ordering === ORDER.ASC) {
        return x - y;
      }
      return y - x;
    });
  }
  return data.sort((a, b) => {
    const x = a[sortKey];
    const y = b[sortKey];
    if (ordering === ORDER.ASC) {
      return x - y;
    }
    return y - x;
  });
};

const downloadObjectAsJson = (exportObj, exportName) => {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportObj)
  )}`;
  const downloadAnchorNode = document.createElement('a');

  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `${exportName}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const getTimeRemaining = (endtime) => {
  const t = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    total: t,
    days,
    hours,
    minutes,
    seconds,
  };
};

const isMobileTablet = () => {
  let hasTouchScreen = false;
  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ('msMaxTouchPoints' in navigator) {
    hasTouchScreen = navigator.msMaxTouchPoints > 0;
  } else {
    const mQ = window.matchMedia && matchMedia('(pointer:coarse)');
    if (mQ && mQ.media === '(pointer:coarse)') {
      hasTouchScreen = !!mQ.matches;
    } else if ('orientation' in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      const UA = navigator.userAgent;
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
    }
  }
  return hasTouchScreen;
};

const coinDecimals = (number) => {
  return number * 10 ** -18;
};

export {
  run,
  sort,
  roundNumber,
  formatNumber,
  asyncForEach,
  timer,
  getDecimal,
  fromBech32,
  trimString,
  msgType,
  exponentialToDecimal,
  dhm,
  downloadObjectAsJson,
  getTimeRemaining,
  isMobileTablet,
  coinDecimals,
};
