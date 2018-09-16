 import Eth from 'ethjs';

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
