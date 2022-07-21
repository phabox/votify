import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/electionOverview" },
  {
    path: "/electionOverview",
    name: "ElectionOverview",
    component: () => import("../views/ElectionOverview.vue"),
  },
  {
    path: "/election/:address/:name",
    name: "Election",
    component: () => import("../views/Election.vue"),
    props: true,
  },
  {
    path: "/administrationOverview",
    name: "AdministrationOverview",
    component: () => import("../views/AdministrationOverview.vue"),
  },
  {
    path: "/electionAdministration/:address/:name/:count",
    name: "ElectionAdministration",
    component: () => import("../views/ElectionAdministration.vue"),
    props: true,
  },
  {
    path: "/claimVote",
    name: "ClaimVote",
    component: () => import("../views/ClaimVote.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
