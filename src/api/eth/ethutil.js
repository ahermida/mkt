 import Web3 from 'web3';

 //get provider
 export async function getWeb3() {
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
