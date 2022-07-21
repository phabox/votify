// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

/*
* @title librayry to handle a dynamic sized byte array
*/
library Bytes {
  /*
  * @title convert dynamic bytes array to fixed size bytes32
  * @dev the index defines the start point in the array for the beginning of 32 bytes
  */
  function toBytes32(bytes calldata data, uint256 index) internal pure returns (bytes32 _cast) {
      uint256 val;
      for (uint256 i = index; i < index + 32; i++) {
          val *= 256;
          if (i < data.length) val |= uint8(data[i]);
      }
      _cast = bytes32(val);
  }
}
