import axios from 'axios';
import { DAGNode, util as DAGUtil } from 'ipld-dag-pb';
import { CYBER, TAKEOFF, COSMOS } from '../config';

const all = require('it-all');
const uint8ArrayConcat = require('uint8arrays/concat');
const uint8ArrayToAsciiString = require('uint8arrays/to-string');

const {
  CYBER_NODE_URL_API,
  CYBER_NODE_URL_LCD,
  BECH32_PREFIX_ACC_ADDR_CYBERVALOPER,
} = CYBER;

const SEARCH_RESULT_TIMEOUT_MS = 10000;

const IPFS = require('ipfs-api');
const isSvg = require('is-svg');

const Unixfs = require('ipfs-unixfs');
const FileType = require('file-type');

let ipfsApi;

const getIpfsConfig = async () => {
  if (window.getIpfsConfig) {
    return window.getIpfsConfig();
  }

  return {
    host: 'localhost',
    port: 5001,
    protocol: 'http',
  };
};

export const initIpfs = async () => {
  if (ipfsApi) {
    return;
  }

  const ipfsConfig = await getIpfsConfig();

  ipfsApi = new IPFS(ipfsConfig);
};

const getIpfs = async () => {
  if (ipfsApi) {
    return ipfsApi;
  }

  await initIpfs();

  return ipfsApi;
};

export const getContentByCid = async (
  cid,
  ipfs,
  timeout = SEARCH_RESULT_TIMEOUT_MS
) => {
  let timerId;
  const timeoutPromise = () =>
    new Promise((reject) => {
      timerId = setTimeout(reject, timeout);
    });

  const ipfsGetPromise = () =>
    new Promise((resolve, reject) => {
      ipfs.dag
        .get(cid, {
          localResolve: false,
        })
        .then((dagGet) => {
          console.log('dagGet', dagGet);
          clearTimeout(timerId);
          const { value: dagGetValue } = dagGet;
          console.log(dagGetValue);
          if (
            dagGetValue &&
            dagGetValue.size &&
            dagGetValue.size <= 1.5 * 10 ** 6
          ) {
            let mime;
            ipfs.cat(cid).then((dataCat) => {
              console.log('dataCat', dataCat);
              const buf = dataCat;
              const bufs = [];
              bufs.push(buf);
              const data = Buffer.concat(bufs);
              FileType.fromBuffer(data).then((dataFileType) => {
                let fileType;
                if (dataFileType !== undefined) {
                  mime = dataFileType.mime;
                  if (mime.indexOf('image') !== -1) {
                    const dataBase64 = data.toString('base64');
                    fileType = `data:${mime};base64,${dataBase64}`;
                    resolve({
                      status: 'downloaded',
                      content: fileType,
                      text: false,
                    });
                  } else if (mime.indexOf('application/pdf') !== -1) {
                    const dataBase64 = data.toString('base64');
                    fileType = `data:${mime};base64,${dataBase64}`;
                    resolve({
                      status: 'downloaded',
                      content: fileType,
                      text: false,
                    });
                  } else {
                    resolve({
                      status: 'downloaded',
                      content: false,
                      text: `${cid} ${mime}`,
                    });
                  }
                } else {
                  const dataBase64 = data.toString();
                  let text;
                  if (isSvg(dataBase64)) {
                    resolve({
                      status: 'downloaded',
                      content: false,
                      text: dataBase64,
                    });
                  } else {
                    if (dataBase64.length > 300) {
                      text = `${dataBase64.slice(0, 300)}...`;
                    } else {
                      text = dataBase64;
                    }
                    resolve({
                      status: 'downloaded',
                      content: false,
                      text,
                    });
                  }
                }
              });
            });
          } else {
            resolve({
              status: 'availableDownload',
              content: false,
              text: cid,
            });
          }
        });
    });
  return Promise.race([timeoutPromise(), ipfsGetPromise()]);
};

export const formatNumber = (number, toFixed) => {
  let formatted = +number;

  if (toFixed) {
    formatted = +formatted.toFixed(toFixed);
  }
  // debugger;
  return formatted.toLocaleString('en').replace(/,/g, ' ');
};

export const getPin = async (node, content) => {
  let cid;
  if (node) {
    if (typeof content === 'string') {
      cid = await node.add(new Buffer(content), { pin: true });
    } else {
      cid = await node.add(content, { pin: true });
    }
    console.warn('content', content, 'cid', cid);
    return cid.path;
  }
};

