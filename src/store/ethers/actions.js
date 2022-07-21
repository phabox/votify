/* eslint-disable */
import {
  MSGS,
  EVENT_CHANNEL,
  connect,
  event,
  ready,
  getProvider,
  getWallet,
  getWalletAddress,
  getNetName,
  hasEns,
} from "./ethersConnect";
import { utils } from "ethers";
export default {
  async connectMetaMask(ctx) {
    await connect();
  },

  async connect(ctx) {
    try {
      const oldAddress = ctx.state.address;
      const oldNetwork = ctx.state.network;

      const provider = getProvider();
      if (!provider) throw new Error(MSGS.NOT_CONNECTED);

      const wallet = getWallet();
      if (!wallet) throw new Error(MSGS.NO_WALLET);
      const address = await getWalletAddress();
      const network = await getNetName();

      if (network !== oldNetwork || address !== oldAddress) {
        ctx.commit("connected", true);
        ctx.commit("error", null);
        ctx.commit("address", address);
        ctx.commit("user", address);
        ctx.commit("network", network);
        ctx.commit(
          "balance",
          utils.formatUnits(await wallet.getBalance(), "ether")
        );

        ctx.dispatch("administration/updateContractAddresses", null, {
          root: true,
        });

        const msg =
          oldAddress && oldAddress !== address
            ? `Your Ethereum address/user has changed.
          Address: ${address}
          Network: ${network}
          Gas Price: ${await provider.getGasPrice()}
          Current Block #: ${await provider.getBlockNumber()}
          Your ether balance: ${await provider.getBalance(address)}`
            : `You are connected to the Ethereum Network.
          Address: ${address}
          Network: ${network}
          Gas Price: ${await provider.getGasPrice()}
          Current Block #: ${await provider.getBlockNumber()}
          Your ether balance: ${await provider.getBalance(address)}
          If you change your address or network, this app will update automatically.`;
        console.log(msg);

        // Other vuex stores can wait for this
        event.$emit(EVENT_CHANNEL, MSGS.ETHERS_VUEX_READY);

        // now check for .eth address too
        if (await hasEns()) {
          console.log("Net supports ENS. Checking...");
          ctx.commit("ens", await provider.lookupAddress(address));
          if (ctx.state.ens) {
            ctx.commit("user", ens);
          }
        }

        provider.on("block", (blockNumber) => {
          console.log("Block mined:", blockNumber);
        });

      }
    } catch (err) {
      console.log(err);
      ctx.dispatch("disconnect", err);
    }
  },
  async disconnect(ctx, err) {
    const oldAddress = ctx.state.address;
    ctx.commit("connected", false);
    ctx.commit("error", err);
    ctx.commit("address", "");
    ctx.commit("user", "");
    ctx.commit("network", "");
    ctx.commit("ens", null);

    const msg = err
      ? `There was an error: ${err.message}`
      : oldAddress
      ? "You have been disconnected from your Ethereum connection. Please check MetaMask, etc."
      : "You are not connected to an Ethereum node and wallet. Please check MetaMask, etc.";
    console.log(msg);
  },
  async logout(ctx) {
    ctx.commit("address", "");
    ctx.commit("user", "");
    ctx.commit("connected", false);
    console.log("You have been logged out from your Ethereum connection");
  },
  async notConnected(ctx) {
    ctx.commit("address", "");
    ctx.commit("user", "");
    ctx.commit("connected", false);
    console.log(
      "You are not connected to the Ethereum network. Please check MetaMask,etc."
    );
  },
  async init(ctx) {
    event.$on(EVENT_CHANNEL, async function(msg) {
      console.log("Ethers event received", msg);
      switch (msg) {
        case MSGS.NOT_READY:
          await ctx.dispatch("disconnect");
          break;
        case MSGS.NO_WALLET:
          await ctx.dispatch("logout");
          break;
        case MSGS.ACCOUNT_CHANGED:
          await ctx.dispatch("connect");
          break;
        case MSGS.NOT_CONNECTED:
          await ctx.dispatch("notConnected");
          break;
      }
    });

    if (ready()) {
      await ctx.dispatch("connect");
      event.$emit(EVENT_CHANNEL, MSGS.ETHERS_VUEX_INITIALIZED);
      ctx.commit("initialized", true);
    }
  },
};
