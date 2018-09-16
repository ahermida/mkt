/**
 * Test Pubsub features and connecting users
 */
const Mkt = require('../build/js/api.node.bundle.js');
const IPFS = require('ipfs');
const wrtc = require('wrtc');
const MktContract = artifacts.require('Mkt');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;
const Eth = require('ethjs');
const ethContract = require('../build/contracts/Mkt.json');

//get provider
export async function getEth() {
  let provider;

  if (typeof window !== 'undefined' &&
      typeof window.web3 !== 'undefined' &&
      typeof window.web3.currentProvider !== 'undefined') {
    provider = window.web3.currentProvider;
  } else {
    provider = new Eth.HttpProvider('http://localhost:8545');
  }
  let eth = new Eth(provider);
  try {
    await eth.blockNumber();
  } catch (e) {
    console.log('localhost:8545 provider failed, defaulting to ropsten via infura');

    //method wouldn't work if we're not actually connected to anything, so switch to ropsten
    eth.setProvider(new Eth.HttpProvider('https://ropsten.infura.io'));
  }
  return eth;
}

const ipfs = new IPFS({
    repo: 'mkt',
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        ],
      },
    },
    EXPERIMENTAL: {
        pubsub: true,
    },
});

contract('Mkt', accounts => {
  const owner = accounts[1];
  const user = accounts[2];
  const friend = accounts[3];
  const version = '0.0.1';
  const contractName = "Mkt";
  let mktContract;

  beforeEach(async () => {
    mktContract = await MktContract.new({from: owner});
    const callData = encodeCall('initialize', ['address'], [owner]);
    await mktContract.sendTransaction({data: callData, from: owner});
    process.env.MKT_ADDRESS = mktContract.address;
  });

  describe('mkt api test', () => {
    let eth = getEth();
    it('actually works', async () => {

      //startup app
      const app = new Mkt({ipfs, webrtc: wrtc});

      //create new user
      app.on('eth', async () => {
        const user = await app.core.newUser('hello');
        console.log(user);
      });
    });
  });
});