export const getIpfsHash = (string) =>
  new Promise((resolve, reject) => {
    const unixFsFile = new Unixfs('file', Buffer.from(string));

    const buffer = unixFsFile.marshal();
    DAGNode.create(buffer, (err, dagNode) => {
      if (err) {
        reject(new Error('Cannot create ipfs DAGNode'));
      }

      DAGUtil.cid(dagNode, (error, cid) => {
        resolve(cid.toBaseEncodedString());
      });
    });
  });

export const getString = (string) =>
  new Promise((resolve, reject) => {
    const unixFsFile = new Unixfs('file', Buffer.from(string));

    const buffer = unixFsFile.marshal();
    console.log(buffer);
    DAGNode.create(buffer, (err, dagNode) => {
      if (err) {
        reject(new Error('Cannot create ipfs DAGNode'));
      }

      DAGUtil.cid(dagNode, (error, cid) => {
        resolve(cid.toV1());
      });
    });
  });

export const search = async (keywordHash) =>
  axios({
    method: 'get',
    url: `${CYBER_NODE_URL_LCD}/rank/search?cid=${keywordHash}&page=0&perPage=1000`,
  }).then((response) => {
    console.log('RESPONSE', response.data.result.result);
    return response.data.result.result ? response.data.result.result : [];
  });

export const getRankGrade = (rank) => {
  let from;
  let to;
  let value;

  if (rank > 0.00000276) {
    from = 0.00000276;
    to = 0.01;
    value = 1;
  } else if (rank > 0.00000254879356777504 && rank <= 0.00000276) {
    from = 0.00000254879356777504;
    to = 0.00000276;
    value = 2;
  } else if (rank > 0.00000233758713555007 && rank <= 0.00000254879356777504) {
    from = 0.00000233758713555007;
    to = 0.00000254879356777504;
    value = 3;
  } else if (rank > 0.00000191517427110014 && rank <= 0.00000233758713555007) {
    from = 0.00000191517427110014;
    to = 0.00000233758713555007;
    value = 4;
  } else if (rank > 0.00000128155497442525 && rank <= 0.00000191517427110014) {
    from = 0.00000128155497442525;
    to = 0.00000191517427110014;
    value = 5;
  } else if (rank > 0.00000022552281330043 && rank <= 0.00000128155497442525) {
    from = 0.00000022552281330043;
    to = 0.00000128155497442525;
    value = 6;
  } else if (rank > 0 && rank <= 0.00000022552281330043) {
    from = 0;
    to = 0.00000022552281330043;
    value = 7;
  } else {
    from = 'n/a';
    to = 'n/a';
    value = 'n/a';
  }

  return {
    from,
    to,
    value,
  };
};

export const getStatistics = () =>
  new Promise((resolve) => {
    const indexStatsPromise = axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/index_stats`,
    }).then((response) => response.data.result);

    const stakingPromise = axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/staking/pool`,
    }).then((response) => response.data.result);

    const bandwidthPricePromise = axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/current_bandwidth_price`,
    }).then((response) => response.data.result);

    const latestBlockPromise = axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/block`,
    }).then((response) => response.data.result);

    const supplyTotalPropsise = axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/supply/total`,
    }).then((response) => response.data.result);

    Promise.all([
      indexStatsPromise,
      stakingPromise,
      bandwidthPricePromise,
      latestBlockPromise,
      supplyTotalPropsise,
    ]).then(
      ([indexStats, staking, bandwidthPrice, latestBlock, supplyTotal]) => {
        const response = {
          ...indexStats,
          bondedTokens: staking.bonded_tokens,
          bandwidthPrice: bandwidthPrice.price,
          txCount: 0,
          supplyTotal: supplyTotal[0].amount,
        };

        resolve(response);
      }
    );
  });

export const getValidators = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/validators`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getValidatorsUnbonding = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/validators?status=BOND_STATUS_UNBONDING`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getValidatorsUnbonded = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/validators?status=BOND_STATUS_UNBONDED`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAllValidators = async () => {
  const allValidators = [];

  const responseGetValidators = await getValidators();
  if (responseGetValidators !== null) {
    allValidators.push(...responseGetValidators);
  }
  const responseGetValidatorsUnbonding = await getValidatorsUnbonding();
  if (responseGetValidatorsUnbonding !== null) {
    allValidators.push(...responseGetValidatorsUnbonding);
  }
  const responseGetValidatorsUnbonded = await getValidatorsUnbonded();
  if (responseGetValidatorsUnbonded !== null) {
    allValidators.push(...responseGetValidatorsUnbonded);
  }

  return allValidators;
};

