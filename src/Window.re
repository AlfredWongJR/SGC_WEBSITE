open Belt;

let global_title = "Coronate";

let formatTitle = title => {
  title |> Js.String.length == 0
    ? global_title : title ++ " - " ++ global_title;
};

[@bs.deriving jsConverter]
type windowstate = {
  isBlur: bool,
  isDialogOpen: bool,
  isFullScreen: bool,
  isMaximized: bool,
  isSidebarOpen: bool,
  title: string,
};

type action =
  | SetBlur(bool)
  | SetDialog(bool)
  | SetFullScreen(bool)
  | SetMaximized(bool)
  | SetSidebar(bool)
  | SetTitle(string);

let initialWinState = {
  isBlur: false,
  isDialogOpen: false,
  isFullScreen: false,
  isMaximized: false,
  isSidebarOpen: true,
  title: "",
};

module Context = {
  let initialState = (initialWinState, (_: action) => ());
  let windowContext = React.createContext(initialState);

  module Provider = {
    let makeProps = (~value, ~children, ()) => {
      "value": value,
      "children": children,
    };

    let make = React.Context.provider(windowContext);
  };
};

let useWindowContext = () => {
  React.useContext(Context.windowContext);
};

module About = {
  [@react.component]
  let make = () => {
    <article
      style={ReactDOMRe.Style.make(
        ~display="flex",
        ~justifyContent="space-between",
        ~width="100%",
        (),
      )}>
      <div
        style={ReactDOMRe.Style.make(
          ~flex="0 0 48%",
          ~textAlign="center",
          (),
        )}>
        <img src=Utils.WebpackAssets.logo height="196" width="196" alt="" />
      </div>
      <div style={ReactDOMRe.Style.make(~flex="0 0 48%", ())}>
        <h1
          className="title"
          style={ReactDOMRe.Style.make(~textAlign="left", ())}>
          {React.string("Coronate")}
        </h1>
        <p>
          {React.string(
             [|
               "Copyright ",
               Utils.Entities.copy,
               " 2019 John",
               Utils.Entities.nbsp,
               "Jackson",
             |]
             |> Js.Array.joinWith(""),
           )}
        </p>
        <p> {React.string("Coronate is free software.")} </p>
        <p>
          <a href=Utils.github_url onClick=Electron.openInBrowser>
            {React.string("Source code is available")}
          </a>
          <br />
          {React.string(" under the ")}
          <a href=Utils.license_url onClick=Electron.openInBrowser>
            {React.string("AGPL v3.0 license")}
          </a>
          {React.string(".")}
        </p>
      </div>
    </article>;
  };
};

let windowReducer = (state, action) => {
  switch (action) {
  | SetBlur(value) => {...state, isBlur: value}
  | SetTitle(value) => {...state, title: value}
  | SetDialog(value) => {...state, isDialogOpen: value}
  | SetFullScreen(value) => {...state, isFullScreen: value}
  | SetMaximized(value) => {...state, isMaximized: value}
  | SetSidebar(value) => {...state, isSidebarOpen: value}
  };
};

let isElectronMac = Electron.isMac && Electron.isElectron;

let toolbarClasses =
  Cn.make([
    "macos-button-toolbar"->Cn.ifTrue(isElectronMac),
    "button-ghost"->Cn.ifTrue(!isElectronMac),
  ]);

