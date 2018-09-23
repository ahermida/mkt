/**
 * Test Pubsub features and connecting users
 */
const Mkt = require('../build/js/api.node.bundle.js');
const IPFS = require('ipfs');
const wrtc = require('wrtc');
const MktContract = artifacts.require('Mkt');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;
const Web3 = require('web3');
const ethContract = require('../build/contracts/Mkt.json');

//get provider
async function getWeb3() {
  let provider;

  if (typeof window !== 'undefined' &&
      typeof window.web3 !== 'undefined' &&
      typeof window.web3.currentProvider !== 'undefined') {
    provider = window.web3.currentProvider;
  } else {
    provider = new Web3.providers.HttpProvider('http://localhost:8545');
  }
  let web3 = new Web3(provider);
  try {
    await web3.eth.getBlockNumber();
  } catch (e) {
    console.log('localhost:8545 provider failed, defaulting to ropsten via infura');

    //method wouldn't work if we're not actually connected to anything, so switch to ropsten
    web3.setProvider(new Web3.providers.HttpProvider('https://ropsten.infura.io'));
  }
  return web3;
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
    it('actually works', async () => {

      //summon ethjs and grab accounts
      let web3 = await getWeb3();
      let accounts = await web3.eth.getAccounts();
      let account = accounts[0];

      //startup app
      const app = new Mkt({ipfs, webrtc: wrtc});

      //create new user
      app.on('eth', async () => {
        let number = Math.round(Math.random(100) * 100);
        const user = await app.core.newUser(number);
        console.log(user);
      });
    });
  });
});
