import {
  type EthCallData,
  EthCallQueryRequest,
  PerChainQueryRequest,
  QueryRequest,
} from "@wormhole-foundation/wormhole-query-sdk";
import { encodeFunctionData, Hex } from "viem";
import axios from "axios";

type QueryResponse = {
  signatures: string[];
  bytes: string;
};

const abi = [
  {
    type: "function",
    name: "getRoundState",
    inputs: [
      { name: "id", type: "bytes32", internalType: "MarketId" },
      { name: "roundId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "m",
        type: "tuple",
        internalType: "struct Market.RoundState",
        components: [
          { name: "id", type: "bytes32", internalType: "MarketId" },
          { name: "roundId", type: "uint64", internalType: "uint64" },
          { name: "rewardPool", type: "uint64", internalType: "uint64" },
          { name: "winningShares", type: "uint64", internalType: "uint64" },
          { name: "entryClosingTime", type: "uint48", internalType: "uint48" },
          { name: "minStakeAmount", type: "uint64", internalType: "uint64" },
          { name: "winningSide", type: "uint8", internalType: "Option" },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Market.RoundStatus",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

// const GRAIL_MARKET_MANAGER_ADDRESS = String(
//   process.env.GRAIL_MARKET_MANAGER_ADDRESS
// ) as Hex;
// const WORMHOLE_QUERY_ENDPOINT = String(process.env.WORMHOLE_QUERY_ENDPOINT);
// const WORMHOLE_QUERY_API_KEY = String(process.env.WORMHOLE_QUERY_API_KEY);

const GRAIL_MARKET_MANAGER_ADDRESS = "0x09791631F856B699aCEE7C66FB54e0D4aCaF56e5";
const WORMHOLE_QUERY_ENDPOINT = "https://testnet.query.wormhole.com/v1/query";
const WORMHOLE_QUERY_API_KEY = "48a688a0-8096-4ebb-ba14-6bcdce107e3c";

export async function getRoundState(
  marketId: string,
  roundId: bigint,
  blockNum: number
) {
  const callData: EthCallData = {
    to: GRAIL_MARKET_MANAGER_ADDRESS,
    data: encodeFunctionData({
      abi,
      functionName: "getRoundState",
      args: [marketId as Hex, roundId],
    }),
  };

  const qrs = new QueryRequest(1, [
    new PerChainQueryRequest(
      6, // wormhole chainId for Avalanche
      new EthCallQueryRequest(blockNum, [callData])
    ),
  ]);

  const serialized = Buffer.from(qrs.serialize()).toString("hex");

  const response = await axios.put<QueryResponse>(
    WORMHOLE_QUERY_ENDPOINT,
    {
      bytes: serialized,
    },
    { headers: { "X-API-Key": WORMHOLE_QUERY_API_KEY } }
  );

  const rs = response.data.bytes
    .concat(":")
    .concat(response.data.signatures.join(";"));

  return {
    response: `0x${rs}`,
  };
}
