[@bs.val] [@bs.scope "Math"] external ceil: float => float = "ceil";
[@bs.val] [@bs.scope "Math"] external log2: float => float = "log2";
[@bs.val] [@bs.scope "Number"] external isFinite: float => bool = "isFinite";
open Data;
open Belt;
module LocalForage = Externals.LocalForage;

let getAllPlayerIdsFromMatches = matchList => {
  open Match;
  let allPlayers =
    Js.Array.(
      matchList
      |> reduce(
           (acc, match) => acc |> concat([|match.whiteId, match.blackId|]),
           [||],
         )
    );
  /* TODO: Not a set. Does it need to be? */
  allPlayers;
};

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount->isFinite ? roundCount->int_of_float : 0;
};

open Tournament;
let emptyTourney = {
  name: "",
  playerIds: [||],
  roundList: [||],
  date: Js.Date.fromFloat(0.0),
  id: Utils.nanoid(),
  tieBreaks: [|1|],
  byeQueue: [||],
};

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: TournamentDataReducers.actionPlayer => unit,
  roundCount: int,
  tourney: Tournament.t,
  tourneyDispatch: TournamentDataReducers.actionTournament => unit,
};

type loadStatus =
  | NothingIsLoaded
  | TourneyIsLoaded
  | TourneyAndPlayersAreLoaded
  | Error;

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, tourneyDispatch) =
    React.useReducer(TournamentDataReducers.tournamentReducer, emptyTourney);
  let name = tourney.name;
  let playerIds = tourney.playerIds;
  let roundList = tourney.roundList;
  let (players, playersDispatch) =
    React.useReducer(TournamentDataReducers.playersReducer, Map.String.empty);
  let (loadStatus, setLoadStatus) = React.useState(() => NothingIsLoaded);
  Hooks.useLoadingCursorUntil(
    loadStatus === TourneyAndPlayersAreLoaded || loadStatus === Error,
  );
  let (_, windowDispatch) = Window.useWindowContext();
  /*
   Set the document title.
   */
  React.useEffect2(
    () => {
      windowDispatch(Window.SetTitle(name));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    (name, windowDispatch),
  );
  /*
   Initialize the tournament from the database.
   */
  React.useEffect2(
    () => {
      let didCancel = ref(false);
      let _ =
        Js.Promise.(
          Db.tourneyStore->LocalForage.Map.getItem(tourneyId)
          |> then_(value => {
               if (! didCancel^) {
                 switch (value->Js.Nullable.toOption) {
                 | None => setLoadStatus(_ => Error)
                 | Some(value) =>
                   tourneyDispatch(
                     SetTournament(value->Data.Tournament.tFromJsDeep),
                   );
                   setLoadStatus(_ => TourneyIsLoaded);
                 };
               };
               resolve();
             })
          |> catch(error => {
               Js.log2("Error loading tournament", error);
               resolve();
             })
        );
      Some(() => didCancel := true);
    },
    (tourneyId, tourneyDispatch),
  );
  /*
   Hydrate players from DB.
   */
  React.useEffect4(
    () => {
      let didCancel = ref(false);
      /* Don't run this without loading the tourney first. Otherwise, it
         will interpret the placeholder `roundList` data as meaning there
         are no active players and load an empty object.*/
      if (loadStatus !== NothingIsLoaded) {
        /* Include players who have played matches but left the tournament,
           as well as players who are registered but havne't played yet. */
        let allTheIds =
          rounds2Matches(~roundList, ())
          |> getAllPlayerIdsFromMatches
          |> Js.Array.concat(playerIds);
        /* If there are no ids, update the player state and exit early.*/
        switch (allTheIds |> Js.Array.length) {
        | 0 =>
          /* This check prevents an infinite loop & memory leak: */
          if (players |> Map.String.keysToArray |> Js.Array.length !== 0) {
            playersDispatch(SetPlayers(players));
          };
          setLoadStatus(_ => TourneyAndPlayersAreLoaded);
        | _ =>
          let _ =
            Js.Promise.(
              Db.playerStore->LocalForage.Map.getItems(
                Js.Nullable.return(allTheIds),
              )
              |> then_(values => {
                   /* This safeguards against trying to fetch dummy IDs or IDs from
                      deleted players. If we updated without this condition, then
                      this `useEffect` would trigger an infinite loop and a memory
                      leak. */
                   let newIds = values |> Js.Dict.keys;
                   let oldIds = players |> Map.String.keysToArray;
                   let changedPlayers =
                     Js.Array.(
                       newIds
                       |> filter(x => !(oldIds |> includes(x)))
                       |> concat(
                            oldIds |> filter(x => !(newIds |> includes(x))),
                          )
                     );
                   /* Js.log2(
                        "changed players:",
                        changedPlayers |> Js.Array.length,
                      ); */
                   if (changedPlayers |> Js.Array.length !== 0 && ! didCancel^) {
                     playersDispatch(
                       SetPlayers(
                         values->Db.jsDictToReMap(Data.Player.tFromJs),
                       ),
                     );
                     setLoadStatus(_ => TourneyAndPlayersAreLoaded);
                   };
                   resolve(values);
                 })
              |> catch(error => {
                   Js.log2("Error loading players", error);
                   resolve(Js.Dict.empty());
                 })
            );
          ();
        };
      };
      Some(() => didCancel := false);
    },
    (roundList, players, playerIds, loadStatus),
  );
  /*
   Save tourney to DB.
   */
  React.useEffect3(
    () => {
      /* If the tournament wasn't loaded then the id won't match. */
      if (loadStatus !== NothingIsLoaded && tourneyId === tourney.id) {
        let _ =
          Db.tourneyStore->LocalForage.Map.setItem(
            tourneyId,
            tourney->Data.Tournament.tToJsDeep,
          );
        ();
      };
      None;
    },
    (loadStatus, tourneyId, tourney),
  );
  /*
   Save players to DB.
   */
  React.useEffect2(
    () => {
      if (loadStatus === TourneyAndPlayersAreLoaded) {
        let _ =
          Db.playerStore->LocalForage.Map.setItems(
            players->Db.reMapToJsDict(Data.Player.tToJs),
          );
        ();
      };
      None;
    },
    (loadStatus, players),
  );
  let getPlayer = Player.getPlayerMaybeMap(players);
  /* `players` includes players in past matches who may have left
     `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    Map.String.(
      players->reduce(empty, (acc, key, player) =>
        if (tourney.playerIds |> Js.Array.includes(key)) {
          acc->set(key, player);
        } else {
          acc;
        }
      )
    );

  let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
  let isItOver = roundList |> Array.length >= roundCount;
  let isNewRoundReady =
    Js.Array.(
      roundList |> length === 0
        ? true
        : isRoundComplete(roundList, activePlayers, (roundList |> length) - 1)
    );
  switch (loadStatus) {
  | TourneyAndPlayersAreLoaded =>
    children({
      activePlayers,
      getPlayer,
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      tourneyDispatch,
    })
  | Error =>
    [%debugger];
    <Window.Body>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>;
  | _ => <Window.Body> {React.string("Loading...")} </Window.Body>
  };
};