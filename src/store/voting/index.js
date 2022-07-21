import { getElections } from "@/utils/contractUtils.js";

export default {
  namespaced: true,
  state: () => ({
    elections: null,
    hasVoted: false,
  }),
  getters: {
    elections: (state) => state.elections,
    hasVoted: (state) => state.hasVoted,
  },
  mutations: {
    setHasVoted(state, value) {
      state.hasVoted = value;
    },
    setElections(state, value) {
      state.elections = value;
    },
  },

  actions: {
    async fetchElections(ctx) {
      ctx.commit(
        "setElections",
        await getElections(
          ctx.rootState.administration.electionFactoryContractAddress
        )
      );
    },
  },
};
