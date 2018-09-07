import  bodyParser from 'body-parser';
import  express from 'express';


import {createNewBlockWithData, getBlockchain} from './blockchain';
import {connectToPeers, getSockets, initP2PServer} from './peer2peer';




var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];



// The networking bart

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(getBlockchain())));
    app.post('/mineBlock', (req, res) => {
        const newBlock = createNewBlockWithData(req.body.data);
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};



connectToPeers(initialPeers);
initHttpServer();
initP2PServer(p2p_port);
