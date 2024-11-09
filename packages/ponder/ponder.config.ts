import { createConfig } from "@ponder/core";
import { http } from "viem";
import { StreamAbi } from "./abis/StreamAbi";
import { optimism } from "viem/chains";

// TODO: Use acltual env var for this
const providerApiKey = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export default createConfig({
  networks: {
    optimism: {
      chainId: optimism.id,
      transport: http(`https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`),
    },
  },
  contracts: {
    StreamContract: {
      abi: StreamAbi,
      address: "0xDcc5DF3Ca0ECa3B78c56b9134Df293B616f26371",
      network: "optimism",
      startBlock: 127774736,
    },
  },
});