export const selfDelegationShares = async (
  delegatorAddress,
  operatorAddress
) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`,
    });
    return response.data.result.balance.amount;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const stakingPool = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/pool`,
    });

    return response.data.result;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const getAccountBandwidth = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/bandwidth/account/${address}`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const statusNode = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/status`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getRelevance = (page = 0, perPage = 50) =>
  new Promise((resolve) =>
    axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/top?page=${page}&perPage=${perPage}`,
    })
      .then((response) => {
        resolve(response.data.result);
      })
      .catch((e) => {})
  );

export const getBalance = async (address, node) => {
  try {
    const availablePromise = await axios({
      method: 'get',
      url: `${node || CYBER_NODE_URL_LCD}/bank/balances/${address}`,
    });

    const delegationsPromise = await axios({
      method: 'get',
      url: `${
        node || CYBER_NODE_URL_LCD
      }/staking/delegators/${address}/delegations`,
    });

    const unbondingPromise = await axios({
      method: 'get',
      url: `${
        node || CYBER_NODE_URL_LCD
      }/staking/delegators/${address}/unbonding_delegations`,
    });

    const rewardsPropsise = await axios({
      method: 'get',
      url: `${
        node || CYBER_NODE_URL_LCD
      }/distribution/delegators/${address}/rewards`,
    });

    const response = {
      available: availablePromise.data.result[0],
      delegations: delegationsPromise.data.result,
      unbonding: unbondingPromise.data.result,
      rewards:
        rewardsPropsise.data.result.total !== null
          ? rewardsPropsise.data.result.total[0]
          : 0,
    };

    return response;
  } catch (e) {
    console.log(e);
    return {
      available: 0,
      delegations: 0,
      unbonding: 0,
      rewards: 0,
    };
  }
};

export const getTotalEUL = (data) => {
  const balance = {
    available: 0,
    delegation: 0,
    unbonding: 0,
    rewards: 0,
    total: 0,
  };

  if (data) {
    if (data.available && data.available !== 0) {
      balance.total += Math.floor(parseFloat(data.available.amount));
      balance.available += Math.floor(parseFloat(data.available.amount));
    }

    if (
      data.delegations &&
      data.delegations.length > 0 &&
      data.delegations !== 0
    ) {
      data.delegations.forEach((delegation, i) => {
        if (delegation.balance.amount) {
          balance.total += Math.floor(parseFloat(delegation.balance.amount));
          balance.delegation += Math.floor(
            parseFloat(delegation.balance.amount)
          );
        } else {
          balance.total += Math.floor(parseFloat(delegation.balance));
          balance.delegation += Math.floor(parseFloat(delegation.balance));
        }
      });
    }

    if (data.unbonding && data.unbonding.length > 0 && data.unbonding !== 0) {
      data.unbonding.forEach((unbond, i) => {
        unbond.entries.forEach((entry, j) => {
          balance.unbonding += Math.floor(parseFloat(entry.balance));
          balance.total += Math.floor(parseFloat(entry.balance));
        });
      });
    }

    if (data.rewards && data.rewards !== 0) {
      balance.total += Math.floor(parseFloat(data.rewards.amount));
      balance.rewards += Math.floor(parseFloat(data.rewards.amount));
    }

    if (data.val_commission && data.val_commission.length > 0) {
      balance.commission = Math.floor(
        parseFloat(data.val_commission[0].amount)
      );
      balance.total += Math.floor(parseFloat(data.val_commission[0].amount));
    }
    // const validatorAddress = fromBech32(account, 'cybervaloper');
    // const resultGetDistribution = await getDistribution(validatorAddress);
    // if (resultGetDistribution) {
    //   balance.commission += Math.floor(
    //     parseFloat(resultGetDistribution.val_commission[0].amount)
    //   );
    //   balance.total += Math.floor(
    //     parseFloat(resultGetDistribution.val_commission[0].amount)
    //   );;
    // }
  }
  return balance;
};

export const getAmountATOM = (data) => {
  let amount = 0;
  for (let item = 0; item < data.length; item++) {
    if (amount <= TAKEOFF.ATOMsALL) {
      amount +=
        Number.parseInt(data[item].tx.value.msg[0].value.amount[0].amount) /
        COSMOS.DIVISOR_ATOM;
    } else {
      amount = TAKEOFF.ATOMsALL;
      break;
    }
  }
  return amount;
};

export const getBalanceWallet = (address) =>
  new Promise((resolve) =>
    axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/account?address="${address}"`,
    })
      .then((response) => {
        resolve(response.data.result);
      })
      .catch((e) => {})
  );

export const getDrop = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://io.cybernode.ai/ipfs_api/api/v0/dag/get?arg=bafyreifheyc6rhjhxenu3df3pwbxv5r6vb273szvwufjbly4m6rlv3jyni/${address}`,
    });
    return response.data;
  } catch (e) {
    return 0;
  }
};

