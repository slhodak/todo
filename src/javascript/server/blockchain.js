const fs = require('fs');
const Web3 = require('web3');
const { keccak256 } = require('ethereum-cryptography/keccak');
const contractAddress = '0x556f2f5Dbb1C05BC9bCCC78EF539D1E08757d03E'; // in dev env, copy from deploy receipt

module.exports = class TodoContract {
  constructor() {
    this.eth = new Web3('http://localhost:8545').eth;
    const { Contract } = this.eth;
    let abiJSON = fs.readFileSync('build/Todo/Todo.abi');
    let abi = JSON.parse(abiJSON);
    this.contract = new Contract(abi, contractAddress);
  }
  saveListHash(address, list, dayKey) {
    console.log(`Saving list for ${dayKey}`);
    const listHash = '0x' + keccak256(Buffer.from(JSON.stringify(list), 'utf-8')).toString('hex');
    this.contract.methods.saveListHash(listHash, dayKey).send({ from: address })
        .on('confirmation', (confirmationNumber, receipt) => {
          // console.log('confirmation number', confirmationNumber);
          console.log('sent transaction');
        })
        .on('error', err => console.error('Error sending saveListHash', err));
  }
  listHashes(address, dayKey) {
    this.contract.methods.listHashes(address, dayKey).call({ from: address })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation number', confirmationNumber);
        console.log('receipt', receipt);
      })
      .on('error', err => console.error('Error calling listHashes', err));
  }
}
