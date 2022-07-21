const VoteToken = artifacts.require("./VoteToken.sol");

contract("VoteToken", (accounts) => {
  before(async () => {
    this.voteToken = await VoteToken.deployed();
    this.deployer = accounts[0];
    this.electionAddress = accounts[1];
    this.user = accounts[2];
  })

  afterEach(async () => {
    try{
      await this.voteToken.delElection(this.electionAddress);
    }
    catch(error){}
  })

  describe("initialization", async () => {
    it("deploys successfully", async () => {
      const address = await this.voteToken.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    })
  })

  describe("add election", async () => {
    it("adds election successfully", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.getID(this.electionAddress);
        assert(true);
      }
      catch(error){
        assert(false, "election has not been added");
      }
    })

    it("fails for normal user", async () => {
      try{
        await this.voteToken.addElection(this.electionAddress, {from:this.user});
        assert.fail("function only for owner");
      }
      catch(error){
        assert(true);
      }
    })

    it("fails, when election is already existing", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.addElection(this.electionAddress);
        assert.fail("election is already existing");
      }
      catch(error){
        assert(true);
      }
    })
  })

  describe("delete election", async () => {
    it("deletes election successfully", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.delElection(this.electionAddress);
      try{
        await this.voteToken.getID(this.electionAddress);
        assert(false, "election was not deleted");
      }
      catch(error){
        assert(true);
      }
    })

    it("fails for normal user", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.delElection(this.electionAddress);
        assert(false, "function only for owner");
      }
      catch(error){
        assert(true);
      }
    })

    it("fails, when election does not exist", async () => {
      try{
        await this.voteToken.delElection(this.electionAddress);
        assert(false, "election does not exist");
      }
      catch(error){
        assert(true);
      }
    })
  })
  
  describe("get VoteToken", async () => {
    it("changes the balance of tokens", async () => {
      await this.voteToken.addElection(this.electionAddress);
      var electionId = await this.voteToken.getID(this.electionAddress);
      var balanceBefore = await this.voteToken.balanceOf(this.deployer, electionId);
      await this.voteToken.getVoteToken(this.electionAddress);
      var balanceAfter = await this.voteToken.balanceOf(this.deployer, electionId);
      assert.equal(balanceBefore.toNumber() + 1, balanceAfter.toNumber(), "balance is invalid");
    })  

    it("emits TransferSingle", async () => {
      await this.voteToken.addElection(this.electionAddress);
      var eventLog = await this.voteToken.getVoteToken(this.electionAddress);
      assert.equal("TransferSingle", eventLog.logs[0].event, "TransferSingle is not emitted");
    })  

    it("fails for more than one requests", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      try{
        await this.voteToken.getVoteToken(this.electionAddress);
        assert(false, "more than one request");
      }
      catch(error){
        assert(true);
      }
    })

    it("fails, when election does not exist", async () => {
      try{
        await this.voteToken.getVoteToken(this.electionAddress);
        assert(false, "election does not exist");
      }
      catch(error){
        assert(true);
      }
    })
  })

  describe("delegates VoteToken", async () => {
    it("fails, when receiver is wrong", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var eventLog = await this.voteToken.delegateVoteToken(this.electionAddress, this.user);
      assert.equal(this.user, eventLog.logs[0].args.to, "unkown receiver");
    })

    it("changes the balance of tokens", async () => {
      await this.voteToken.addElection(this.electionAddress);
      var electionId = await this.voteToken.getID(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var balanceBefore = await this.voteToken.balanceOf(this.user, electionId);
      await this.voteToken.delegateVoteToken(this.electionAddress, this.user);
      var balanceAfter = await this.voteToken.balanceOf(this.user, electionId);
      assert.equal(balanceBefore.toNumber() + 1, balanceAfter.toNumber(), "balance is invalid");
    })  

    it("emits TransferSingle", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var eventLog = await this.voteToken.delegateVoteToken(this.electionAddress, this.user);
      assert.equal("TransferSingle", eventLog.logs[0].event, "TransferSingle is not emitted");
    }) 

    it("fails, when sender has not enough tokens", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.delegateVoteToken(this.electionAddress, this.user);
        assert(false, "sender has not enough tokens");
      }
      catch(error){
        assert(true);
      }
    })

    it("fails, when election does not exist", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      await this.voteToken.delElection(this.electionAddress);
      try{
        await this.voteToken.delegateVoteToken(this.electionAddress, this.user);
        assert(false, "election does not exist");
      }
      catch(error){
        assert(true);
      }
    })
  })

  describe("get ID of election", async () => {
    it("gets ID successfully", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.getID(this.electionAddress);
        assert(true);
      }
      catch(error){
        assert(false, "ID has not been returned");
      }
    })

    it("fails, when election does not exist", async () => {
      try{
        await this.voteToken.getID(this.electionAddress);
        assert(false, "election does not exist");
      }
      catch(error){
        assert(true);
      }
    })
  })

  describe("transfers VoteToken", async () => {
    it("changes balances of operator and receiver", async () => {
      await this.voteToken.addElection(this.electionAddress);
      var electionId = await this.voteToken.getID(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var balanceBeforeUser = await this.voteToken.balanceOf(this.user, electionId);
      var balanceBeforeDeployer = await this.voteToken.balanceOf(this.deployer, electionId);
      var metadata = await this.voteToken.address;
      await this.voteToken.safeTransferFrom(this.deployer, this.user, electionId, 1, metadata);
      var balanceAfterUser = await this.voteToken.balanceOf(this.user, electionId);
      var balanceAfterDeployer = await this.voteToken.balanceOf(this.deployer, electionId);
      assert.equal(balanceBeforeUser.toNumber()+1, balanceAfterUser.toNumber(), "balance of receiver did not change");
      assert.equal(balanceBeforeDeployer.toNumber(), balanceAfterDeployer.toNumber()+1, "balance of sender did not change");
    })

    it("fails, when receiver is wrong", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var eventLog = await this.voteToken.safeTransferFrom(this.deployer, this.user, 
        await this.voteToken.getID(this.electionAddress), 1, await this.voteToken.address);
      assert.equal(this.user, eventLog.logs[0].args.to, "unkown receiver");
    })

    it("fails, when sender has not enough Token", async () => {
      await this.voteToken.addElection(this.electionAddress);
      try{
        await this.voteToken.safeTransferFrom(this.deployer, this.user, 
          await this.voteToken.getID(this.electionAddress), 1, await this.voteToken.address);
        assert(false, "operator is not approved");
      }
      catch (error){
        assert(true);
      }
    })

    it("fails, when operator is not approved", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      try{
        await this.voteToken.safeTransferFrom(this.user, accounts[5], 
          await this.voteToken.getID(this.electionAddress), 1, await this.voteToken.address);
        assert(false, "operator is not approved");
      }
      catch (error){
        assert(true);
      }
    })
  })

  describe("balance of Tokens", async () => {
    it("gets balance successfully", async () => {
      await this.voteToken.addElection(this.electionAddress);
      await this.voteToken.getVoteToken(this.electionAddress);
      var balanceDeployer = await this.voteToken.balanceOf(this.deployer, await this.voteToken.getID(this.electionAddress));
      assert.equal(balanceDeployer, 1, "balance is not correct");
    })
  })
})
