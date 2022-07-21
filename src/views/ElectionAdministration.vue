<template>
  <v-container>
    <v-row justify="center">
      <v-card outlined elevation="2" class="ma-3">
        <v-img
          :src="
            'https://picsum.photos/seed/' + (Number(count) + 1) + '/350/200'
          "
          height="200"
          class="white--text align-end"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        >
          <v-card-title v-text="name"> </v-card-title>
        </v-img>
      </v-card>
    </v-row>
    <v-row justify="center">
      <v-alert dense type="info">Wahlstatus: {{ electionStatusName }}</v-alert>
    </v-row>
    <v-divider class="ma-6" />
    <v-row justify="center">
      <v-col cols="12" sm="6" md="3" class="d-flex justify-center">
        <v-card outlined elevation="2" class="ma-3">
          <div class="ma-3">
            <v-text-field
              v-model="newCandidate"
              label="Kandidat"
            ></v-text-field>
            <v-btn
              color="green"
              @click="addCandidate"
              :disabled="!newCandidate || electionStatus != 0"
            >
              Kandidat hinzufügen
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-card outlined elevation="2" class="ma-3">
        <div class="ma-3">
          <v-btn
            color="green"
            :disabled="electionStatus != 0"
            class="ma-3"
            @click="startElection"
          >
            Wahl starten
          </v-btn>
          <v-btn
            color="red"
            :disabled="electionStatus != 1"
            class="ma-3"
            @click="endElection"
          >
            Wahl beenden
          </v-btn>
        </div>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import * as connect from "@/store/ethers/ethersConnect";
import Election from "@/contracts/Election.json";
import {
  addCandidate,
  startElection,
  getElectionStatus,
  stopElection,
} from "@/utils/contractUtils.js";
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["address", "name", "count"],

  data() {
    return {
      polling: null,
      newCandidate: null,
      electionStatus: null,
    };
  },

  async created() {
    if (!this.polling) {
      this.electionStatus = await getElectionStatus(this.address);
      this.polling = setInterval(async () => {
        this.electionStatus = await getElectionStatus(this.address);
      }, 5000);
    }
  },

  destroyed() {
    if (this.polling) {
      clearInterval(this.polling);
    }
  },
  computed: {
    electionStatusName: function() {
      switch (this.electionStatus) {
        case 0:
          return "Erstellt";
        case 1:
          return "Eröffnet";
        case 2:
          return "Beendet";
      }
      return "Unbekannt";
    },
  },
  methods: {
    addCandidate() {
      this.$swal({
        title: "Kandidat wird hinzugefügt",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      addCandidate(this.address, this.newCandidate)
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
            text: Object.prototype.hasOwnProperty.call(err, "data")
              ? err.data.message
              : err.message,
            icon: "error",
          })
        );
    },

    startElection() {
      this.$swal({
        title: "Wahl wird gestartet",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      startElection(this.address)
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
            text: Object.prototype.hasOwnProperty.call(err, "data")
              ? err.data.message
              : err.message,
            icon: "error",
          })
        );
    },

    endElection() {
      this.$swal({
        title: "Wahl wird beendet",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      stopElection(this.address)
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
            text: Object.prototype.hasOwnProperty.call(err, "data")
              ? err.data.message
              : err.message,
            icon: "error",
          })
        );
    },
  },
};
</script>

<style></style>
