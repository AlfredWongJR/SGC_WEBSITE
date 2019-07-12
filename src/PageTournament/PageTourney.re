open TournamentData;
module Footer = {
  [@react.component]
  let make = (~tournament) => {
    let {roundCount, tourney, isItOver, isNewRoundReady} = tournament;
    let roundList = tourney.roundList;
    let (tooltipText, tooltipKind) =
      if (!isNewRoundReady) {
        ("Round in progress.", Utils.Generic);
      } else if (isItOver) {
        ("All rounds have completed.", Utils.Warning);
      } else {
        ("Ready to begin a new round.", Utils.Success);
      };
    ReactDOMRe.(
      <>
        <label
          className="win__footer-block"
          style={Style.make(~display="inline-block", ())}>
          {"Rounds: " |> React.string}
          {roundList |> Js.Array.length |> string_of_int |> React.string}
          <small> {" out of " |> React.string} </small>
          {roundCount |> string_of_int |> React.string}
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
          {tooltipText |> React.string}
        </Utils.Notification>
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
      getPlayer,
      activePlayers,
      playersDispatch,
      tourneyDispatch,
    } = tournament;
    let roundList = tourney.roundList;
    let isComplete = Data.isRoundComplete(roundList, activePlayers);
    let basePath = "#/tourneys/" ++ tourney.id;
    let newRound = event => {
      event->ReactEvent.Mouse.preventDefault;
      let confirmText =
        "All rounds have completed. Are you sure you want to begin a new "
        ++ "one?";
      if (isItOver) {
        if (Utils.confirm(confirmText)) {
          tourneyDispatch(AddRound);
        };
      } else {
        tourneyDispatch(AddRound);
      };
    };

    let delLastRound = event => {
      event->ReactEvent.Mouse.preventDefault;
      if (Utils.confirm("Are you sure you want to delete the last round?")) {
        ReasonReactRouter.push("#/tourneys" ++ tourney.id);
        /* If a match has been scored, then reset it.
           Should this logic be somewhere else? */
        roundList
        |> Utils.last
        |> Js.Array.forEach((match: Data.Match.t) => {
             /* Don't change players who haven't scored.*/
             let whiteScore = match.whiteScore;
             let blackScore = match.blackScore;
             let whiteId = match.whiteId;
             let blackId = match.blackId;
             let whiteOrigRating = match.whiteOrigRating;
             let blackOrigRating = match.blackOrigRating;
             if (whiteScore +. blackScore !== 0.0) {
               [|(whiteId, whiteOrigRating), (blackId, blackOrigRating)|]
               |> Js.Array.forEach(((id, rating)) =>
                    if (id !== Data.dummy_id) {
                      /* Don't try to set the dummy */
                      let matchCount = getPlayer(id).matchCount;
                      playersDispatch(SetMatchCount(id, matchCount - 1));
                      playersDispatch(SetRating(id, rating));
                    }
                  );
             };
           });
        tourneyDispatch(DelLastRound);
        if (roundList |> Js.Array.length === 1) {
          /* Automatically remake round 1.*/
          tourneyDispatch(AddRound);
        };
      };
    };
    <div>
      <nav>
        <ul style={ReactDOMRe.Style.make(~marginTop="0", ())}>
          <li>
            <a href="#/tourneys" onDragStart=noDraggy>
              <Icons.chevronLeft />
              <span className="sidebar__hide-on-close">
                {" Back" |> React.string}
              </span>
            </a>
          </li>
        </ul>
        <hr />
        <ul>
          <li>
            <a href={basePath ++ "/setup"} onDragStart=noDraggy>
              <Icons.settings />
              <span className="sidebar__hide-on-close">
                {" Setup" |> React.string}
              </span>
            </a>
          </li>
          <li>
            <a href=basePath onDragStart=noDraggy>
              <Icons.users />
              <span className="sidebar__hide-on-close">
                {" Players" |> React.string}
              </span>
            </a>
          </li>
          <li>
            <a href={basePath ++ "/status"} onDragStart=noDraggy>
              <Icons.activity />
              <span className="sidebar__hide-on-close">
                {" Status" |> React.string}
              </span>
            </a>
          </li>
          <li>
            <a href={basePath ++ "/crosstable"} onDragStart=noDraggy>
              <Icons.layers />
              <span className="sidebar__hide-on-close">
                {" Crosstable" |> React.string}
              </span>
            </a>
          </li>
          <li>
            <a href={basePath ++ "/scores"} onDragStart=noDraggy>
              <Icons.list />
              <span className="sidebar__hide-on-close">
                {" Score detail" |> React.string}
              </span>
            </a>
          </li>
        </ul>
        <hr />
        <h5 className="sidebar__hide-on-close sidebar__header">
          {"Rounds" |> React.string}
        </h5>
        <ul className="center-on-close">
          {roundList
           |> Js.Array.mapi((_, id) =>
                <li key={id |> string_of_int}>
                  <a
                    href={basePath ++ "/round/" ++ string_of_int(id)}
                    onDragStart=noDraggy>
                    {id + 1 |> string_of_int |> React.string}
                    {id |> isComplete
                       ? <span
                           className={Cn.make([
                             "sidebar__hide-on-close",
                             "caption-20",
                           ])}>
                           {" Complete " |> React.string}
                           <Icons.check />
                         </span>
                       : <span
                           className={Cn.make([
                             "sidebar__hide-on-close",
                             "caption-20",
                           ])}>
                           {" Not complete " |> React.string}
                           <Icons.alert />
                         </span>}
                  </a>
                </li>
              )
           |> React.array}
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
            <Icons.plus />
            <span className="sidebar__hide-on-close">
              {"New round" |> React.string}
            </span>
          </button>
        </li>
        <li style={ReactDOMRe.Style.make(~textAlign="center", ())}>
          <button
            disabled={roundList |> Js.Array.length === 0}
            onClick=delLastRound
            className="button-micro sidebar-button"
            style={ReactDOMRe.Style.make(~marginTop="8px", ())}>
            <Icons.trash />
            <span className="sidebar__hide-on-close">
              {"Remove last round" |> React.string}
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
  <TournamentData tourneyId>
    {tournament =>
       <Window.WindowBody
         footerFunc={footerFunc(tournament)}
         sidebarFunc={sidebarFunc(tournament)}>
         {switch (hashPath) {
          | [""] => <PageTourneyPlayers tournament/>
          | ["scores"] => <PageTourneyScores tournament/>
          | ["crosstable"] => <PageTourneyCrossTable tournament/>
          | ["setup"] => <PageTourneySetup tournament/>
          | _ => <Pages.NotFound />
          }}
       </Window.WindowBody>}
  </TournamentData>;
};