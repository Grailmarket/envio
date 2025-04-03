import { GrailMarket } from "generated";
import { getRoundState } from "./getRoundState";

const MARKET_DURATION = BigInt(600);

GrailMarket.Bearish.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toLowerCase());

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      chainId: BigInt(event.chainId),
      account: event.params.account.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      isRefund: false,
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

    // update the leader board
    const leaderboardId = round.market_id
      .concat("#")
      .concat(event.params.account.toLowerCase());

    let leaderboard = await context.LeaderBoard.get(leaderboardId);

    if (leaderboard === undefined) {
      context.LeaderBoard.set({
        id: leaderboardId,
        account: event.params.account.toLowerCase(),
        market_id: round.market_id,
        rounds: BigInt(1),
        shares: event.params.stake,
        reward: BigInt(0),
      });
    } else {
      context.LeaderBoard.set({
        ...leaderboard,
        shares: leaderboard.shares + event.params.stake,
        rounds: leaderboard.rounds + BigInt(1),
      });
    }
  }
});

GrailMarket.Bullish.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toLowerCase());

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      chainId: BigInt(event.chainId),
      account: event.params.account.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      isRefund: false,
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

    // update the leader board
    const leaderboardId = round.market_id
      .concat("#")
      .concat(event.params.account.toLowerCase());

    let leaderboard = await context.LeaderBoard.get(leaderboardId);

    if (leaderboard === undefined) {
      context.LeaderBoard.set({
        id: leaderboardId,
        account: event.params.account.toLowerCase(),
        market_id: round.market_id,
        rounds: BigInt(1),
        shares: event.params.stake,
        reward: BigInt(0),
      });
    } else {
      context.LeaderBoard.set({
        ...leaderboard,
        shares: leaderboard.shares + event.params.stake,
        rounds: leaderboard.rounds + BigInt(1),
      });
    }
  }
});

GrailMarket.CancelRound.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);
  if (round !== undefined) {
    context.Round.set({
      ...round,
      status: "REFUNDING",
    });
  }
});

GrailMarket.CreateMarket.handler(async ({ event, context }) => {
  let marketId = event.params.id.toLowerCase();

  let market = await context.Market.get(marketId);

  if (market === undefined) {
    context.Market.set({
      id: marketId,
      marketId: event.params.id.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      latestRoundId: BigInt(2),
    });
  }
});

GrailMarket.NewRound.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let marketId = event.params.id.toLowerCase();

  let round = await context.Round.get(roundId);
  let market = await context.Market.get(marketId);

  if (market !== undefined) {
    context.Market.set({ ...market, latestRoundId: event.params.roundId });
  }

  const { response } = await getRoundState(
    event.params.id,
    event.params.roundId,
    event.block.number
  );

  if (round === undefined) {
    context.Round.set({
      id: roundId,
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
      openRoundState: response,
      resolvedRoundState: "",
    });
  }
});

GrailMarket.SetMarketDuration.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      duration: event.params.duration,
    });
  } else {
    context.ProtocolConfig.set({
      id: "config",
      duration: event.params.duration,
      protocolFee: BigInt(500),
      minStakeAmount: BigInt(0),
    });
  }
});

GrailMarket.SetMinStakeAmount.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      minStakeAmount: event.params.minStakeAmount,
    });
  }
});

GrailMarket.SetRoundPriceMark.handler(async ({ event, context }) => {
  const roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);
  if (round !== undefined) {
    context.Round.set({
      ...round,
      priceMark: event.params.priceMark,
      closingTime: event.params.closingTime,
      status: "LIVE",
    });
  }
});

GrailMarket.Settle.handler(async ({ event, context }) => {
  let positionId = event.chainId
    .toString()
    .concat("#")
    .concat(event.params.positionId.toLowerCase());
  let position = await context.Position.get(positionId);

  if (position !== undefined) {
    context.Position.set({
      ...position,
      reward: event.params.reward,
      claimed: true,
      isRefund: event.params.isRefund,
    });

    // update the leader board
    const leaderboardId = position.market_id
      .concat("#")
      .concat(event.params.account.toLowerCase());

    let leaderboard = await context.LeaderBoard.get(leaderboardId);

    if (leaderboard !== undefined) {
      if (event.params.isRefund) {
        context.LeaderBoard.set({
          ...leaderboard,
          rounds: leaderboard.rounds - BigInt(1),
          shares: leaderboard.shares - event.params.reward,
        });
      } else {
        context.LeaderBoard.set({
          ...leaderboard,
          reward: leaderboard.reward + event.params.reward,
        });
      }
    }
  }
});

GrailMarket.Resolve.handler(async ({ event, context }) => {
  const roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let round = await context.Round.get(roundId);

  const { response } = await getRoundState(
    event.params.id,
    event.params.roundId,
    event.block.number
  );

  if (round !== undefined) {
    context.Round.set({
      ...round,
      closingPrice: event.params.closingPrice,
      rewardPool: event.params.rewardPool,
      winningShares: event.params.totalWinningStake,
      winningSide:
        event.params.winningSide === BigInt(0)
          ? "NONE"
          : event.params.winningSide === BigInt(2)
          ? "BULLISH"
          : "BEARISH",
      status: "RESOLVED",
      resolvedRoundState: response,
    });
  }
});

GrailMarket.SetProtocolFee.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      protocolFee: event.params.newFee,
    });
  } else {
    context.ProtocolConfig.set({
      id: "config",
      duration: MARKET_DURATION,
      protocolFee: event.params.newFee,
      minStakeAmount: BigInt(0),
    });
  }
});
