import Election from "@/contracts/Election.json";
import VoteToken from "@/contracts/VoteToken.json";
import ElectionFactory from "@/contracts/ElectionFactory.json";

import * as connect from "@/store/ethers/ethersConnect";
import * as ethers from "ethers";

export function claimVoteToken(electionAddress, voteTokenAddress) {
  const voteTokenContract = getVoteTokenContract(voteTokenAddress);
  return voteTokenContract.getVoteToken(electionAddress);
}

export async function getVoteTokenCount(voteTokenAddress, electionAddress) {
  const voteTokenContract = getVoteTokenContract(voteTokenAddress);
  var tokenId = await voteTokenContract.getID(electionAddress);

  return await voteTokenContract.balanceOf(
    connect.getWallet().getAddress(),
    tokenId
  );
}

export async function vote(electionAddress, candidateName) {
  const voteTokenAddress = connect.getNetworkAddress(VoteToken["networks"]);
  const voteTokenContract = getVoteTokenContract(voteTokenAddress);
  const electionID = await voteTokenContract.getID(electionAddress);
  return voteTokenContract.safeTransferFrom(
    connect.getWalletAddress(),
    electionAddress,
    electionID,
    1,
    ethers.utils.formatBytes32String(candidateName)
  );
}

export async function delegateVote(electionAddress, delegationAddress) {
  const voteTokenAddress = connect.getNetworkAddress(VoteToken["networks"]);
  const voteTokenContract = getVoteTokenContract(voteTokenAddress);
  return voteTokenContract.delegateVoteToken(
    electionAddress,
    delegationAddress
  );
}

export async function getVotesForCandidate(electionAddress, candidateName) {
  const electionContract = getElectionContract(electionAddress);
  return (
    await electionContract.candidates(
      ethers.utils.formatBytes32String(candidateName)
    )
  )[0].toNumber();
}

export async function createElection(electionFactoryAddress, name) {
  const efContract = getElectionFactoryContract(electionFactoryAddress);
  return efContract.createElection(ethers.utils.formatBytes32String(name));
}

export async function startElection(electionAddress) {
  const electionContract = getElectionContract(electionAddress);
  return electionContract.startElection();
}

export async function stopElection(electionAddress) {
  const electionContract = getElectionContract(electionAddress);
  return electionContract.stopElection();
}

export async function addCandidate(electionAddress, candidateName) {
  const electionContract = getElectionContract(electionAddress);

  return electionContract.addCandidate(
    ethers.utils.formatBytes32String(candidateName)
  );
}

export async function getElections(electionFactoryAddress) {
  const efContract = getElectionFactoryContract(electionFactoryAddress);

  var electionCount = (await efContract.getElectionCount()).toNumber();
  var electionAddresses = [];
  var i;
  for (i = 0; i < electionCount; i++) {
    electionAddresses.push(await efContract.electionAdresses(i));
  }

  const elections = [];
  for (i = 0; i < electionAddresses.length; i++) {
    var election = await efContract.elections(electionAddresses[i]);
    elections.push({
      address: electionAddresses[i],
      name: ethers.utils.parseBytes32String(election[0]),
    });
  }
  return elections;
}

export async function getCandidates(electionAddress) {
  const electionContract = getElectionContract(electionAddress);

  var candidateCount = (await electionContract.getCandidateCount()).toNumber();
  const candidates = [];
  for (var i = 0; i < candidateCount; i++) {
    candidates.push(
      ethers.utils.parseBytes32String(await electionContract.candidateNames(i))
    );
  }
  return candidates;
}

export async function getCandidatesWithVotes(electionAddress) {
  const electionContract = getElectionContract(electionAddress);

  var candidateCount = (await electionContract.getCandidateCount()).toNumber();
  const candidates = [];
  for (var i = 0; i < candidateCount; i++) {
    const _name = ethers.utils.parseBytes32String(
      await electionContract.candidateNames(i)
    );
    const _voteCount = await getVotesForCandidate(electionAddress, _name);
    candidates.push({
      name: _name,
      voteCount: _voteCount,
    });
  }
  return candidates;
}

export async function getElectionStatus(electionAddress) {
  const electionContract = getElectionContract(electionAddress);
  return await electionContract.currentState();
}

export function getVoteTokenContract(voteTokenAddress) {
  return new ethers.Contract(
    voteTokenAddress,
    VoteToken["abi"],
    connect.getWallet()
  );
}

export function getElectionContract(electionAddress) {
  return new ethers.Contract(
    electionAddress,
    Election["abi"],
    connect.getWallet()
  );
}

export function getElectionFactoryContract(electionFactoryAddress) {
  return new ethers.Contract(
    electionFactoryAddress,
    ElectionFactory["abi"],
    connect.getWallet()
  );
}
