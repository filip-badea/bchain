
import SHA256 from 'crypto-js/sha256';
import {broadcastLatest} from './peer2peer';

// Block constructor
class Block {
    constructor(index, timestamp, votes, previousHash = '', hash) {
        this.index = index;
        this.timestamp = timestamp;
        this.votes = votes;
        this.previousHash = previousHash;
        this.hash = hash;
        this.nonce = 0;
    }
}



    // Blockchain related operations
    
    const genesisBlock = new Block(
      0, 1465154705, 'No votes yet', '0', '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', 0
    );

    var blockchain = [genesisBlock];

    const getBlockchain = () => blockchain;

    const getDifficulty = (aBlockchain) => {
        return 2;
    }

    const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

    var getLastBlock = () => {

      return blockchain[blockchain.length - 1];
    }






    //Block mining

    const calculateHashForBlock = (block) => {
        return SHA256(block.index + block.previousHash + block.timestamp + block.data + block.nonce).toString();
    }

    const mineBlock = (block, difficulty) => {
        block.timestamp = new Date().getTime() / 1000;
        block.hash = calculateHashForBlock(block)
        while(block.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            block.nonce++;
            block.hash = calculateHashForBlock(block);
        }

        console.log('Block mined: ' + block.hash);
    }

    const createNewBlockWithData = (blockData) => {
      const previousBlock = getLastBlock();
      const difficulty = getDifficulty(getBlockchain());
      console.log('difficulty: ' + difficulty);
      const nextIndex = previousBlock.index + 1;
      const nextTimestamp = getCurrentTimestamp();
      var newBlock = new Block(nextIndex, nextTimestamp, blockData, previousBlock.hash,  0);
      mineBlock(newBlock, difficulty);
      if (isValidNewBlock(newBlock, previousBlock)) {
        blockchain.push(newBlock);
      }
      console.log('block added: ' + JSON.stringify(newBlock));
      broadcastLatest();
      return newBlock;
    }


    const isValidBlockStructure = (block) => {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
    };


    const isValidNewBlock = (newBlock, previousBlock) => {
        if (!isValidBlockStructure(newBlock)) {
            console.log('invalid structure');
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!hasValidHash(newBlock)) {
            return false;
        }
        return true;
    };

    const hashMatchesBlockContent = (block) => {
        const blockHash = calculateHashForBlock(block);
        return blockHash === block.hash;
    };

    const hasValidHash = (block) => {

        if (!hashMatchesBlockContent(block)) {
            console.log('invalid hash, got:' + block.hash);
            return false;
        }
        return true;
    };



    const isValidBlockChain = (blockchainToValidate) => {
        const isValidGenesis = (block) => {
            return JSON.stringify(block) === JSON.stringify(genesisBlock);
        };

        if (!isValidGenesis(blockchainToValidate[0])) {
            return false;
        }

        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    };

    const addBlockToChain = (newBlock) => {
        if (isValidNewBlock(newBlock, getLastBlock())) {
            blockchain.push(newBlock);
            return true;
        }
        return false;
    };


    const replaceChain = (newBlocks) => {
        if (isValidBlockChain(newBlocks) &&
            newBlocks.length > getBlockchain().length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            blockchain = newBlocks;
            broadcastLatest();
        } else {
            console.log('Received blockchain invalid');
        }
    };








export {Block, getBlockchain, getLastBlock, isValidBlockStructure, replaceChain, createNewBlockWithData, addBlockToChain};
