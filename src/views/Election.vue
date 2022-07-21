<template>
  <v-container>
    <v-row justify="center" v-if="electionStatus == 0">
      <v-alert dense type="warning">
        Die Wahl wurde noch nicht eröffnet
      </v-alert>
    </v-row>
    <v-row justify="center" v-else-if="electionStatus == 2">
      <v-alert dense type="warning">
        Die Wahl wurde bereits beendet
      </v-alert>
    </v-row>
    <v-row justify="center">
      <v-alert dense type="info"
        >Verfügbare Stimmen: {{ availableVotes }}</v-alert
      >
    </v-row>
    <v-tabs centered>
      <v-tab href="#DirectVote">
        Stimme abgeben
      </v-tab>
      <v-tab-item id="DirectVote">
        <DirectVote
          :candidates="candidates"
          :electionAddress="address"
          :electionStatus="electionStatus"
          :availableVotes="availableVotes"
        />
      </v-tab-item>

      <v-tab href="#DelegateVote">
        Stimme delegieren
      </v-tab>
      <v-tab-item id="DelegateVote">
        <DelegateVote
          :electionAddress="address"
          :electionStatus="electionStatus"
          :availableVotes="availableVotes"
        />
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import DirectVote from "../components/voting/DirectVote";
import DelegateVote from "../components/voting/DelegateVote";
import { utils } from "ethers";
import { mapGetters } from "vuex";
import {
  getCandidatesWithVotes,
  getVotesForCandidate,
  getElectionStatus,
  getElectionContract,
  getVoteTokenCount,
} from "@/utils/contractUtils.js";
export default {
  components: {
    DirectVote,
    DelegateVote,
  },

  props: ["address", "name"],

  data() {
    return {
      polling: null,
      currentTab: null,
      candidates: [],
      electionStatus: null,
      availableVotes: null,
      electionContract: null,
    };
  },

  computed: {
    ...mapGetters("administration", [
      "electionFactoryContractAddress",
      "electionContractAddress",
      "voteTokenContractAddress",
    ]),
    ...mapGetters("voting", ["elections"]),
  },

  async created() {
    if (!this.polling) {
      this.candidates = await getCandidatesWithVotes(this.address);
      this.electionStatus = await getElectionStatus(this.address);
      this.availableVotes = await getVoteTokenCount(
        this.voteTokenContractAddress,
        this.address
      );
      this.polling = setInterval(async () => {
        this.electionStatus = await getElectionStatus(this.address);
        this.availableVotes = await getVoteTokenCount(
          this.voteTokenContractAddress,
          this.address
        );
      }, 5000);
    }

    this.electionContract = getElectionContract(this.address);
    this.electionContract.on("voteAdded", (candidate) => {
      const candidateName = utils.parseBytes32String(candidate);
      for (var i = 0; i < this.candidates.length; i++) {
        if (this.candidates[i].name == candidateName) {
          this.$set(
            this.candidates[i],
            "voteCount",
            this.candidates[i].voteCount + 1
          );
        }
      }
    });
  },

  destroyed() {
    if (this.polling) {
      clearInterval(this.polling);
    }
    this.electionContract.removeAllListeners();
  },
};
</script>

<style></style>
