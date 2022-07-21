// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import "./utilities/Bytes.sol";
import "./utilities/InitializeOwnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";

/**
* @author Votify Team
* @title implementation contract for an election
*/
contract Election is InitializeOwnable, ERC1155Receiver {
    // using boundary checks for uint256 operations
    using SafeMath for uint256;

    // structure definition of a candidate from the election
    struct Candidate {
        uint256 voteCount;
        uint256 listIndex;
    }

    // constant for an successfull receive of the voteToken
    bytes4 constant private ERC1155_RECEIVED = bytes4(keccak256(
      "onERC1155Received(address,address,uint256,uint256,bytes)"
    ));

    // current status of the elections
    // availability of the individual operations depends on this status
    enum ElectionState { Created, Open, Closed }
    ElectionState public currentState;

    // storage of all available candidates
    bytes32[] public candidateNames;
    mapping(bytes32 => Candidate) public candidates;

    // id of the associated voteToken
    uint256 public tokenID;

    // event triggered by a new candidate
    event CandidateAdded(bytes32 candidateName);

    // event triggered by a new vote
    event VoteAdded(bytes32 candidateName);

    // event triggered by state change
    event StateChanged(ElectionState newState);

    /**
    * @notice initialization for the proxy contract to set the tokenID
    * @dev openZeppelin ensures that the function can only be called once
    * @param owner address of the owner
    * @param _tokenID ID of token
    */
    function initialize(address owner, uint256 _tokenID) public initializer {
        tokenID = _tokenID;
        super.initialize(owner);
    }

    /**
    * @notice get the current number of candidates
    * @dev it should be used to iterate overthe current candidates
    * @return candidateCount number of candidates
    */
    function getCandidateCount() public view returns (uint256 candidateCount) {
        candidateCount = candidateNames.length;
    }

    /**
    * @notice add a new candidate
    * @dev
    * -> the new candidate will be added at the end of the array
    * -> emits a {candidateAdded} event after successfull insert
    * @param name name of candidate
    * Requirements:
    * -> only for the owner
    * -> state of the election is created
    * -> candidate is new
    */
    function addCandidate(bytes32 name) public onlyOwner {
        require(
            currentState == ElectionState.Created,
            "election already released"
        );
        require(candidates[name].listIndex == 0, "candidate already exists");
        candidateNames.push(name);
        candidates[name].listIndex = candidateNames.length;
        emit CandidateAdded(name);
    }

    /**
    * @notice start the defined elections
    * @dev
    * -> afterwards its not possible to add new candidates
    * -> emits a {StateChanged} event after successfull start
    * Requirements:
    * -> only for the owner
    * -> state of the election is created
    * -> there are available candidates to vote
    */
    function startElection() public onlyOwner {
        require(
            currentState == ElectionState.Created,
            "election already released"
        );
        require(candidateNames.length > 0, "no candidates available to vote");
        currentState = ElectionState.Open;
        emit StateChanged(currentState);
    }

    /**
    * @notice stop the open election
    * @dev
    * -> afterwards its not possible to vote for an candidate
    * -> emits a {StateChanged} event after successfull start
    * Requirements:
    * -> only for the owner
    * -> state of the election is open
    */
    function stopElection() public onlyOwner {
        require(currentState == ElectionState.Open, "election not open");
        currentState = ElectionState.Closed;
        emit StateChanged(currentState);
    }

    /**
    * @notice receiver of an ERC1155 token for a vote of this election
    * Requirements:
    * -> the token has the id of this election
    * -> state of the election is open
    */
    function onERC1155Received(
        address,
        address,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        require(
            currentState == ElectionState.Open,
            "election currently locked"
        );
        require(tokenID == id, "token not allowed for this election");
        bytes32 candidateName = Bytes.toBytes32(data, 0);
        require(
            candidates[candidateName].listIndex != 0,
            "selected invalid candidate"
        );
        candidates[candidateName].voteCount += value;
        emit VoteAdded(candidateName);
        return ERC1155_RECEIVED;
    }

    /**
    * @notice receiver of multiple token
    * @dev multpile tokens are not supported int his contract, because every contract
    *    represents one tokenID
    */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external override returns (bytes4) {
        revert("onERC1155BatchReceived: no support for multiple tokens ");
    }

    /**
    * @notice destructor of this contract
    * @dev
    * -> afterwards this election isn't accessicle anymore
    * -> the contract will be transfer to msg.sender
    * Requirements:
    * -> only for the owner
    */
    function destroy() public onlyOwner {
        selfdestruct(msg.sender);
    }
}
