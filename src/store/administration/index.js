import { getNetworkAddress } from "../ethers/ethersConnect";
import ElectionFactory from "@/contracts/ElectionFactory.json";
import Election from "@/contracts/Election.json";
import VoteToken from "@/contracts/VoteToken.json";
export default {
  namespaced: true,
  state: () => ({
    electionFactoryContractAddress: null,
    electionContractAddress: null,
    voteTokenContractAddress: null,
  }),
  getters: {
    electionFactoryContractAddress: (state) =>
      state.electionFactoryContractAddress,
    electionContractAddress: (state) => state.electionContractAddress,
    voteTokenContractAddress: (state) => state.voteTokenContractAddress,
  },
  mutations: {
    setElectionFactoryContractAddress: function(state, value) {
      state.electionFactoryContractAddress = value;
    },
    setElectionContractAddress: function(state, value) {
      state.electionContractAddress = value;
    },
    setVoteTokenContractAddress: function(state, value) {
      state.voteTokenContractAddress = value;
    },
  },
  actions: {
    async updateContractAddresses(ctx) {
      ctx.commit(
        "setElectionFactoryContractAddress",
        await getNetworkAddress(ElectionFactory["networks"])
      );
      ctx.commit(
        "setElectionContractAddress",
        await getNetworkAddress(Election["networks"])
      );
      ctx.commit(
        "setVoteTokenContractAddress",
        await getNetworkAddress(VoteToken["networks"])
      );
    },
  },
};
