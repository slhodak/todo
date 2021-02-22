// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract Todo {
  // per user,
  // store the keccak256 of the day's list at EOD
  mapping(address => mapping(string => bytes32)) public listHashes;

  function saveListHash(bytes32 listHash, string calldata day) public returns (bool) {
    // check that day is still today (remember days are 4am to 4am)
    listHashes[msg.sender][day] = listHash;
    return true;
  }
}
