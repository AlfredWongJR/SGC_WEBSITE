open Belt;
open Utils.Router;
open LoadTournament;
open Data;

module Footer = {
  [@react.component]
  let make = (~tournament) => {
    let {roundCount, tourney, isItOver, isNewRoundReady, activePlayers} = tournament;
    let {Tournament.roundList} = tourney;
    let (tooltipText, tooltipKind) =
      switch (isNewRoundReady, isItOver) {
      | (true, false) => (
          Utils.Entities.nbsp ++ " Ready to begin a new round.",
          Utils.Success,
        )
      | (false, false)
      | (false, true) => (
          Utils.Entities.nbsp ++ "Round in progress.",
          Utils.Generic,
        )
      | (true, true) => (
          Utils.Entities.nbsp ++ " All rounds have completed.",
          Utils.Warning,
        )
      };
    ReactDOMRe.(
      <>
        <label
          className="win__footer-block"
          style={Style.make(~display="inline-block", ())}>
          {React.string("Rounds: ")}
          {roundList->Rounds.size->Js.Int.toString->React.string}
          <small> {React.string(" out of ")} </small>
          {roundCount->Js.Int.toString->React.string}
        </label>
        <hr className="win__footer-divider" />
        <Utils.Notification
          kind=tooltipKind
          tooltip=tooltipText
          className="win__footer-block"
          style={Style.make(
            ~backgroundColor="transparent",
            ~color="initial",
            ~display="inline-flex",
            ~margin="0",
            ~minHeight="initial",
            (),
          )}>
          {React.string(tooltipText)}
        </Utils.Notification>
        <hr className="win__footer-divider" />
        <label
          className="win__footer-block"
          style={Style.make(~display="inline-block", ())}>
          {React.string("Registered players: ")}
          {activePlayers->Map.String.size->Js.Int.toString->React.string}
        </label>
      </>
    );
  };
};

