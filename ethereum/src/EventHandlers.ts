import { GrailMarket } from "generated";

GrailMarket.Bearish.handler(async ({ event, context }) => {
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();
  const positionId = `${event.chainId}#${event.params.positionId}`.toLowerCase();

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

    // update the leader board
    const leaderboardId = `${round.market_id}#${event.params.account}`.toLowerCase();
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
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();
  const positionId = `${event.chainId}#${event.params.positionId}`.toLowerCase();

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

    // update the leader board
    const leaderboardId = `${round.market_id}#${event.params.account}`.toLowerCase();
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
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();

  let round = await context.Round.get(roundId);
  if (round !== undefined) {
    context.Round.set({
      ...round,
      status: "REFUNDING",
    });
  }
});

GrailMarket.CreateMarket.handler(async ({ event, context }) => {
  const marketId = `${event.chainId}#${event.params.id}`.toLowerCase();
  let market = await context.Market.get(marketId);

  if (market === undefined) {
    context.Market.set({
      id: marketId,
      marketId: marketId,
      chainId: BigInt(event.chainId),
      createdAt: BigInt(event.block.timestamp)
    });
  }
});

GrailMarket.NewRound.handler(async ({ event, context }) => {
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();
  const marketId = `${event.chainId}#${event.params.id}`.toLowerCase();
  let round = await context.Round.get(roundId);

  if (round === undefined) {
    context.Round.set({
      id: roundId,
      chainId: BigInt(event.chainId),
      roundId: event.params.roundId,
      market_id: marketId,
      lockTime: event.params.lockTime,
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

GrailMarket.SetMarketDuration.handler(async ({ event, context }) => {
  const configId = event.chainId.toString();

  let config = await context.ProtocolConfig.get(configId);
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      duration: event.params.duration,
    });
  } else {
    context.ProtocolConfig.set({
      id: configId,
      chainId: BigInt(event.chainId),
      duration: event.params.duration,
      minStakeAmount: BigInt(0),
      protocolFee: BigInt(500),
      resolverFee: BigInt(1000)
    })
  }
});

GrailMarket.SetMinStakeAmount.handler(async ({ event, context }) => {
  const configId = event.chainId.toString();

  let config = await context.ProtocolConfig.get(configId);
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      minStakeAmount: event.params.minStakeAmount,
    });
  }
});

GrailMarket.SetRoundPriceMark.handler(async ({ event, context }) => {
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();

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
  const positionId = `${event.chainId}#${event.params.positionId}`.toLowerCase();
  let position = await context.Position.get(positionId);

  if (position !== undefined) {
    context.Position.set({
      ...position,
      reward: event.params.reward,
      claimed: true,
    });

    // update the leader board
    const leaderboardId = `${position.market_id}#${event.params.account}`.toLowerCase();
    let leaderboard = await context.LeaderBoard.get(leaderboardId);

    if (leaderboard !== undefined) {
      context.LeaderBoard.set({
        ...leaderboard,
        reward: leaderboard.reward + event.params.reward,
      });
    }
  }
});

GrailMarket.Resolve.handler(async ({ event, context }) => {
  const roundId = `${event.chainId}#${event.params.id}#${event.params.roundId.toString()}`.toLowerCase();

  let round = await context.Round.get(roundId);
  if (round !== undefined) {
    context.Round.set({
      ...round,
      closingPrice: event.params.closingPrice,
      rewardPool: event.params.rewardPool,
      winningShares: event.params.totalWinningStake,
      winningSide: event.params.winningSide === BigInt(1)
        ? "BULLISH"
        : "BEARISH",
      status: "RESOLVED",
    });
  }
});

GrailMarket.SetProtocolFee.handler(async ({ event, context }) => {
  const configId = event.chainId.toString();

  let config = await context.ProtocolConfig.get(configId);
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      protocolFee: event.params.newFee,
    });
  } else {
    context.ProtocolConfig.set({
      id: configId,
      chainId: BigInt(event.chainId),
      duration: BigInt(300),
      minStakeAmount: BigInt(0),
      protocolFee: event.params.newFee,
      resolverFee: BigInt(1000)
    })
  }
});

GrailMarket.SetResolverFee.handler(async ({ event, context }) => {
  const configId = event.chainId.toString();

  let config = await context.ProtocolConfig.get(configId);
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      resolverFee: event.params.newFee,
    });
  } else {
    context.ProtocolConfig.set({
      id: configId,
      chainId: BigInt(event.chainId),
      duration: BigInt(300),
      minStakeAmount: BigInt(0),
      protocolFee: BigInt(500),
      resolverFee: event.params.newFee
    })
  }
});
