// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import "./utilities/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
* @author Votify Team
* @title Multi-Token for Elections
* @dev every election has unique tokens
*/
contract VoteToken is ERC1155, Ownable {
    // counter for identification of election
    using Counters for Counters.Counter;
    Counters.Counter private electionCounter;

    // struct for ElectionContract information
    struct ElectionContract {
        uint256 idElection;
        bool isActive;
        address[] requestors;
        mapping(address => bool) alreadyRequested;
    }

    // mapping from address to ElectionContract
    mapping(address => ElectionContract) private contracts;

    /**
    * @notice Constructor inherits from ERC1155
    * @dev takes URI as identifier for Tokens
    */
    constructor() public ERC1155("FungibleVoteToken/{id}") {}

    /**
    * @notice checks if person already voted
    * @param election address of election
    */
    modifier onlyNewRequests(address election) {
        require(
            contracts[election].isActive &&
            !contracts[election].alreadyRequested[msg.sender],
            "VoteToken already claimed"
        );
        _;
    }

    /**
    * @notice adds an election struct
    * @param election address of election
    * Requirements:
    * -> only for owner
    * -> `election` does not exist
    */
    function addElection(address election) public onlyOwner {
        require(!contracts[election].isActive, "Election already exists");
        electionCounter.increment();
        uint256 newId = electionCounter.current();
        contracts[election].idElection = newId;
        contracts[election].isActive = true;
    }

    /**
    * @notice deletes an election struct
    * @dev already existing tokens of this election are not burned
    * @param election address of election
    * Requirements:
    * -> only for owner
    * -> `election` exists
    */
    function delElection(address election) public onlyOwner {
        require(contracts[election].isActive, "Election does not exist");
        for(uint256 i = 0; i < contracts[election].requestors.length; ++i) {
            delete contracts[election].alreadyRequested[
                contracts[election].requestors[i]
            ];
        }
        delete contracts[election];
    }

    /**
    * @notice mints VoteToken and send to msg.sender
    * @dev emits a {TransferSingle} event
    * @param election address of election
    * Requirements:
    * -> `election` exists
    * -> request of sender is new
    */
    function getVoteToken(address election) public onlyNewRequests(election){
        require(contracts[election].isActive, "Election does not exist");
        contracts[election].alreadyRequested[msg.sender] = true;
        contracts[election].requestors.push(msg.sender);
        _mint(msg.sender, contracts[election].idElection, 1, "");
    }

    /**
    * @notice delegates VoteToken to _receiver
    * @dev emits a {TransferSingle} event
    * @param election address of election
    * @param receiver address of receiver
    * Requirements:
    * -> `election` exists
    * -> sender owns more than one Token
    */
    function delegateVoteToken(address election, address receiver) public {
        require(contracts[election].isActive, "Election does not exist");
        uint256 electionID = contracts[election].idElection;
        require(balanceOf(msg.sender, electionID) > 0, "Sender has not enough Tokens");  
        safeTransferFrom(msg.sender, receiver, electionID, 1, "delegate");
    }

    /**
    * @notice gets id of election
    * @param election address of election
    * @return election id of election
    * Requirements: `election` exists
    */
    function getID(address election) public view returns (uint256) {
        require(contracts[election].isActive, "Election does not exist");
        return contracts[election].idElection;
    }
}
