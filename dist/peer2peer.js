'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.somethingRicked = exports.getSockets = exports.initP2PServer = exports.broadcastLatest = exports.connectToPeers = undefined;

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _blockchain = require('./blockchain');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sockets = [];

var getSockets = function getSockets() {
    return sockets;
};

var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var initP2PServer = function initP2PServer(p2p_port) {
    var server = new _ws2.default.Server({ port: p2p_port });
    server.on('connection', function (ws) {
        return initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2p_port);
};

var initConnection = function initConnection(ws) {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = function initMessageHandler(ws) {
    ws.on('message', function (data) {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = function initErrorHandler(ws) {
    var closeConnection = function closeConnection(ws) {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', function () {
        return closeConnection(ws);
    });
    ws.on('error', function () {
        return closeConnection(ws);
    });
};

var handleBlockchainResponse = function handleBlockchainResponse(message) {
    var receivedBlocks = JSON.parse(message.data).sort(function (b1, b2) {
        return b1.index - b2.index;
    });
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    console.log("Latest blocks received", receivedBlocks);

    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];

    if (!(0, _blockchain.isValidBlockStructure)(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    var latestBlockHeld = (0, _blockchain.getLastBlock)();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if ((0, _blockchain.addBlockToChain)(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            (0, _blockchain.replaceChain)(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

var connectToPeers = function connectToPeers(newPeers) {
    newPeers.forEach(function (peer) {
        var ws = new _ws2.default(peer);
        ws.on('open', function () {
            return initConnection(ws);
        });
        ws.on('error', function () {
            console.log('connection failed');
        });
    });
};

var write = function write(ws, message) {
    return ws.send(JSON.stringify(message));
};
var broadcast = function broadcast(message) {
    return sockets.forEach(function (socket) {
        return write(socket, message);
    });
};

var broadcastLatest = function broadcastLatest() {
    broadcast(responseLatestMsg());
};

var queryChainLengthMsg = function queryChainLengthMsg() {
    return { 'type': MessageType.QUERY_LATEST };
};

var queryAllMsg = function queryAllMsg() {
    return { 'type': MessageType.QUERY_ALL };
};

var responseChainMsg = function responseChainMsg() {
    return {
        'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify((0, _blockchain.getBlockchain)())
    };
};

var responseLatestMsg = function responseLatestMsg() {
    return {
        'type': MessageType.RESPONSE_BLOCKCHAIN,
        'data': JSON.stringify([(0, _blockchain.getLastBlock)()])
    };
};

exports.connectToPeers = connectToPeers;
exports.broadcastLatest = broadcastLatest;
exports.initP2PServer = initP2PServer;
exports.getSockets = getSockets;
exports.somethingRicked = somethingRicked;