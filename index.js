module.exports = {
  BalanceProgram: require('./bin/balance'),
  SendProgram: require('./bin/send'),
  CryptoRpc: require('./lib'),
  SolWeb3: require('@solana/web3.js')
};
