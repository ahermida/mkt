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
const EventEmitter = require('events');

let rn1 = Math.round(Math.random() * 1000);
let rn2 = Math.round(Math.random() * 5000);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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


const ipfsAlice = new IPFS({
    repo: 'mkt-alice',
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

const ipfsBob = new IPFS({
    repo: 'mkt-bob',
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
  const emitter = new EventEmitter();


  describe('mkt api test', () => {

    it('actually works', async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const app = new Mkt();

      //create new users
      app.on('eth', async () => {
        const mkt = await app.core.mkt.mkt.deploy({
          from: account,
          data: ethContract.data,
        }).send({from: account, gas: 5000000});
        await mkt.methods.initialize(account).send({from: account, gas: 3000000});
        process.env.MKT_ADDRESS = mkt.options.address;
        emitter.emit('contract');
      });

      //test the 2 users
      emitter.on('contract', async (u1, u2) => {
        const appU1 = new Mkt({ipfs: ipfsAlice, webrtc: wrtc})//, id: u1, pk: u1Info.private});
        const appU2 = new Mkt({ipfs: ipfsBob, webrtc: wrtc})//, id: u2, pk: u2Info.private});
        //once everything's setup, we'll create user
        appU1.on('eth', async () => appU2.on('eth', async () => {
          let u1 = await appU1.core.newUser(`${rn1}`);
          let u2 = await appU1.core.newUser(`${rn2}`);
        //  await sleep(2000);
          console.log('Successfully created 2 test users.');
          await appU1.listen(`${rn1}`, u1.private);
          await appU2.listen(`${rn2}`, u2.private);
          await appU1.connect(`${rn2}`); //try to connect app 2 to app 1
          appU1.peers[`rn2`].send('hello!');
        }));
      });
      return sleep(10000);
    });
  });
});
