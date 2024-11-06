import { PredictionMarket } from "generated";

PredictionMarket.Bearish.handler(async ({ event, context }) => {
  let roundId = event.chainId
    .toString()
    .concat("#")
    .concat(
      event.params.id
        .toString()
        .concat("#")
        .concat(event.params.roundId.toString())
    )
    .toLowerCase();
  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      chainId: BigInt(event.chainId),
      account: event.params.account.toString().toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      market_id: round.market_id,
      option: "BEARISH",
      reward: BigInt(0),
      round_id: roundId,
      share: event.params.stake,
    });

    context.Round.set({
      ...round,
      bearishShares: round.bearishShares + event.params.stake,
      totalShares: round.totalShares + event.params.stake,
    });
  }
});

PredictionMarket.Bullish.handler(async ({ event, context }) => {
  let roundId = event.chainId
    .toString()
    .concat("#")
    .concat(
      event.params.id
        .toString()
        .concat("#")
        .concat(event.params.roundId.toString())
    )
    .toLowerCase();
  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      chainId: BigInt(event.chainId),
      account: event.params.account.toString().toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      market_id: round.market_id,
      option: "BULLISH",
      reward: BigInt(0),
      round_id: roundId,
      share: event.params.stake,
    });

    context.Round.set({
      ...round,
      bullishShares: round.bullishShares + event.params.stake,
      totalShares: round.totalShares + event.params.stake,
    });
  }
});