export const getTxs = async (txs) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs/${txs}`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getValidatorsInfo = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/validators/${address}`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getDistribution = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/distribution/validators/${address}`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const keybaseCheck = async (identity) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=basics`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const keybaseAvatar = async (identity) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getDelegators = async (validatorAddr) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/validators/${validatorAddr}/delegations`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getRewards = async (delegatorAddr, validatorAddr) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/distribution/delegators/${delegatorAddr}/rewards/${validatorAddr}`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTotalRewards = async (delegatorAddr) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/distribution/delegators/${delegatorAddr}/rewards`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getDelegations = async (address, node = CYBER_NODE_URL_LCD) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/delegators/${address}/delegations`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTotalSupply = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/supply/total`,
    });
    return response.data.result[0].amount;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const getCurrentBandwidthPrice = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/current_bandwidth_price`,
    });
    return response.data.result.price;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getIndexStats = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/index_stats`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getPreCommits = async (consensusAddress) => {
  try {
    const body = JSON.stringify({
      query: `query lifetimeRate {
        validator(where: {consensus_pubkey: {_eq: "${consensusAddress}"}}) {
          pre_commits_aggregate {
            aggregate {
              count
            }
          }
        }
        pre_commit_aggregate {
            aggregate {
              count
            }
        }
      }`,
    });
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await axios({
      method: 'post',
      url: CYBER.CYBER_INDEX_HTTPS,
      headers,
      data: body,
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getGraphQLQuery = async (
  query,
  urlGraphql = CYBER.CYBER_INDEX_HTTPS
) => {
  try {
    const body = JSON.stringify({
      query,
    });
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await axios({
      method: 'post',
      url: urlGraphql,
      headers,
      data: body,
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamStaking = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/staking/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getSendTxToTakeoff = async (sender, recipient) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${COSMOS.GAIA_NODE_URL_LSD}/txs?message.action=send&message.sender=${sender}&transfer.recipient=${recipient}&limit=1000000000`,
    });
    return response.data.txs;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getCurrentNetworkLoad = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_API}/current_network_load`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamSlashing = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/slashing/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamDistribution = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/distribution/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamBandwidth = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/bandwidth/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamGov = async () => {
  try {
    const responseGovDeposit = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/gov/parameters/deposit`,
    });

    const responseGovTallying = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/gov/parameters/tallying`,
    });

    const responseGovVoting = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/gov/parameters/voting`,
    });

    const response = {
      deposit: responseGovDeposit.data.result,
      voting: responseGovTallying.data.result,
      tallying: responseGovVoting.data.result,
    };

    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamRank = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/rank/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamInlfation = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/minting/parameters`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamEnergy = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/cyber/energy/v1beta1/resources/params`,
    });
    return response.data.params;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getParamNetwork = async (address, node) => {
  try {
    let staking = null;
    let slashing = null;
    let distribution = null;
    let bandwidth = null;
    let gov = null;
    let rank = null;
    let inlfation = null;
    let energy = null;

    const dataStaking = await getParamStaking();
    console.log(`dataStaking`, dataStaking)
    if (dataStaking !== null) {
      staking = dataStaking;
    }
    const dataSlashing = await getParamSlashing();
    console.log(`dataSlashing`, dataSlashing)
    if (dataSlashing !== null) {
      slashing = dataSlashing;
    }
    const dataDistribution = await getParamDistribution();
    console.log(`dataDistribution`, dataDistribution)
    if (dataDistribution !== null) {
      distribution = dataDistribution;
    }
    const dataGov = await getParamGov();
    console.log(`dataGov`, dataGov)
    if (dataGov !== null) {
      gov = dataGov;
    }
    const dataBandwidth = await getParamBandwidth();
    console.log(`dataBandwidth`, dataBandwidth)
    if (dataBandwidth !== null) {
      bandwidth = dataBandwidth;
    }

    const dataRank = await getParamRank();
    console.log(`dataRank`, dataRank)
    if (dataRank !== null) {
      rank = dataRank;
    }

    const dataInlfation = await getParamInlfation();
    console.log(`dataInlfation`, dataInlfation)
    if (dataInlfation !== null) {
      inlfation = dataInlfation;
    }

    const dataEnergy = await getParamEnergy();
    if (dataEnergy !== null) {
      energy = dataEnergy;
    }

    const response = {
      staking,
      slashing,
      distribution,
      bandwidth,
      gov,
      rank,
      inlfation,
      energy,
    };

    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAvailable = async (address, node = CYBER_NODE_URL_LCD) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${node}/bank/balances/${address}`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getInlfation = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/minting/inflation`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getUnbonding = async (address, node = CYBER_NODE_URL_LCD) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${node}/staking/delegators/${address}/unbonding_delegations`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getRewardsAll = async (address, node = CYBER_NODE_URL_LCD) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${node}/distribution/delegators/${address}/rewards`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTxCosmos = async (page = 1) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${COSMOS.GAIA_NODE_URL_LSD}/txs?message.action=send&transfer.recipient=${COSMOS.ADDR_FUNDING}&limit=1000000000&page=${page}`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getcommunityPool = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/distribution/community_pool`,
    });
    return response.data.result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getImportLink = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://io.cybernode.ai/api/v0/dag/get?arg=bafyreibnn7bfilbmkrxm2rwk5fe6qzzdvm2xen34cjdktdoex4uylb76z4/${address}`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFromLink = async (cid) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cyberlink.objectTo=${cid}&limit=1000000000`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getToLink = async (cid) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cyberlink.objectFrom=${cid}&limit=1000000000`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFollows = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cybermeta.subject=${address}&cyberlink.objectFrom=QmPLSA5oPqYxgc8F7EwrM8WS9vKrr1zPoDniSRFh8HSrxx&limit=1000000000`,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTweet = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cybermeta.subject=${address}&cyberlink.objectFrom=QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx&limit=1000000000`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getContent = async (cid, timeout = SEARCH_RESULT_TIMEOUT_MS) => {
  let timerId;
  // const timeoutPromise = () =>
  //   new Promise((reject) => {
  //     timerId = setTimeout(reject, timeout);
  //   });

  const ipfsGetPromise = () =>
    new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://ipfs.io/ipfs/${cid}`,
      }).then((response) => {
        // clearTimeout(timerId);
        resolve(response.data);
      });
    });
  return Promise.race([ipfsGetPromise()]);
};

