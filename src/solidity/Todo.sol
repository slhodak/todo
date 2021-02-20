// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract Todo {
  // per user,
  // store the keccak256 of the day's list at EOD
  mapping(address => mapping(uint => uint256[])) public listHashes;

  function saveListHash(uint256 listHash) public returns (bool) {
    listHashes[msg.sender][block.timestamp].push(listHash);
    return true;
  }
}
