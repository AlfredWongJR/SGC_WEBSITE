// Generated by BUCKLESCRIPT VERSION 6.0.3, PLEASE EDIT WITH CARE

import * as Cn from "re-classnames/src/Cn.bs.js";
import * as Ramda from "ramda";
import * as React from "react";
import * as Js_dict from "bs-platform/lib/es6/js_dict.js";
import * as Belt_List from "bs-platform/lib/es6/belt_List.js";
import * as Caml_array from "bs-platform/lib/es6/caml_array.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as ReactFeather from "react-feather";
import * as Belt_MapString from "bs-platform/lib/es6/belt_MapString.js";

function add(a, b) {
  return a + b | 0;
}

function arraySum(arr) {
  return arr.reduce(add, 0);
}

function addFloat(a, b) {
  return a + b;
}

function arraySumFloat(arr) {
  return arr.reduce(addFloat, 0.0);
}

function last(arr) {
  return Caml_array.caml_array_get(arr, arr.length - 1 | 0);
}

function splitInHalf(arr) {
  return Ramda.splitAt(arr.length / 2 | 0, arr);
}

var VisuallyHidden = /* module */[];

var Dialog = /* module */[];

var Tabs = /* module */[];

var TabList = /* module */[];

var Tab = /* module */[];

var TabPanels = /* module */[];

var TabPanel = /* module */[];

var ReachTabs = /* module */[
  /* Tabs */Tabs,
  /* TabList */TabList,
  /* Tab */Tab,
  /* TabPanels */TabPanels,
  /* TabPanel */TabPanel
];

var logo = ( require("./icon-min.svg") );

var WebpackAssets = /* module */[/* logo */logo];

var Entities = /* module */[
  /* nbsp */"\xa0",
  /* copy */"\xa9"
];

function hashPath(hashString) {
  return Belt_List.fromArray(hashString.split("/"));
}

function dictToMap(dict) {
  return Belt_MapString.fromArray(Js_dict.entries(dict));
}

function mapToDict(map) {
  return Js_dict.fromArray(Belt_MapString.toArray(map));
}

var dateFormat = (
  new Intl.DateTimeFormat(
      "en-US",
      {
          day: "2-digit",
          month: "short",
          year: "numeric"
      }
  )
);

var timeFormat = (
  new Intl.DateTimeFormat(
      "en-US",
      {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
      }
  )
);

function Utils$DateOrTimeFormat(Props) {
  var dtFormatObj = Props.dtFormatObj;
  var date = Props.date;
  return React.createElement("time", {
              dateTime: date.toISOString()
            }, dtFormatObj.format(date));
}

var DateOrTimeFormat = /* module */[/* make */Utils$DateOrTimeFormat];

function Utils$DateFormat(Props) {
  var date = Props.date;
  return React.createElement(Utils$DateOrTimeFormat, {
              dtFormatObj: dateFormat,
              date: date
            });
}

var DateFormat = /* module */[/* make */Utils$DateFormat];

function Utils$DateTimeFormat(Props) {
  var date = Props.date;
  return React.createElement(Utils$DateOrTimeFormat, {
              dtFormatObj: timeFormat,
              date: date
            });
}

var DateTimeFormat = /* module */[/* make */Utils$DateTimeFormat];

function Utils$Notification(Props) {
  var children = Props.children;
  var match = Props.kind;
  var kind = match !== undefined ? match : /* Generic */3;
  var tooltip = Props.tooltip;
  var match$1 = Props.className;
  var className = match$1 !== undefined ? match$1 : "";
  var match$2 = Props.style;
  var style = match$2 !== undefined ? Caml_option.valFromOption(match$2) : { };
  var match$3;
  switch (kind) {
    case 0 : 
        match$3 = /* tuple */[
          React.createElement(ReactFeather.Check, { }),
          "notification__success"
        ];
        break;
    case 1 : 
        match$3 = /* tuple */[
          React.createElement(ReactFeather.AlertTriangle, { }),
          "notification__warning"
        ];
        break;
    case 2 : 
        match$3 = /* tuple */[
          React.createElement(ReactFeather.X, { }),
          "notification__error"
        ];
        break;
    case 3 : 
        match$3 = /* tuple */[
          React.createElement(ReactFeather.Info, { }),
          "notification__generic"
        ];
        break;
    
  }
  return React.createElement("div", {
              className: Cn.make(/* :: */[
                    "notification",
                    /* :: */[
                      match$3[1],
                      /* :: */[
                        className,
                        /* [] */0
                      ]
                    ]
                  ]),
              style: style
            }, React.createElement("div", {
                  "aria-label": tooltip,
                  className: "notifcation__icon",
                  title: tooltip
                }, match$3[0]), React.createElement("div", {
                  className: "notification__text"
                }, children));
}

var $$Notification = /* module */[/* make */Utils$Notification];

function Utils$Panel(Props) {
  var children = Props.children;
  var match = Props.className;
  var className = match !== undefined ? match : "";
  var match$1 = Props.style;
  var style = match$1 !== undefined ? Caml_option.valFromOption(match$1) : { };
  return React.createElement("div", {
              className: Cn.make(/* :: */[
                    "utility__panel",
                    /* :: */[
                      className,
                      /* [] */0
                    ]
                  ]),
              style: style
            }, children);
}

var Panel = /* module */[/* make */Utils$Panel];

function Utils$PanelContainer(Props) {
  var children = Props.children;
  var match = Props.className;
  var className = match !== undefined ? match : "";
  var match$1 = Props.style;
  var style = match$1 !== undefined ? Caml_option.valFromOption(match$1) : { };
  return React.createElement("div", {
              className: Cn.make(/* :: */[
                    "utility__panels",
                    /* :: */[
                      className,
                      /* [] */0
                    ]
                  ]),
              style: style
            }, children);
}

var PanelContainer = /* module */[/* make */Utils$PanelContainer];

export {
  add ,
  arraySum ,
  addFloat ,
  arraySumFloat ,
  last ,
  splitInHalf ,
  VisuallyHidden ,
  Dialog ,
  ReachTabs ,
  WebpackAssets ,
  Entities ,
  hashPath ,
  dictToMap ,
  mapToDict ,
  dateFormat ,
  timeFormat ,
  DateOrTimeFormat ,
  DateFormat ,
  DateTimeFormat ,
  $$Notification ,
  Panel ,
  PanelContainer ,
  
}
/* logo Not a pure module */
