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

PredictionMarket.CancelRound.handler(async ({ event, context }) => {
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

  let round = await context.Round.get(roundId);
  if (round !== undefined) {
    context.Round.set({
      ...round,
      status: "CANCELLED",
    });
  }
});

PredictionMarket.ClaimRefund.handler(async ({ event, context }) => {
  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toString())
    .toLowerCase();

  let prediction = await context.Position.get(positionId);

  if (prediction !== undefined) {
    context.Position.set({
      ...prediction,
      reward: event.params.stake,
      claimed: true,
    });
  }
});

PredictionMarket.CreateMarket.handler(async ({ event, context }) => {
  let marketId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.id.toString())
    .toLowerCase();

  let market = await context.Market.get(marketId);
  const DEFAULT_PROTOCOL_FEE_BPS = BigInt(1000); // 10%

  if (market === undefined) {
    context.Market.set({
      id: marketId,
      chainId: BigInt(event.chainId),
      oracleId: event.params.id.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      duration: event.params.duration,
      currency: event.params.currency,
      protocolFee: DEFAULT_PROTOCOL_FEE_BPS,
      incentiveFee: DEFAULT_PROTOCOL_FEE_BPS,
      minShareAmount: BigInt(0),
      paused: false,
    });
  }
});

PredictionMarket.NewRound.handler(async ({ event, context }) => {
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
  let marketId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.id.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);
  if (round === undefined) {
    context.Round.set({
      id: roundId,
      chainId: BigInt(event.chainId),
      roundId: event.params.roundId,
      market_id: marketId,
      openingTime: event.params.openingTime,
      closingTime: event.params.closingTime,
      priceMark: BigInt(0),
      closingPrice: BigInt(0),
      bearishShares: BigInt(0),
      bullishShares: BigInt(0),
      totalShares: BigInt(0),
      winningShares: BigInt(0),
      rewardPool: BigInt(0),
      createdAt: BigInt(event.block.timestamp),
      status: "OPEN",
      winningSide: "NONE",
    });
  }
});

PredictionMarket.Pause.handler(async ({ event, context }) => {
  const marketId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.id.toString())
    .toLowerCase();

  let market = await context.Market.get(marketId);
  if (market) {
    context.Market.set({
      ...market,
      paused: true,
    });
  }
});

PredictionMarket.SetMarketDuration.handler(async ({ event, context }) => {
  let marketId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.id.toString())
    .toLowerCase();

  let market = await context.Market.get(marketId);
  if (market !== undefined) {
    context.Market.set({
      ...market,
      duration: event.params.duration,
    });
  }
});

PredictionMarket.SetMinStakeAmount.handler(async ({ event, context }) => {
  const marketId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.id.toString())
    .toLowerCase();

  let market = await context.Market.get(marketId);
  if (market !== undefined) {
    context.Market.set({
      ...market,
      minShareAmount: event.params.minStakeAmount,
    });
  }
});
