const Election = artifacts.require("./Election.sol");
const VoteToken = artifacts.require("./VoteToken.sol");
const ElectionFactory = artifacts.require("./ElectionFactory.sol");

contract("ElectionFactory", (accounts) => {
  before(async () => {
    this.user = accounts[1];
    this.owner = accounts[0];
    this.electionName = "Wahl1";
    this.voteToken = await VoteToken.deployed();
    this.electionlibrary = await Election.deployed();
    this.electionFactory = await ElectionFactory.deployed();
  })

  describe("initialization", async () => {
    it("deploys successfully", async () => {
      const address = await this.electionFactory.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    })

    it("libraryAddress initialized successfully", async () => {
      const libraryAddress = await this.electionFactory.libraryAddress();
      assert.equal(libraryAddress, this.electionlibrary.address);
    })

    it("voteToken initialized successfully", async () => {
      const tokenAddress = await this.electionFactory.getTokenAddress();
      assert.equal(tokenAddress, this.voteToken.address);
    })

    it("election list initialized empty", async () => {
      this.initElectionCount = await this.electionFactory.getElectionCount();
      assert.equal(this.initElectionCount.toNumber(), 0);
    })
  })

  describe("set library address", async () => {
    it("normal user failes", async () => {
      try{
        await this.electionFactory.setLibraryAddress(this.electionlibrary.address, { from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      await this.electionFactory.setLibraryAddress(this.voteToken.address);
      const newAddress = await this.electionFactory.libraryAddress();
      assert.equal(newAddress, this.voteToken.address);
      await this.electionFactory.setLibraryAddress(this.electionlibrary.address);
    })
  })

  describe("create election", async () => {
    it("normal user failes", async () => {
      try{
        await this.electionFactory.createElection(web3.utils.fromAscii(this.electionName), { from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("owner successfull", async () => {
      const transaction = await this.electionFactory.createElection(web3.utils.fromAscii(this.electionName));
      this.newElectionAddress = transaction.logs[0].args.contractAddress;
      assert.notEqual(this.newElectionAddress, 0x0);
    })

    it("election count incremented", async () => {
      this.newElectionCount = await this.electionFactory.getElectionCount();
      assert.equal(this.newElectionCount.toNumber(), this.initElectionCount.toNumber() + 1);
    })

    it("election added successfully", async () => {
      const newElectionAddress = await this.electionFactory.electionAdresses(this.newElectionCount - 1);
      assert.equal(newElectionAddress, this.newElectionAddress);
    })

    it("election name set successfully", async () => {
      const electionContract = await this.electionFactory.elections(this.newElectionAddress);
      assert.equal(web3.utils.toAscii(electionContract[0]).replace(/\0/g, ''), this.electionName);
    })

    it("list index initialized successfully", async () => {
      const electionContract = await this.electionFactory.elections(this.newElectionAddress);
      assert.notEqual(electionContract[1].toNumber(), 0);
    })

    it("create new instance successfully", async () => {
      const newElection = await Election.at(this.newElectionAddress);
      const candidatesCount = await newElection.getCandidateCount();
      assert.equal(candidatesCount, 0, "example contract call failed");
    })

    it("election added to token successfully", async () => {
      const electionID = await this.voteToken.getID(this.newElectionAddress);
      assert.notEqual(electionID.toNumber(), 0);
    })
  })

  describe("delete election", async () => {
    it("normal user failes", async () => {
      try{
        await this.electionFactory.deleteElection(this.newElectionAddress, { from: this.user });
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "function only for owner", "error message with wrong value");
      }
    })

    it("invalid address failes", async () => {
      try{
        await this.electionFactory.deleteElection(this.voteToken.address);
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "invalid election", "error message with wrong value");
      }
    })

    it("open election failes", async () => {
      const election = await Election.at(this.newElectionAddress);
      await election.addCandidate(web3.utils.fromAscii("Kandidat 1"));
      await election.startElection();
      try{
        await this.electionFactory.deleteElection(this.newElectionAddress);
        assert.fail("exception excepted");
      }
      catch(error){
        assert.include(error.message, "election currently open", "error message with wrong value");
      }
      finally
      {
        await election.stopElection();
      }
    })

    it("owner successfull", async () => {
      const transaction = await this.electionFactory.deleteElection(this.newElectionAddress);
      this.deletedElectionAddress = transaction.logs[0].args.contractAddress;
      assert.equal(this.deletedElectionAddress, this.newElectionAddress);
    })

    it("election count decremented", async () => {
      this.newElectionCount = await this.electionFactory.getElectionCount();
      assert.equal(this.newElectionCount.toNumber(), this.initElectionCount.toNumber());
    })

    it("election name reset successfully", async () => {
      const electionContract = await this.electionFactory.elections(this.deletedElectionAddress);
      assert.equal(web3.utils.toAscii(electionContract[0]).replace(/\0/g, ''), "");
    })

    it("list index reset successfully", async () => {
      const electionContract = await this.electionFactory.elections(this.deletedElectionAddress);
      assert.equal(electionContract[1], 0);
    })

    it("create instance failes", async () => {
      try{
        const electionContract = await Election.at(this.deletedElectionAddress);
        assert.fail("exception excepted");
      }
      catch(error)
      {
        assert.include(error.message, "no code at address", "error message with wrong value");
      }
    })

    it("election deleted from token successfully", async () => {
      try{
        const electionID = await this.voteToken.getID(this.deletedElectionAddress);
        assert.fail("exception excepted");
      }
      catch(error)
      {
        assert.include(error.message, "Election does not exist", "error message with wrong value");
      }
    })
  })
})
