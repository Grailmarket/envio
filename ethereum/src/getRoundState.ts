import axios from "axios";

const EMITTER_CHAIN_ID = 39; // Berachain
const EMITTER_ADDRESS = "0xDD1b2F2D4D04eeb992225F54ca174FD2B0E46a5D";

export async function getRoundState(sequenceId: number) {
  try {
    const QUERY_URL = `https://api.wormholescan.io/api/v1/vaas/${EMITTER_CHAIN_ID}/${EMITTER_ADDRESS}/${sequenceId}`;
    const response = await axios.get<{ data: { vaa: string } }>(QUERY_URL);
    const data = Buffer.from(response.data.data.vaa, "base64");

    return data.toString("hex");
  } catch (error) {
    return "";
  }
}
