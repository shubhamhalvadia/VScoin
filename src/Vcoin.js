const {Blockchain, Transaction} = require('./Blockchain')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('03e33056a23d5dc3ced0c339ed541dc10fedf27d8d09f495fc5a06138502e0d4');
const myWalletAddress = myKey.getPublic('hex');

let VScoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
VScoin.addTransaction(tx1);

console.log('\ Starting miner...');
VScoin.minePendingTransaction(myWalletAddress);

const tx2 = new Transaction(myWalletAddress, 'public key goes here', 20);
tx2.signTransaction(myKey);
VScoin.addTransaction(tx2);

console.log('\ Starting miner again...');
VScoin.minePendingTransaction(myWalletAddress);

console.log('\n Balance of my is ', VScoin.getBalanceofAddress(myWalletAddress));
