// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import "./Election.sol";
import "./VoteToken.sol";
import "./utilities/Ownable.sol";
import "./utilities/CloneFactory.sol";

/**
* @author Votify Team
* @title administration of the multiple election contracts
* @dev Every election has an unique contract, which delegates the calls to the
*      implemantation contract as a proxy.
*/
contract ElectionFactory is CloneFactory, Ownable {
    // structure definition of an election
    struct ElectionContract {
        bytes32 name;
        uint256 listIndex;
    }

    // these state variable defines the library instance of an election contract
    address public libraryAddress;

    // contract of the voteToken
    VoteToken private voteToken;

    // storage of all current elections
    address[] public electionAdresses;
    mapping(address => ElectionContract) public elections;

    // event triggered by every new election clone
    event ElectionCreated(address contractAddress);

    // event triggered by every deleted election
    event ElectionDeleted(address contractAddress);

    /**
    * @notice constructor to set the library of the election contract
    * @param _libraryAddress address of the library
    * @param voteTokenAddress address of VoteToken contract
    */
    constructor(address _libraryAddress, address voteTokenAddress) public {
        voteToken = VoteToken(voteTokenAddress);
        libraryAddress = _libraryAddress;
    }

    /**
    * @notice set the libraryAddress for delegate calls of the proxys
    * @param _libraryAddress address of the library
    * Requirements: only for the owner
    */
    function setLibraryAddress(address _libraryAddress) public onlyOwner {
        libraryAddress = _libraryAddress;
    }

    /**
    * @notice get the current address of the associated token
    * @return tokenAddress address of token
    * Requirements: VoteToken has to be initialized
    */
    function getTokenAddress() public view returns(address tokenAddress) {
      require(voteToken != VoteToken(0), "voteToken not initialized");
      tokenAddress = address(voteToken);
    }

    /**
    * @notice get the current number of elections
    * @dev it should be used to iterate over the current elections
    * @return electionsCount number of elections
    */
    function getElectionCount() public view returns (uint256 electionsCount) {
        electionsCount = electionAdresses.length;
    }

    /**
    * @notice create a new proxy clone of the elecion with his own state
    * @dev
    * -> it caused lower gas cas costs instead of a new deployment of the
    *    whole implementation contract
    * -> the election will also be added to the token contract
    * -> emits a {electionCreated} event after successfull deployment
    * @param name name of election
    * Requirements:
    * -> only for the owner
    * -> implementation contract has to be defined
    */
    function createElection(bytes32 name) public onlyOwner {
        require(
            libraryAddress != address(0),
            "Implementation contract not defined"
        );
        address cloneAddress = createClone(libraryAddress);
        require(
            elections[cloneAddress].listIndex == 0,
            "invalid new election address"
        );
        voteToken.addElection(cloneAddress);
        uint256 tokenID = voteToken.getID(cloneAddress);
        Election(cloneAddress).initialize(msg.sender, tokenID);
        electionAdresses.push(cloneAddress);
        elections[cloneAddress] = ElectionContract(
            name,
            electionAdresses.length
        );
        emit ElectionCreated(cloneAddress);
    }

    /**
    * @notice delete an existing election
    * @dev
    * -> the last item will be moved to the deleted position to prvent a gap
    * -> the cloned election proxy will be destroyed to disable it and free the
    *    contract balance
    * -> the election will also be removed from the token contract
    * -> emits a {electionDeleted} event after successfull removement
    * @param electionAddress address of election
    * Requirements:
    * -> only for the owner
    * -> contract at the passed address is an valid election
    * -> state of the election is open
    */
    function deleteElection(address electionAddress) public onlyOwner {
      require(
        elections[electionAddress].listIndex != 0,
        "invalid election"
      );
      require(
        Election(electionAddress).currentState() != Election.ElectionState.Open,
        "election currently open"
      );
      uint256 rowToDelete =  elections[electionAddress].listIndex - 1;
      address keyToMove = electionAdresses[electionAdresses.length - 1];
      electionAdresses[rowToDelete] = keyToMove;
      elections[keyToMove].listIndex = rowToDelete;
      delete(elections[electionAddress]);
      electionAdresses.pop();
      Election(electionAddress).destroy();
      voteToken.delElection(electionAddress);
      emit ElectionDeleted(electionAddress);
    }
}
