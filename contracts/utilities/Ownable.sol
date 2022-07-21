// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

/*
* @title provide a general modifier to ensure that functions can only called
*        from the owner
*/
contract Ownable {
  //owner of the contract
  address public owner;

  //default constructor to set the owner to msg.sender
  constructor() internal {
    owner = msg.sender;
  }

  //make functions only accessible for the owner of the contract
  modifier onlyOwner(){
    require(
      tx.origin == owner,
      "function only for owner"
    );
    _;
  }
}
