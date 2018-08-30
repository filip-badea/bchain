'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addBlockToChain = exports.createNewBlockWithData = exports.replaceChain = exports.isValidBlockStructure = exports.getLastBlock = exports.getBlockchain = exports.Block = undefined;

var _sha = require('crypto-js/sha256');

var _sha2 = _interopRequireDefault(_sha);

var _peer2peer = require('./peer2peer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Block constructor
var Block = function Block(index, timestamp, votes) {
    var previousHash = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var hash = arguments[4];

    _classCallCheck(this, Block);

    this.index = index;
    this.timestamp = timestamp;
    this.votes = votes;
    this.previousHash = previousHash;
    this.hash = hash;
    this.nonce = 0;
};

// Blockchain related operations

var genesisBlock = new Block(0, 1465154705, 'No votes yet', '0', '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', 0);

var blockchain = [genesisBlock];

var getBlockchain = function getBlockchain() {
    return blockchain;
};

var getDifficulty = function getDifficulty(aBlockchain) {
    return 2;
};

var getCurrentTimestamp = function getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
};

var getLastBlock = function getLastBlock() {

    return blockchain[blockchain.length - 1];
};

//Block mining

var calculateHashForBlock = function calculateHashForBlock(block) {
    return (0, _sha2.default)(block.index + block.previousHash + block.timestamp + block.data + block.nonce).toString();
};

var mineBlock = function mineBlock(block, difficulty) {
    block.timestamp = new Date().getTime() / 1000;
    block.hash = calculateHashForBlock(block);
    while (block.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        block.nonce++;
        block.hash = calculateHashForBlock(block);
    }

    console.log('Block mined: ' + block.hash);
};

var createNewBlockWithData = function createNewBlockWithData(blockData) {
    var previousBlock = getLastBlock();
    var difficulty = getDifficulty(getBlockchain());
    console.log('difficulty: ' + difficulty);
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = getCurrentTimestamp();
    var newBlock = new Block(nextIndex, nextTimestamp, blockData, previousBlock.hash, 0);
    mineBlock(newBlock, difficulty);
    if (isValidNewBlock(newBlock, previousBlock)) {
        blockchain.push(newBlock);
    }
    console.log('block added: ' + JSON.stringify(newBlock));
    (0, _peer2peer.broadcastLatest)();
    return newBlock;
};

var isValidBlockStructure = function isValidBlockStructure(block) {
    return typeof block.index === 'number' && typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number';
};

var isValidNewBlock = function isValidNewBlock(newBlock, previousBlock) {
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

var hashMatchesBlockContent = function hashMatchesBlockContent(block) {
    var blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};

var hasValidHash = function hasValidHash(block) {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    return true;
};

var isValidBlockChain = function isValidBlockChain(blockchainToValidate) {
    var isValidGenesis = function isValidGenesis(block) {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }

    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};

var addBlockToChain = function addBlockToChain(newBlock) {
    if (isValidNewBlock(newBlock, getLastBlock())) {
        blockchain.push(newBlock);
        return true;
    }
    return false;
};

var replaceChain = function replaceChain(newBlocks) {
    if (isValidBlockChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        (0, _peer2peer.broadcastLatest)();
    } else {
        console.log('Received blockchain invalid');
    }
};

exports.Block = Block;
exports.getBlockchain = getBlockchain;
exports.getLastBlock = getLastBlock;
exports.isValidBlockStructure = isValidBlockStructure;
exports.replaceChain = replaceChain;
exports.createNewBlockWithData = createNewBlockWithData;
exports.addBlockToChain = addBlockToChain;