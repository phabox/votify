<template>
  <div>
    <v-row class="mt-6" justify="center" v-if="candidates.length == 0"
      >Keine Kandidaten vefügbar</v-row
    >
    <v-row class="justify-center" v-else>
      <v-card
        outlined
        elevation="2"
        v-for="(candidate, index) in candidates"
        :key="index"
        class="ma-3"
      >
        <div class="d-flex">
          <div>
            <v-card-title
              class="headline"
              v-text="candidate.name"
            ></v-card-title>

            <v-card-text>
              Stimmen: {{ candidate.voteCount }}
              <v-progress-linear
                :value="calculatePercentage(candidate)"
                height="25"
              >
                <template v-slot="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
            </v-card-text>
            <v-card-actions>
              <v-btn
                @click="vote(candidate)"
                class="ml-2 mt-5 text-center"
                color="success"
                :disabled="electionStatus != 1 || availableVotes == 0"
              >
                <v-icon left>mdi-vote</v-icon>
                Wählen
              </v-btn>
            </v-card-actions>
          </div>

          <v-avatar class="ma-3" size="125" tile>
            <v-img
              :src="
                'https://randomuser.me/api/portraits/women/' + index + '.jpg'
              "
            ></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-row>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { vote } from "@/utils/contractUtils.js";
export default {
  props: ["candidates", "electionAddress", "electionStatus", "availableVotes"],
  data: () => ({}),
  computed: {
    ...mapGetters("voting", ["hasVoted"]),
    totalVotes() {
      return this.candidates.map((c) => c.voteCount).reduce((a, b) => a + b, 0);
    },
  },

  methods: {
    ...mapMutations("voting", ["setHasVoted"]),
    vote(candidate) {
      this.$swal({
        title: "Stimme wird abgegeben",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          this.$swal.showLoading();
        },
      });
      vote(this.electionAddress, candidate.name)
        .then(() =>
          this.$swal({
            title: "Erfolg",
            text: "Stimme erfolgreich abgegeben",
            icon: "success",
          })
        )
        .catch((err) => {
          this.$swal({
            title: "Fehler",
            text: Object.prototype.hasOwnProperty.call(err, "data")
              ? err.data.message
              : err.message,
            icon: "error",
          });
        });
    },
    calculatePercentage(candidate) {
      return this.totalVotes === 0
        ? 0
        : Math.floor((candidate.voteCount * 100) / this.totalVotes);
    },
  },
};
</script>

<style></style>
