<template>
  <div>
    <v-row justify="center">
      <v-alert class="ma-2" icon="mdi-account" outlined type="success">{{
        address
      }}</v-alert>
    </v-row>
    <v-row justify="center">
      <v-alert class="ma-2" icon="mdi-account-cash" outlined type="success"
        >{{ balance }} ETH</v-alert
      >
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
    };
  },
  created() {

  },
  computed: {
    ...mapGetters("ethers", ["balance", "address"]),
  },
};
</script>

<style></style>
