<template>
  <v-container>
    <v-row
      class="mt-12"
      justify="center"
      v-if="!elections || elections.length == 0"
    >
      <v-alert dense type="info">
        Aktuell existieren keine Wahlen
      </v-alert>
    </v-row>
    <div v-else-if="electionContractAddress">
      <v-row justify="center">
        <v-card
          outlined
          elevation="2"
          v-for="(election, index) in elections"
          :key="index"
          @click="vote(election)"
          class="ma-3"
        >
          <v-img
            :src="'https://picsum.photos/seed/' + (index + 1) + '/350/200'"
            height="200"
            class="white--text align-end"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
          >
            <v-card-title v-text="election.name"> </v-card-title>
            <v-card-subtitle class="white--text"
              >Verfügbare Stimmen:
              {{ availableVotes[election.address] }}</v-card-subtitle
            >
          </v-img>
        </v-card>
      </v-row>
    </div>
    <div v-else>
      Keine Wahlen verfügbar
    </div>
  </v-container>
</template>

<script>
import ElectionFactory from "@/contracts/ElectionFactory.json";
import { mapGetters, mapActions } from "vuex";
import { getVoteTokenCount, claimVoteToken } from "@/utils/contractUtils.js";
export default {
  data: () => ({ availableVotes: new Object(), polling: null }),

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
      this.fetchAvailableVotes();
      this.polling = setInterval(async () => {
        this.fetchAvailableVotes();
      }, 3000);
    }
  },

  destroyed() {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = null;
    }
  },
  methods: {
    vote(election) {
      this.$router.push({
        name: "Election",
        params: {
          address: election.address,
          name: election.name,
        },
      });
    },
    async fetchAvailableVotes() {
      if (!this.elections) return;
      for (var election of this.elections) {
        this.$set(
          this.availableVotes,
          election.address,
          await getVoteTokenCount(
            this.voteTokenContractAddress,
            election.address
          )
        );
      }
    },
  },
};
</script>

<style></style>
