import React from 'react';
import '../style.css';

export default class Blockchain extends React.Component {
  constructor() {
    super();
    this.state = {
      addressInput: '',
      loggedInAddres: '',
      dateKeyToSearch: '',
      foundListHash: '',
      dateKeySearched: ''
    };
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.loginToBlockchain = this.loginToBlockchain.bind(this);
    this.saveHashToBlockchain = this.saveHashToBlockchain.bind(this);
    this.handleDateKeyChange = this.handleDateKeyChange.bind(this);
    this.getListHash = this.getListHash.bind(this);
  }

  handleAddressChange(event) {
    this.setState({ addressInput: event.target.value });
  }
  loginToBlockchain() {
    const { addressInput } = this.state;
    fetch(`/blockchain/login?address=${addressInput}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      } else {
        this.setState({ loggedInAddress: data.address });
      }
    })
    .catch(err => console.error('Error logging in', err));
    this.setState({ addressInput: '' });
  }
  saveHashToBlockchain() {
    fetch('/blockchain/saveListHash', { method: 'POST' })
    .catch(err => console.error('Error clearing list', err));
  }
  handleDateKeyChange(e) {
    this.setState({ dateKeyToSearch: e.target.value });
  }
  getListHash() {
    const { dateKeyToSearch } = this.state;
    fetch(`/blockchain/listHash?date=${dateKeyToSearch}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      } else {
        this.setState({ 
          foundListHash: data.hash,
          dateKeySearched: dateKeyToSearch
        });
      }
    })
    .catch(err => console.error('Error getting list hash', err));
  }

  render() {
    const { loggedInAddress, addressInput, dateKeyToSearch, foundListHash, dateKeySearched } = this.state;
    return (
      <div className='blockchain functions'>
        <label htmlFor='address'>Public Address</label>
        <input className='address-input' type='text' onChange={this.handleAddressChange} name='public-address' value={addressInput}></input>
        <button onClick={this.loginToBlockchain} className='login'>Log in to Blockchain</button>
        <button onClick={this.saveHashToBlockchain} className='save-hash'>Save Hash</button>
        <label htmlFor='datekey'>Date Key</label>
        <input className='datekey-input' type='text' onChange={this.handleDateKeyChange} name='datekey' value={dateKeyToSearch}></input>
        <button onClick={this.getListHash} className='restore-list'>Search for Hash</button>
        <div>Logged in as:</div>
        <div className='logged-in-address'>{loggedInAddress || '0x0'}</div>
        <div>Hash for list on {dateKeySearched || '0000-0-0'}:</div>
        <div className='found-list-hash'>{foundListHash || '0x0'}</div>
      </div>
    );
  }
}
