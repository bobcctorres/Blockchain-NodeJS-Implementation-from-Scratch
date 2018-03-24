/////////////////////////////////////////////////////////////////////////////////
// API entry point contract implementation
// A peer to peer server supporting the chain blocks as well a web server wainting
//  for transactions
/*
HTTP_PORT=3001 P2P_PORT=5001 npm run dev
HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
*/
/////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const P2pServer = require('./p2p-server');
const Miner = require('./miner');
const Logger = require('./logger');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const app = express();
const p2pServer = new P2pServer(bc, tp, wallet);
const miner = new Miner(bc, tp, wallet, p2pServer);
const logger = new Logger();

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  logger.log(`New block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.get('/balance', (req, res) => {
  res.json({ balance: wallet.calculateBalance(bc) });
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  p2pServer.syncChains();
  logger.log(`New block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);

  // store transactions on the block itself.
  p2pServer.broadcastTransaction(transaction);

  res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('/peers', (req, res) => {
  // res.json({
  //   peers: p2pServer.sockets.map(socket => socket._socket.address())
  // });
  res.json({ peers: p2pServer.sockets.length });
});

// app.post('/addPeer');

app.listen(HTTP_PORT, () => logger.log(`Listening on port: ${HTTP_PORT}`));
p2pServer.listen();

// module.exports = bc;
