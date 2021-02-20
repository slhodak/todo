const fs = require('fs');
const Web3 = require('web3');
const { keccak256 } = require('ethereum-cryptography/keccak');
const contractAddress = '';
const fromAddress = '';

module.exports = class Todo {
  constructor() {
    this.eth = new Web3('http://localhost:8545').eth;
    const { Contract } = this.eth;
    let sourceJSON = fs.readFileSync('build/Todo/combined.json');
    this.contractSource = JSON.parse(sourceJSON).contracts['src/solidity/Todo.sol:Todo'];
    this.contract = new Contract(this.contractSource.abi, contractAddress);
  }
  saveListHash(list) {
    const listHash = '0x' + keccak256(Buffer.from(JSON.stringify(list), 'utf-8')).toString('hex');
    this.contract.methods.saveListHash(listHash).send({ from: fromAddress })
        .on('transactionHash', transactionHash => console.log(transactionHash))
        .on('receipt', (receipt) => console.log(receipt))
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log('confirmation number', confirmationNumber);
          console.log('receipt', receipt);
        })
        .on('error', err => console.error(err));
  }
}
