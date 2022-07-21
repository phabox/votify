import Vue from "vue";
import Vuex from "vuex";
import ethers from "./ethers";
import voting from "./voting";
import administration from "./administration";
Vue.use(Vuex);
export default new Vuex.Store({
  modules: { ethers, voting, administration },
});