export const chekFollow = async (address, addressFollowHash) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cybermeta.subject=${address}&cyberlink.objectFrom=QmPLSA5oPqYxgc8F7EwrM8WS9vKrr1zPoDniSRFh8HSrxx&cyberlink.objectTo=${addressFollowHash}&limit=1000000000`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAvatar = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cybermeta.subject=${address}&cyberlink.objectFrom=Qmf89bXkJH9jw4uaLkHmZkxQ51qGKfUPtAMxA8rTwBrmTs&limit=1000000000`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getFollowers = async (addressHash) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cyberlink.objectFrom=QmPLSA5oPqYxgc8F7EwrM8WS9vKrr1zPoDniSRFh8HSrxx&cyberlink.objectTo=${addressHash}&limit=1000000000`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getCreator = async (cid) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/txs?cyberlink.objectTo=${cid}&limit=1000000000`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const authAccounts = async (address) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CYBER_NODE_URL_LCD}/auth/accounts/${address}`,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAvatarIpfs = async (cid, ipfs) => {
  if (ipfs !== null) {
    const responseDag = await ipfs.dag.get(cid, {
      localResolve: false,
    });

    if (responseDag.value.size <= 1.5 * 10 ** 7) {
      const responsePin = ipfs.pin.add(cid);
      console.log('responsePin', responsePin);
      let mime;

      const responseCat = uint8ArrayConcat(await all(ipfs.cat(cid)));

      const data = responseCat;
      // const buf = someVar;
      // const bufs = [];
      // bufs.push(buf);
      // const data = Buffer.concat(bufs);
      const dataFileType = await FileType.fromBuffer(data);
      if (dataFileType !== undefined) {
        mime = dataFileType.mime;
        if (mime.indexOf('image') !== -1) {
          // const dataBase64 = data.toString('base64');
          const dataBase64 = uint8ArrayToAsciiString(data, 'base64');
          const file = `data:${mime};base64,${dataBase64}`;
          return file;
        }
      }
      const dataBase64 = uint8ArrayToAsciiString(data);
      // console.log(`dataBase64`, dataBase64);
      if (isSvg(dataBase64)) {
        const svg = `data:image/svg+xml;base64,${uint8ArrayToAsciiString(
          data,
          'base64'
        )}`;
        return svg;
      }
    }
  } else {
    const ipfsGetPromise = () =>
      new Promise((resolve, reject) => {
        axios({
          method: 'get',
          url: `https://ipfs.io/ipfs/${cid}`,
        }).then((response) => {
          // clearTimeout(timerId);
          resolve(response.data);
        });
      });
    return Promise.race([ipfsGetPromise()]);
  }
  return null;
};
