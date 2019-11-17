open Belt;
open Data;

module Selecting = {
  [@react.component]
  let make = (~tourney, ~setTourney, ~players, ~playersDispatch) => {
    let {Tournament.playerIds} = tourney;
    let togglePlayer = event => {
      let id = ReactEvent.Form.target(event)##value;
      if (ReactEvent.Form.target(event)##checked) {
        setTourney({...tourney, playerIds: [id, ...playerIds]});
      } else {
        setTourney({
          ...tourney,
          playerIds: playerIds->List.keep(pId => pId !== id),
        });
      };
    };

    <div>
      <div className="toolbar">
        <button
          className="button-micro"
          onClick={_ =>
            setTourney({
              ...tourney,
              playerIds: players->Map.String.keysToArray->List.fromArray,
            })
          }>
          {React.string("Select all")}
        </button>
        <button
          className="button-micro"
          onClick={_ => setTourney({...tourney, playerIds: []})}>
          {React.string("Select none")}
        </button>
      </div>
      <table>
        <caption> {React.string("Select players")} </caption>
        <thead>
          <tr>
            <th> {React.string("First name")} </th>
            <th> {React.string("Last name")} </th>
            <th> {React.string("Select")} </th>
          </tr>
        </thead>
        <tbody>
          {players
           ->Map.String.valuesToArray
           ->Array.map(({Player.id, firstName, lastName}) =>
               <tr key=id>
                 <td> {React.string(firstName)} </td>
                 <td> {React.string(lastName)} </td>
                 <td>
                   <Utils.VisuallyHidden>
                     <label htmlFor={"select-" ++ id}>
                       {["Select", firstName, lastName]
                        |> String.concat(" ")
                        |> React.string}
                     </label>
                   </Utils.VisuallyHidden>
                   <input
                     checked={playerIds->List.has(id, (===))}
                     type_="checkbox"
                     value=id
                     id={"select-" ++ id}
                     onChange=togglePlayer
                   />
                 </td>
               </tr>
             )
           ->React.array}
        </tbody>
      </table>
      <PagePlayers.NewPlayerForm
        dispatch=playersDispatch
        addPlayerCallback={id =>
          setTourney({...tourney, playerIds: [id, ...playerIds]})
        }
      />
    </div>;
  };
};

let hasHadBye = (matches, playerId) => {
  Js.Array2.(
    matches
    ->filter((match: Match.t) =>
        includes([|match.whiteId, match.blackId|], playerId)
      )
    ->reduce(
        (acc, match: Match.t) =>
          concat(acc, [|match.whiteId, match.blackId|]),
        [||],
      )
    ->includes(Data.Player.dummy_id)
  );
};

module PlayerList = {
  [@react.component]
  let make = (~players, ~tourney, ~setTourney, ~byeQueue) => {
    <>
      {players
       ->Map.String.valuesToArray
       ->Array.map(p =>
           <tr
             key={p.Player.id}
             className={Cn.make([Player.Type.toString(p.type_), "player"])}>
             <td> {React.string(p.firstName)} </td>
             <td> {React.string(p.lastName)} </td>
             <td>
               <button
                 className="button-micro"
                 disabled={Js.Array2.includes(byeQueue, p.id)}
                 onClick={_ =>
                   setTourney(
                     Tournament.{
                       ...tourney,
                       byeQueue: Array.concat(byeQueue, [|p.id|]),
                     },
                   )
                 }>
                 {React.string("Bye signup")}
               </button>
             </td>
           </tr>
         )
       ->React.array}
    </>;
  };
};

[@react.component]
let make = (~tournament) => {
  let {
    LoadTournament.tourney,
    setTourney,
    players,
    activePlayers,
    playersDispatch,
  } = tournament;
  let {Tournament.playerIds, roundList, byeQueue} = tourney;
  let (isSelecting, setIsSelecting) =
    React.useState(() =>
      switch (playerIds) {
      | [] => true
      | _ => false
      }
    );
  let matches = Rounds.rounds2Matches(roundList, ());
  <div className="content-area">
    <div className="toolbar">
      <button onClick={_ => setIsSelecting(_ => true)}>
        <Icons.Edit />
        {React.string(" Edit player roster")}
      </button>
    </div>
    <Utils.PanelContainer>
      <Utils.Panel style={ReactDOMRe.Style.make(~flexShrink="0", ())}>
        <table>
          <caption> {React.string("Current roster")} </caption>
          <thead>
            <tr>
              <th colSpan=2> {React.string("Name")} </th>
              <th> {React.string("Options")} </th>
            </tr>
          </thead>
          <tbody className="content">
            <PlayerList byeQueue setTourney tourney players=activePlayers />
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <h3> {React.string("Bye queue")} </h3>
        {if (Js.Array.length(byeQueue) === 0) {
           <p>
             {React.string("No players have signed up for a bye round.")}
           </p>;
         } else {
           React.null;
         }}
        <ol>
          {Array.map(byeQueue, pId =>
             <li
               key=pId
               className={Cn.make([
                 "buttons-on-hover",
                 "disabled"->Cn.ifTrue(hasHadBye(matches, pId)),
               ])}>
               {[
                  activePlayers->Map.String.getExn(pId).firstName,
                  activePlayers->Map.String.getExn(pId).lastName,
                ]
                |> String.concat(" ")
                |> React.string}
               {React.string(" ")}
               <button
                 className="button-micro"
                 onClick={_ =>
                   setTourney({
                     ...tourney,
                     byeQueue: Js.Array2.filter(byeQueue, id => pId !== id),
                   })
                 }>
                 {React.string("Remove")}
               </button>
             </li>
           )
           ->React.array}
        </ol>
      </Utils.Panel>
      <Utils.Dialog
        isOpen=isSelecting
        onDismiss={() => setIsSelecting(_ => false)}
        ariaLabel="Select players">
        <button
          className="button-micro button-primary"
          onClick={_ => setIsSelecting(_ => false)}>
          {React.string("Done")}
        </button>
        <Selecting tourney setTourney players playersDispatch />
      </Utils.Dialog>
    </Utils.PanelContainer>
  </div>;
};