import { GrailMarket } from "generated";

GrailMarket.AddMessagingPeer.handler(async ({ event, context }) => {
  let peer = await context.Peer.get(event.params._eid.toString());

  if (peer === undefined) {
    context.Peer.set({
      id: event.params._eid.toString(),
      eid: event.params._eid,
      address: event.params._peer.toLowerCase(),
    });
  }
});

GrailMarket.Bearish.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let positionId = event.params.positionId.toLowerCase();

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      eid: event.params.srcEid,
      account: event.params.account.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      isRefund: event.params.isRefund,
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
      .concat(event.params.account.toLowerCase())
      .toLowerCase();

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

  if (position !== undefined) {
    context.Position.set({ ...position, isRefund: event.params.isRefund });
  }
});

GrailMarket.Bullish.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let positionId = event.params.positionId.toLowerCase();

  let round = await context.Round.get(roundId);
  let position = await context.Position.get(positionId);

  if (round !== undefined && position === undefined) {
    context.Position.set({
      id: positionId,
      eid: event.params.srcEid,
      account: event.params.account.toLowerCase(),
      createdAt: BigInt(event.block.timestamp),
      claimed: false,
      isRefund: event.params.isRefund,
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
      .concat(event.params.account.toLowerCase())
      .toLowerCase();

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

  if (position !== undefined) {
    context.Position.set({ ...position, isRefund: event.params.isRefund });
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
    });
  }
});

GrailMarket.PeersLocked.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");

  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      isPeerLocked: true,
    });
  }
});

GrailMarket.OwnershipTransferred.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");
  const DEFAULT_PROTOCOL_FEE_BPS = BigInt(500); // 5%
  const DEFAULT_DURATION = BigInt(600); // 10 minutes

  if (config === undefined) {
    context.ProtocolConfig.set({
      id: "config",
      duration: DEFAULT_DURATION,
      protocolFee: DEFAULT_PROTOCOL_FEE_BPS,
      minStakeAmount: BigInt(0),
      isPeerLocked: false,
    });
  }
});

GrailMarket.NewRound.handler(async ({ event, context }) => {
  let roundId = event.params.id
    .concat("#")
    .concat(event.params.roundId.toString())
    .toLowerCase();

  let marketId = event.params.id.toLowerCase();

  let config = await context.ProtocolConfig.get("config");
  let round = await context.Round.get(roundId);

  if (config !== undefined) {
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
      });

      context.Round.set({
        id: event.params.id
          .concat("#")
          .concat((event.params.roundId + BigInt(1)).toString())
          .toLowerCase(),
        roundId: event.params.roundId + BigInt(1),
        market_id: marketId,
        openingTime: event.params.openingTime - config.duration,
        closingTime: event.params.closingTime - config.duration,
        priceMark: BigInt(0),
        closingPrice: BigInt(0),
        bearishShares: BigInt(0),
        bullishShares: BigInt(0),
        totalShares: BigInt(0),
        winningShares: BigInt(0),
        rewardPool: BigInt(0),
        createdAt: BigInt(event.block.timestamp),
        status: "NOT_OPEN",
        winningSide: "NONE",
      });
    } else {
      context.Round.set({
        ...round,
        openingTime: event.params.openingTime,
        closingTime: event.params.closingTime,
        createdAt: BigInt(event.block.timestamp),
        status: "OPEN",
      });

      context.Round.set({
        id: event.params.id
          .concat("#")
          .concat((event.params.roundId + BigInt(1)).toString())
          .toLowerCase(),
        roundId: event.params.roundId + BigInt(1),
        market_id: marketId,
        openingTime: event.params.openingTime - config.duration,
        closingTime: event.params.closingTime - config.duration,
        priceMark: BigInt(0),
        closingPrice: BigInt(0),
        bearishShares: BigInt(0),
        bullishShares: BigInt(0),
        totalShares: BigInt(0),
        winningShares: BigInt(0),
        rewardPool: BigInt(0),
        createdAt: BigInt(event.block.timestamp),
        status: "NOT_OPEN",
        winningSide: "NONE",
      });
    }
  }
});

GrailMarket.SetMarketDuration.handler(async ({ event, context }) => {
  let config = await context.ProtocolConfig.get("config");
  if (config !== undefined) {
    context.ProtocolConfig.set({
      ...config,
      duration: event.params.duration,
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
  const positionId = event.params.positionId.toLowerCase();
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
      .concat(position.account)
      .toLowerCase();

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
  }
});
