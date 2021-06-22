const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(senderAddress, recieverAddress, amount){
        this.senderAddress = senderAddress;
        this.recieverAddress = recieverAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash(){
        return SHA256(this.senderAddress + this.recieverAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.senderAddress){
            throw new Error('You cannot sign transaction for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.senderAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.senderAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this. previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nounce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nounce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !==Array(difficulty +1).join("0")){
            this.nounce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: "+ this.hash);
    }

    hasValidTransaction(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain =[this.GenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningRewards = 100;
    }
    
    GenesisBlock(){
        return new Block(Date.parse('17-06-2021'),"Genesis block","0");
    }

    getlatestblock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransaction(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningRewards);
        this.pendingTransactions.push(rewardTx);
    
        const block = new Block(Date.now(), this.pendingTransactions, this.getlatestblock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successufully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction){

        if(!transaction.senderAddress || !transaction.recieverAddress){
            throw new Error('Transaction must include sender and reciever address.');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain.');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceofAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.senderAddress === address){
                    balance -= trans.amount;
                }
                if(trans.recieverAddress === address){
                    balance += trans.amount;
                }
            }
        }
        console.log(balance);
        return balance;
    }

    //addBlock(newBlock){
    //    newBlock.previousHash = this.getlatestblock().hash;
    //    newBlock.mineBlock(this.difficulty);
    //    this.chain.push(newBlock);
    //}

    isChailValid(){
        for(let i =1; i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransaction()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            return true;
        }
    }

}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
