<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-spacer />
      <v-img
        alt="Vuetify Logo"
        class="shrink mr-2"
        contain
        src="https://image.flaticon.com/icons/png/512/95/95375.png"
        transition="scale-transition"
        width="40"
      />
      <h2>Votify</h2>
      <v-spacer />
    </v-app-bar>

    <v-main>
      <router-view v-if="connected"> </router-view>
      <MetaMaskPrompt v-else />
    </v-main>

    <v-bottom-navigation app color="primary">
      <v-btn to="/electionOverview">
        <span>Vote</span>
        <v-icon>mdi-vote</v-icon>
      </v-btn>
      <v-btn to="/claimVote">
        <span>Stimme beantragen</span>
        <v-icon>mdi-hand-heart-outline</v-icon>
      </v-btn>
      <v-btn to="/administrationOverview">
        <span>Administration</span>
        <v-icon>mdi-account-cog</v-icon>
      </v-btn>
      <v-btn to="/about">
        <span>About</span>

        <v-icon>mdi-comment-question</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import MetaMaskPrompt from "./components/shared/MetaMaskPrompt";
import ElectionOverview from "./views/ElectionOverview";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "App",

  mounted() {},

  components: {
    MetaMaskPrompt,
  },

  data: () => ({
    polling: null,
  }),

  computed: {
    ...mapGetters("ethers", ["connected"]),
    ...mapGetters("administration", [
      "electionFactoryContractAddress",
      "electionContractAddress",
    ]),
    ...mapGetters("voting", ["elections"]),
  },

  methods: {
    ...mapActions("voting", ["fetchElections"]),

    pollElections() {
      if (this.electionContractAddress && this.electionFactoryContractAddress) {
        this.fetchElections();
      }
    },
  },

  watch: {
    electionContractAddress(newValue) {
      if (newValue && this.polling == null) {
        this.fetchElections();
        this.polling = setInterval(() => this.pollElections(), 5000);
      } else {
        this.polling = null;
        clearInterval(this.polling);
      }
    },
  },

  beforeDestroy() {
    clearInterval(this.polling);
  },
};
</script>

<style>
body {
  font-family: "Roboto";
}
</style>

<style scoped>
a {
  color: white;
}
.active {
  border-bottom: white solid 1px;
}
</style>
