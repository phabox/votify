<template>
  <v-container>
    <div>
      <v-row justify="center">
        <v-col cols="12" sm="6" md="3">
          <v-text-field v-model="name" label="Name"></v-text-field>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-btn
          color="green"
          :disabled="name == null || name == ''"
          @click="createElection"
        >
          Wahl erstellen
        </v-btn>
      </v-row>
      <v-divider class="mt-12 mb-6" />
      <div v-if="electionContractAddress">
        <v-row justify="center">
          <v-card
            outlined
            elevation="2"
            v-for="(election, index) in elections"
            :key="index"
            @click="editElection(election, index)"
            class="ma-3"
          >
            <v-img
              :src="'https://picsum.photos/seed/' + (index + 1) + '/350/200'"
              height="200"
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            >
              <v-card-title v-text="election.name"> </v-card-title>
            </v-img>
          </v-card>
        </v-row>
      </div>
      <div v-else>
        Keine Wahlen verfügbar
      </div>
    </div>
  </v-container>
</template>

<script>
import { createElection } from "@/utils/contractUtils.js";
import * as ethers from "ethers";
import { mapGetters } from "vuex";
export default {
  data: () => ({
    name: null,
  }),

  computed: {
    ...mapGetters("administration", [
      "electionFactoryContractAddress",
      "electionContractAddress",
    ]),
    ...mapGetters("voting", ["elections"]),
  },

  methods: {
    editElection(election, index) {
      this.$router.push({
        name: "ElectionAdministration",
        params: {
          address: election.address,
          name: election.name,
          count: index,
        },
      });
    },
    createElection() {
      this.$swal({
        title: "Wahl wird erstellt",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      createElection(this.electionFactoryContractAddress, this.name)
        .then((transaction) =>
          this.$swal({
            title: "Auftrag angelegt",
            text: "Transaktion: " + transaction.hash,
            icon: "success",
          })
        )
        .catch((err) =>
          this.$swal({
            title: "Fehler",
            text: Object.prototype.hasOwnProperty.call(err, "data") ? err.data.message : err.message,
            icon: "error",
          })
        );
    },
  },
};
</script>

<style></style>
