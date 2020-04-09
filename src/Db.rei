let loadDemoDB: unit => unit;

module Config: {
  type t = Data.Config.t;
  type identity;
};
module Tournament: {
  type t = Data.Tournament.t;
  type identity;
};
module Player: {
  type t = Data.Player.t;
  type identity;
};

let tournaments: LocalForage.Map.t(Data.Tournament.t, Tournament.identity);

type action('a) =
  | Del(Data.Id.t)
  | Set(Data.Id.t, 'a)
  | SetAll(Data.Id.Map.t('a));

type state('a) = {
  items: Data.Id.Map.t('a),
  dispatch: action('a) => unit,
  loaded: bool,
};

let useAllPlayers: unit => state(Data.Player.t);

let useAllTournaments: unit => state(Data.Tournament.t);

type actionConfig =
  | AddAvoidPair(Data.Config.Pair.t)
  | DelAvoidPair(Data.Config.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Config.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let useConfig: unit => (Data.Config.t, actionConfig => unit);
