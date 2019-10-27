/*******************************************************************************
  Misc. utilities
 ******************************************************************************/
[@bs.module "nanoid"] external nanoid: unit => string = "default";
[@bs.module "edmonds-blossom"]
external blossom: array((int, int, float)) => array(int) = "default";

module EloRank = {
  type t;
  [@bs.new] [@bs.module "elo-rank"] external make: int => t = "default";
  [@bs.send] external getExpected: (t, int, int) => int = "getExpected";
  [@bs.send]
  external updateRating: (t, int, float, int) => int = "updateRating";
};

/*******************************************************************************
  Browser stuff
 ******************************************************************************/
module FileReader = {
  type t;
  [@bs.new] external make: unit => t = "FileReader";
  type onloadArg = {. "target": {. "result": string}};
  [@bs.set] external setOnLoad: (t, onloadArg => unit) => unit = "onload";
  [@bs.send] external readAsText: (t, string) => unit = "readAsText";
};

/*******************************************************************************
  LocalForage
  This code has moved to https://github.com/johnridesabike/bs-localforage
 ******************************************************************************/
/*******************************************************************************
  Components
 ******************************************************************************/

module VisuallyHidden = {
  [@bs.module "@reach/visually-hidden"] [@react.component]
  external make: (~children: React.element) => React.element = "default";
};
module Dialog = {
  /* This binding is awkward to account for Reason's inability to directly use
     aria-* properties with components. The second make function fixes it for
     us. I don't know if there's a better way of doing this. */
  [@bs.module "@reach/dialog"]
  external make:
    React.component({
      .
      "isOpen": bool,
      "onDismiss": unit => unit,
      "children": React.element,
      "style": ReactDOMRe.Style.t,
      "aria-label": string,
    }) =
    "Dialog";
  [@react.component]
  let make =
      (
        ~isOpen,
        ~onDismiss,
        ~ariaLabel,
        ~children,
        ~style=ReactDOMRe.Style.make(),
      ) =>
    React.createElement(
      make,
      {
        "isOpen": isOpen,
        "onDismiss": onDismiss,
        "style": style,
        "aria-label": ariaLabel,
        "children": children,
      },
    );
};

module ReachTabs = {
  module Tabs = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~index: int=?, ~onChange: int => unit=?, ~children: React.element) =>
      React.element =
      "Tabs";
  };
  module TabList = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabList";
  };
  module Tab = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~disabled: bool=?, ~children: React.element) => React.element =
      "Tab";
  };
  module TabPanels = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanels";
  };
  module TabPanel = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanel";
  };
};