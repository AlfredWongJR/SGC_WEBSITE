open Belt;
open Data;

let log2 = num => log(num) /. log(2.0);
/*
  I'm depreciating `DemoData`, but currently merging it with `TestData` so
  tests can keep working.
 */
open TestData;
let configData = Data.Config.{
  ...config,
  avoidPairs:
    Set.mergeMany(
      config.avoidPairs,
      Set.toArray(DemoData.config.avoidPairs),
    ),
};

let merger = (_key, a, b) => {
  switch (a, b) {
  | (Some(a), _) => Some(a)
  | (_, Some(b)) => Some(b)
  | (None, None) => None
  };
};

let tournamentData =
  Map.String.merge(tournaments, DemoData.tournaments, merger);
let playerData = Map.String.merge(players, DemoData.players, merger);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let tournamentReducer = (_, action) => action;

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: Db.action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(
      tournamentReducer,
      Map.String.getExn(tournamentData, tourneyId),
    );
  let {Tournament.playerIds, roundList, _} = tourney;
  let (players, playersDispatch, _) = Db.useAllPlayers();
  /* `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    Map.String.keep(players, (id, _) => playerIds->List.has(id, (===)));
  let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
  let isItOver = Data.Rounds.size(roundList) >= roundCount;
  let isNewRoundReady =
    Data.Rounds.size(roundList) === 0
      ? true
      : Rounds.isRoundComplete(
          roundList,
          activePlayers,
          Data.Rounds.size(roundList) - 1,
        );

  children({
    activePlayers,
    getPlayer: Player.getPlayerMaybe(players),
    isItOver,
    isNewRoundReady,
    players,
    playersDispatch,
    roundCount,
    tourney,
    setTourney,
  });
};

type roundData = {
  activePlayersCount: int,
  scoreData: Map.String.t(Scoring.t),
  unmatched: Map.String.t(Data.Player.t),
  unmatchedCount: int,
  unmatchedWithDummy: Map.String.t(Data.Player.t),
};
let useRoundData = (roundId: int, tournament: t) => {
  let {tourney, activePlayers, getPlayer, _} = tournament;
  let {Tournament.roundList, _} = tourney;
  /* matches2ScoreData is relatively expensive*/
  let scoreData =
    React.useMemo1(
      () =>
        Converters.matches2ScoreData(Rounds.rounds2Matches(roundList, ())),
      [|roundList|],
    );
  /* Only calculate unmatched players for the latest round. Old rounds
     don't get to add new players.
     Should this be memoized? */
  let round = Rounds.get(roundList, roundId);
  let isThisTheLastRound = roundId === Rounds.getLastKey(roundList);
  let unmatched =
    switch (round, isThisTheLastRound) {
    | (Some(round), true) =>
      let matched = Rounds.Round.getMatched(round);
      Map.String.removeMany(activePlayers, matched);
    | (None, _)
    | (Some(_), false) => Map.String.empty
    };
  let unmatchedCount = Map.String.size(unmatched);
  /* make a new list so as not to affect auto-pairing*/
  let unmatchedWithDummy =
    unmatchedCount mod 2 !== 0
      ? Map.String.set(
          unmatched,
          Player.dummy_id,
          getPlayer(Player.dummy_id),
        )
      : unmatched;
  let activePlayersCount = Map.String.size(activePlayers);
  {
    activePlayersCount,
    scoreData,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy,
  };
};

