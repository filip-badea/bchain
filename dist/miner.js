'use strict';

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _blockchain = require('./blockchain');

var _peer2peer = require('./peer2peer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// The networking bart

var initHttpServer = function initHttpServer() {
    var app = (0, _express2.default)();
    app.use(_bodyParser2.default.json());

    app.get('/blocks', function (req, res) {
        return res.send(JSON.stringify((0, _blockchain.getBlockchain)()));
    });
    app.post('/mineBlock', function (req, res) {
        var newBlock = (0, _blockchain.createNewBlockWithData)(req.body.data);
        res.send();
    });
    app.get('/peers', function (req, res) {
        res.send((0, _peer2peer.getSockets)().map(function (s) {
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
    app.post('/addPeer', function (req, res) {
        (0, _peer2peer.connectToPeers)([req.body.peer]);
        res.send();
    });
    app.listen(http_port, function () {
        return console.log('Listening http on port: ' + http_port);
    });
};

(0, _peer2peer.connectToPeers)(initialPeers);
initHttpServer();
(0, _peer2peer.initP2PServer)(p2p_port);