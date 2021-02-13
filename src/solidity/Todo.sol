// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract Todo {
  // per user,
  // store the symmetrical hash of the day's task list at EOD
  // You should be able to decrypt this at will
  mapping(address => uint256[]) public hashedLists;

  function saveListHash(uint256 hashedList) public returns (bool) {
    hashedLists[msg.sender].push(hashedList);
    return true;
  }
}
