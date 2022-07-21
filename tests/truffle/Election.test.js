const Election = artifacts.require("./Election.sol");
const VoteToken = artifacts.require("./VoteToken.sol");

contract("Election", (accounts) => {
  before(async () => {
    this.user = accounts[1];
    this.owner = accounts[0];
    this.candidate = "Candidate 1"
    this.election = await Election.deployed();
    this.voteToken = await VoteToken.deployed();
    await this.voteToken.addElection(this.election.address);
    this.electionID = await this.voteToken.getID(this.election.address);
    await this.voteToken.addElection(this.voteToken.address);
    this.invalidElectionID = await this.voteToken.getID(this.voteToken.address);
    await this.voteToken.getVoteToken(this.election.address);
    await this.voteToken.getVoteToken(this.election.address, { from: this.user });
    await this.voteToken.getVoteToken(this.voteToken.address);
  })

  describe("initialization", async () => {
    it("deploys successfully", async () => {
      const address = await this.election.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    })

    it("election state initialized successfully", async () => {
      const electionState = await this.election.currentState();
      assert.equal(electionState, 0);
    })

    it("candidate list initialized empty", async () => {
      this.initCandidateCount = await this.election.getCandidateCount();
      assert.equal(this.initCandidateCount, 0);
    })
  })

  describe("initialize function", async () => {
    it("initialization successfull", async () => {
      await this.election.initialize(this.owner, this.electionID);
      const tokenID = await this.election.tokenID();
      assert.equal(tokenID.toNumber(), this.electionID.toNumber());
    })

    it("twice initialization failes", async () => {
      try{
        await this.election.initialize(this.owner, this.electionID);
        assert.fail("exception excepted");
      }
      catch(error)
      {
        assert.include(error.message, "contract is already initialized", "error message with wrong value");
      }
    })
  })

  describe("tests on inital state", async () => {
    it("create election failes", async () => {
      try{
        await this.election.startElection();
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "no candidates available to vote", "error message with wrong value");
      }
    })

    it("stop election failes", async () => {
      try{
        await this.election.stopElection();
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election not open", "error message with wrong value");
      }
    })

    it("vote failes", async () => {
      try{
        await this.voteToken.safeTransferFrom(this.owner, this.election.address, this.electionID, 1, web3.utils.fromAscii(""));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election currently locked", "error message with wrong value");
      }
    })
  })

  describe("add candidate", async () => {
    it("normal user failes", async () => {
      try{
        await this.election.addCandidate(web3.utils.fromAscii(this.candidate), { from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      const transaction = await this.election.addCandidate(web3.utils.fromAscii(this.candidate));
      assert.equal(web3.utils.toAscii(transaction.logs[0].args.candidateName).replace(/\0/g, ''), this.candidate);
    })

    it("candidate count incremented", async () => {
      this.newCandidateCount = await this.election.getCandidateCount();
      assert.equal(this.newCandidateCount.toNumber(), this.initCandidateCount.toNumber() + 1);
    })

    it("candidate added successfully", async () => {
      const newCandidateName = await this.election.candidateNames(this.newCandidateCount - 1);
      assert.equal(web3.utils.toAscii(newCandidateName).replace(/\0/g, ''), this.candidate);
    })

    it("list index initialized successfully", async () => {
      const candidate = await this.election.candidates(web3.utils.fromAscii(this.candidate));
      assert.notEqual(candidate[1].toNumber(), 0);
    })

    it("add candidate twice failes", async () => {
      try{
        await this.election.addCandidate(web3.utils.fromAscii(this.candidate));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "candidate already exists", "error message with wrong value");
      }
    })
  })

  describe("start election", async () => {
    it("normal user failes", async () => {
      try{
        await this.election.startElection({ from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      const transaction = await this.election.startElection();
      assert.equal(transaction.logs[0].args.newState, 1);
    })
  })

  describe("tests on open election", async () => {
    it("start election failes", async () => {
      try{
        await this.election.startElection();
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election already released", "error message with wrong value");
      }
    })

    it("add candidate failes", async () => {
      try{
        await this.election.addCandidate(web3.utils.fromAscii("Candidate 2"));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election already released", "error message with wrong value");
      }
    })
  })

  describe("vote for an candidate", async () => {
    it("vote for invalid candidate failes", async () => {
      try{
        await this.voteToken.safeTransferFrom(this.owner, this.election.address, this.electionID, 1, web3.utils.fromAscii(""));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "selected invalid candidate", "error message with wrong value");
      }
    })

    it("vote with invalid token failes", async () => {
      try{
        await this.voteToken.safeTransferFrom(this.owner, this.election.address, this.invalidElectionID, 1, web3.utils.fromAscii(this.candidate));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "token not allowed for this election", "error message with wrong value");
      }
    })

    it("vote successfully", async() => {
      const voteCountBefore = await this.election.candidates(web3.utils.fromAscii(this.candidate));
      await this.voteToken.safeTransferFrom(this.owner, this.election.address, this.electionID, 1, web3.utils.fromAscii(this.candidate));
      const voteCountAfter = await this.election.candidates(web3.utils.fromAscii(this.candidate));
      assert.equal(voteCountAfter[0].toNumber(), voteCountBefore[0].toNumber() + 1, "vote not added");
    })
  })

  describe("stop election", async () => {
    it("normal user failes", async () => {
      try{
        await this.election.stopElection({ from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      const transaction = await this.election.stopElection();
      assert.equal(transaction.logs[0].args.newState, 2);
    })
  })

  describe("tests on closed election", async () => {
    it("add candidate failes", async () => {
      try{
        await this.election.addCandidate(web3.utils.fromAscii("Candidate 2"));
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election already released", "error message with wrong value");
      }
    })

    it("start election failes", async () => {
      try{
        await this.election.startElection();
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election already released", "error message with wrong value");
      }
    })

    it("vote failes", async () => {
      try{
        await this.voteToken.safeTransferFrom(this.user, this.election.address, this.electionID, 1, web3.utils.fromAscii(""), { from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election currently locked", "error message with wrong value");
      }
    })

    it("stop election failes", async () => {
      try{
        await this.election.stopElection();
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election not open", "error message with wrong value");
      }
    })
  })

  describe("destroy election", async () => {
    it("normal user failes", async () => {
      try{
        await this.election.destroy({ from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      await this.election.destroy();
      try{
        await Election.at(this.election.address);
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "no code at address", "error message with wrong value");
      }
    })
  })
})
