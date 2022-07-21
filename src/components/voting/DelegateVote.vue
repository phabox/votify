<template>
  <div>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="5">
        <v-text-field v-model="delegateAddress" label="Adresse"></v-text-field>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-btn
        large
        color="success"
        :disabled="electionStatus != 1 || availableVotes == 0"
        @click="delegateVote"
      >
        <v-icon left>mdi-vote</v-icon>
        Stimme delegieren
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { delegateVote } from "@/utils/contractUtils.js";
export default {
  props: ["electionStatus", "electionAddress", "availableVotes"],
  data() {
    return {
      delegateAddress: null,
    };
  },

  methods: {
    delegateVote() {
      this.$swal({
        title: "Stimme wird delegiert",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      delegateVote(this.electionAddress, this.delegateAddress)
        .then(() =>
          this.$swal({
            title: "Erfolg",
            text: "Stimme erfolgreich delegiert",
            icon: "success",
          })
        )
        .catch((err) => {
          this.$swal({
            title: "Fehler",
            text: err,
            icon: "error",
          });
        });
    },
  },
};
</script>

<style></style>