module MSWindowsControls = {
  module Style = {
    open Css;
    open Utils.PhotonColors;
    let container =
      style([
        height(`calc((`add, `percent(100.0), `px(8)))),
        margin(`px(-4)),
      ]);
    let button =
      style([
        fontSize(`px(11)),
        textAlign(`center),
        width(`px(46)),
        height(`percent(100.0)),
        borderRadius(`zero),
        focus([
          borderStyle(`none),
          unsafe("boxShadow", "none"),
          outlineStyle(`none)
        ]),
      ]);
    let button_svg =
      style([display(`inline), unsafe("shapeRendering", "crispEdges")]);
    let close = style([hover([backgroundColor(red_50)])]);
  };
  [@react.component]
  let make = (~state, ~electron) => {
    let window = electron##remote->Electron.getCurrentWindow;
    let middleButton =
      if (state.isFullScreen) {
        <button
          className={Cn.make([Style.button, "button-ghost"])}
          onClick={_ => window->Electron.setFullScreen(false)}>
          <Icons.Unfullscreen />
        </button>;
      } else if (state.isMaximized) {
        <button
          className={Cn.make([Style.button, "button-ghost"])}
          onClick={_ => window->Electron.unmaximize}>
          <Icons.Restore />
        </button>;
      } else {
        <button
          className={Cn.make([Style.button, "button-ghost"])}
          onClick={_ => window->Electron.maximize}>
          <Icons.Maximize />
        </button>;
      };

    <div className=Style.container>
      <button
        className={Cn.make([Style.button, "button-ghost"])}
        onClick={_ => window->Electron.minimize}>
        <Icons.Minimize />
      </button>
      middleButton
      <button
        className={Cn.make([Style.button, Style.close, "button-ghost"])}
        onClick={_ => window->Electron.close}>
        <Icons.Close />
      </button>
    </div>;
  };
};

module TitleBar = {
  [@react.component]
  let make = (~state, ~dispatch) => {
    <header
      className={Cn.make([
        "app__header",
        "double-click-control",
        "traffic-light-padding"
        ->Cn.ifTrue(isElectronMac && !state.isFullScreen),
      ])}
      onDoubleClick=Electron.macOSDoubleClick>
      <div>
        <Electron.IfElectron os=Electron.Windows>
          {_ =>
             <span
               style={ReactDOMRe.Style.make(
                 ~alignItems="center",
                 ~display="inline-flex",
                 ~marginLeft="4px",
                 ~marginRight="8px",
                 (),
               )}>
               <img
                 src=Utils.WebpackAssets.logo
                 alt=""
                 height="16"
                 width="16"
               />
             </span>}
        </Electron.IfElectron>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(SetSidebar(!state.isSidebarOpen))}>
          <Icons.Sidebar />
          <Utils.VisuallyHidden>
            {React.string("Toggle sidebar")}
          </Utils.VisuallyHidden>
        </button>
        <button
          className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
          <Icons.Help />
          <Utils.VisuallyHidden>
            {React.string("About Coronate")}
          </Utils.VisuallyHidden>
        </button>
      </div>
      <div
        className={Cn.make([
          "body-20",
          "double-click-control",
          "disabled"->Cn.ifTrue(state.isBlur),
        ])}
        style={ReactDOMRe.Style.make(
          ~left="0",
          ~marginLeft="auto",
          ~marginRight="auto",
          ~position="absolute",
          ~right="0",
          ~textAlign="center",
          ~width="50%",
          (),
        )}>
        {React.string(formatTitle(state.title))}
      </div>
      <Electron.IfElectron os=Electron.Windows>
        {electron => <MSWindowsControls electron state />}
      </Electron.IfElectron>
    </header>;
  };
};

[@react.component]
let make = (~children, ~className) => {
  let (state, dispatch) = React.useReducer(windowReducer, initialWinState);
  let title = state.title;
  React.useEffect1(
    () => {
      let _ =
        Webapi.Dom.(
          document
          ->Document.asHtmlDocument
          ->Option.map(x => x->HtmlDocument.setTitle(formatTitle(title)))
        );
      None;
    },
    [|title|],
  );
  React.useEffect1(
    () => {
      open Electron;
      let func =
        ifElectron(electron => {
          let win = electron##remote->getCurrentWindow;
          /* This will ensure that stale event listeners aren't persisted.
             That typically won't be relevant to production builds, but
             in a dev environment, where the page reloads frequently,
             stale listeners will accumulate. Note that this can cause
             side effects if other listeners are added elsewhere. */
          let unregisterListeners = () => {
            win->removeAllListeners("enter-full-screen");
            win->removeAllListeners("leave-full-screen");
            win->removeAllListeners("blur");
            win->removeAllListeners("focus");
            win->removeAllListeners("maximize");
            win->removeAllListeners("unmaximize");
          };
          unregisterListeners();
          win->on("enter-full-screen", () => dispatch(SetFullScreen(true)));
          win->on("leave-full-screen", () => dispatch(SetFullScreen(false)));
          win->on("maximize", () => dispatch(SetMaximized(true)));
          win->on("unmaximize", () => dispatch(SetMaximized(false)));
          win->on("blur", () => dispatch(SetBlur(true)));
          win->on("focus", () => dispatch(SetBlur(false)));
          dispatch(SetBlur(!win->isFocused));
          dispatch(SetFullScreen(win->isFullScreen));
          dispatch(SetMaximized(win->isMaximized));
          // I don't think this ever really fires, but can it hurt?
          unregisterListeners;
        });
      switch (func) {
      | None => None
      | Some(func) => Some(func)
      };
    },
    [|dispatch|],
  );
  <div
    className={Cn.make([
      className,
      "open-sidebar"->Cn.ifTrue(state.isSidebarOpen),
      "closed-sidebar"->Cn.ifTrue(!state.isSidebarOpen),
      "window-blur"->Cn.ifTrue(state.isBlur),
      "isWindows"->Cn.ifTrue(Electron.isWin),
      "isMacOS"->Cn.ifTrue(Electron.isMac),
      "isElectron"->Cn.ifTrue(Electron.isElectron),
    ])}>
    <TitleBar state dispatch />
    <Context.Provider value=(state, dispatch)> children </Context.Provider>
    <Utils.Dialog
      isOpen={state.isDialogOpen}
      onDismiss={() => dispatch(SetDialog(false))}
      style={ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())}>
      <button
        className="button-micro" onClick={_ => dispatch(SetDialog(false))}>
        {React.string("Close")}
      </button>
      <About />
    </Utils.Dialog>
  </div>;
};

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module DefaultSidebar = {
  [@react.component]
  let make = () => {
    <nav>
      <ul style={ReactDOMRe.Style.make(~margin="0", ())}>
        <li>
          <a href="#/tourneys" onDragStart=noDraggy>
            <Icons.Award />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Tournaments")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/players" onDragStart=noDraggy>
            <Icons.Users />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Players")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/options" onDragStart=noDraggy>
            <Icons.Settings />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Options")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/" onDragStart=noDraggy>
            <Icons.Help />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Info")}
            </span>
          </a>
        </li>
      </ul>
    </nav>;
  };
};

let sidebarCallback = () => <DefaultSidebar />;

module Body = {
  [@react.component]
  let make = (~children, ~footerFunc=?, ~sidebarFunc=sidebarCallback) => {
    /*footerProps = {}*/
    <div
      className={Cn.make([
        "winBody",
        "winBody-hasFooter"->Cn.ifSome(footerFunc),
      ])}>
      <div className="win__sidebar"> {sidebarFunc()} </div>
      <div className="win__content"> children </div>
      {switch (footerFunc) {
       | Some(footer) =>
         <footer
           className={Cn.make(["win__footer" /* , footerProps.className */])}>
           {footer()}
         </footer>
       | None => ReasonReact.null
       }}
    </div>;
  };
};