let footerFunc = (tournament, ()) => <Footer tournament />;

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module Sidebar = {
  [@react.component]
  let make = (~tournament) => {
    let {
      tourney,
      isItOver,
      isNewRoundReady,
      activePlayers,
      players,
      playersDispatch,
      setTourney,
    } = tournament;
    let {Tournament.roundList} = tourney;
    let isRoundComplete = Rounds.isRoundComplete(roundList, activePlayers);
    let basePath = "/tourneys/" ++ tourney.id;
    let newRound = event => {
      ReactEvent.Mouse.preventDefault(event);
      let confirmText =
        "All rounds have completed. Are you sure you want to begin a new "
        ++ "one?";
      let confirmed =
        if (isItOver) {
          if (Webapi.(Dom.Window.confirm(confirmText, Dom.window))) {
            true;
          } else {
            false;
          };
        } else {
          true;
        };
      if (confirmed) {
        setTourney({...tourney, roundList: Rounds.addRound(roundList)});
      };
    };

    let delLastRound = event => {
      ReactEvent.Mouse.preventDefault(event);
      let message = "Are you sure you want to delete the last round?";
      if (Webapi.(Dom.Window.confirm(message, Dom.window))) {
        ReasonReactRouter.push("#/tourneys/" ++ tourney.id);
        /* If a match has been scored, then reset it.
           Should this logic be somewhere else? */
        let lastRoundId = Rounds.getLastKey(roundList);
        switch (roundList->Rounds.get(lastRoundId)) {
        | None => ()
        | Some(round) =>
          round
          ->Rounds.Round.toArray
          ->Array.forEach(match => {
              let {
                Match.result,
                whiteId,
                blackId,
                whiteOrigRating,
                blackOrigRating,
              } = match;
              /* Don't change players who haven't scored.*/
              switch (result) {
              | NotSet => ()
              | BlackWon
              | Draw
              | WhiteWon =>
                [(whiteId, whiteOrigRating), (blackId, blackOrigRating)]
                ->List.forEach(((id, rating)) =>
                    switch (players->Map.String.get(id)) {
                    | Some(player) =>
                      let matchCount = player.matchCount - 1;
                      playersDispatch(
                        Set(player.id, {...player, matchCount, rating}),
                      );
                    /* Don't try to set dummy or deleted players */
                    | None => ()
                    }
                  )
              };
            })
        };
        setTourney({...tourney, roundList: Rounds.delLastRound(roundList)});
        if (Rounds.size(roundList) === 0) {
          /* Automatically remake round 1.*/
          setTourney({
            ...tourney,
            roundList: Rounds.addRound(roundList),
          });
        };
      };
    };
    <div>
      <nav>
        <ul style={ReactDOMRe.Style.make(~marginTop="0", ())}>
          <li>
            <HashLink to_="/tourneys" onDragStart=noDraggy>
              <Icons.ChevronLeft />
              <span className="sidebar__hide-on-close">
                {React.string(" Back")}
              </span>
            </HashLink>
          </li>
        </ul>
        <hr />
        <ul>
          <li>
            <HashLink to_={basePath ++ "/setup"} onDragStart=noDraggy>
              <Icons.Settings />
              <span className="sidebar__hide-on-close">
                {React.string(" Setup")}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_=basePath onDragStart=noDraggy>
              <Icons.Users />
              <span className="sidebar__hide-on-close">
                {React.string(" Players")}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/status"} onDragStart=noDraggy>
              <Icons.Activity />
              <span className="sidebar__hide-on-close">
                {React.string(" Status")}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/crosstable"} onDragStart=noDraggy>
              <Icons.Layers />
              <span className="sidebar__hide-on-close">
                {React.string(" Crosstable")}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/scores"} onDragStart=noDraggy>
              <Icons.List />
              <span className="sidebar__hide-on-close">
                {React.string(" Score detail")}
              </span>
            </HashLink>
          </li>
        </ul>
        <hr />
        <h5 className="sidebar__hide-on-close sidebar__header">
          {React.string("Rounds")}
        </h5>
        <ul className="center-on-close">
          {roundList
           ->Rounds.toArray
           ->Array.mapWithIndex((id, _) =>
               <li key={Js.Int.toString(id)}>
                 <HashLink
                   to_={basePath ++ "/round/" ++ Js.Int.toString(id)}
                   onDragStart=noDraggy>
                   {Js.Int.toString(id + 1)->React.string}
                   {isRoundComplete(id)
                      ? <span
                          className={Cn.make([
                            "sidebar__hide-on-close",
                            "caption-20",
                          ])}>
                          {React.string(" Complete ")}
                          <Icons.Check />
                        </span>
                      : <span
                          className={Cn.make([
                            "sidebar__hide-on-close",
                            "caption-20",
                          ])}>
                          {React.string(" Not complete ")}
                          <Icons.Alert />
                        </span>}
                 </HashLink>
               </li>
             )
           ->React.array}
        </ul>
      </nav>
      <hr />
      <ul>
        <li>
          <button
            className="sidebar-button"
            disabled={!isNewRoundReady}
            onClick=newRound
            style={ReactDOMRe.Style.make(~width="100%", ())}>
            <Icons.Plus />
            <span className="sidebar__hide-on-close">
              {React.string(" New round")}
            </span>
          </button>
        </li>
        <li style={ReactDOMRe.Style.make(~textAlign="center", ())}>
          <button
            disabled={Rounds.size(roundList) === 0}
            onClick=delLastRound
            className="button-micro sidebar-button"
            style={ReactDOMRe.Style.make(~marginTop="8px", ())}>
            <Icons.Trash />
            <span className="sidebar__hide-on-close">
              {React.string(" Remove last round")}
            </span>
          </button>
        </li>
      </ul>
    </div>;
  };
};

let sidebarFunc = (tournament, ()) => <Sidebar tournament />;

[@react.component]
let make = (~tourneyId, ~hashPath) => {
  <LoadTournament tourneyId>
    {tournament =>
       <Window.Body
         footerFunc={footerFunc(tournament)}
         sidebarFunc={sidebarFunc(tournament)}>
         {switch (hashPath) {
          | [""] => <PageTourneyPlayers tournament />
          | ["scores"] => <PageTourneyScores tournament />
          | ["crosstable"] => <PageTourneyScores.Crosstable tournament />
          | ["setup"] => <PageTourneySetup tournament />
          | ["status"] => <PageTournamentStatus tournament />
          | ["round", roundId] =>
            <PageRound tournament roundId={int_of_string(roundId)} />
          | _ => <Pages.NotFound />
          }}
       </Window.Body>}
  </LoadTournament>;
};