<template>
  <div class="text-center">
    <h1>Um Votify zu nutzen, muss MetaMask installiert und verbunden sein</h1>
    <v-spacer />
    <v-btn color="primary" @click="init()">
      Connect
    </v-btn>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  methods: {
    ...mapActions({ init: "ethers/connectMetaMask" }),
  },
};
</script>

<style></style>
