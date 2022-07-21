// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import "./Ownable.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

//expand the ownable contract so that the proxy can also set the owner
/*
* @title expand the ownable contract so that also the proxy can set the owner
*/
contract InitializeOwnable is Ownable, Initializable {
  /*
  * @title initialize the owner
  * Requirements: can only called once
  */
  function initialize(address _owner) public initializer {
    owner = _owner;
  }
}
