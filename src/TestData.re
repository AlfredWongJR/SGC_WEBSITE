open Data;
let options = {
  byeValue: 1.0,
  avoidPairs: [|
    ("TVs_Frank____________", "TVs_Son_of_TVs_Frank_"),
    ("Pearl_Forrester______", "Dr_Clayton_Forrester_"),
    ("Kinga_Forrester______", "Dr_Clayton_Forrester_"),
    ("Kinga_Forrester______", "Pearl_Forrester______"),
  |],
  lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
};

let players =
  Js.Dict.fromArray([|
    (
      "Cambot_______________",
      Player.{
        id: "Cambot_______________",
        matchCount: 25,
        rating: 1500,
        type_: "person",
        firstName: "Cambot",
        lastName: "",
      },
    ),
    (
      "Crow_T_Robot_________",
      {
        id: "Crow_T_Robot_________",
        matchCount: 5,
        rating: 1700,
        type_: "person",
        firstName: "Crow T",
        lastName: "Robot",
      },
    ),
    (
      "Dr_Clayton_Forrester_",
      {
        id: "Dr_Clayton_Forrester_",
        matchCount: 40,
        rating: 2100,
        type_: "person",
        firstName: "Clayton",
        lastName: "Forrester",
      },
    ),
    (
      "Grandy_McMaster______",
      {
        id: "Grandy_McMaster______",
        matchCount: 100,
        rating: 2600,
        type_: "person",
        firstName: "Grandy",
        lastName: "McMaster",
      },
    ),
    (
      "Gypsy________________",
      {
        id: "Gypsy________________",
        matchCount: 15,
        rating: 1600,
        type_: "person",
        firstName: "Gypsy",
        lastName: "",
      },
    ),
    (
      "Joel_Robinson________",
      {
        id: "Joel_Robinson________",
        matchCount: 70,
        rating: 2400,
        type_: "person",
        firstName: "Joel",
        lastName: "Robinson",
      },
    ),
    (
      "Jonah_Heston_________",
      {
        id: "Jonah_Heston_________",
        matchCount: 50,
        rating: 2200,
        type_: "person",
        firstName: "Jonah",
        lastName: "Heston",
      },
    ),
    (
      "Kinga_Forrester______",
      {
        id: "Kinga_Forrester______",
        matchCount: 20,
        rating: 1900,
        type_: "person",
        firstName: "Kinga",
        lastName: "Forrester",
      },
    ),
    (
      "Larry_Erhardt________",
      {
        id: "Larry_Erhardt________",
        matchCount: 45,
        rating: 1300,
        type_: "person",
        firstName: "Larry",
        lastName: "Erhardt",
      },
    ),
    (
      "Mike_Nelson__________",
      {
        id: "Mike_Nelson__________",
        matchCount: 60,
        rating: 2300,
        type_: "person",
        firstName: "Mike",
        lastName: "Nelson",
      },
    ),
    (
      "Newbie_McNewberson___",
      {
        id: "Newbie_McNewberson___",
        matchCount: 0,
        rating: 800,
        type_: "person",
        firstName: "Newbie",
        lastName: "McNewberson",
      },
    ),
    (
      "Observer_Brain_Guy___",
      {
        id: "Observer_Brain_Guy___",
        matchCount: 55,
        rating: 1200,
        type_: "person",
        firstName: "Brain",
        lastName: "Guy",
      },
    ),
    (
      "Pearl_Forrester______",
      {
        id: "Pearl_Forrester______",
        matchCount: 30,
        rating: 2000,
        type_: "person",
        firstName: "Pearl",
        lastName: "Forrester",
      },
    ),
    (
      "Professor_Bobo_______",
      {
        id: "Professor_Bobo_______",
        matchCount: 75,
        rating: 1000,
        type_: "person",
        firstName: "Bobo",
        lastName: "Professor",
      },
    ),
    (
      "TVs_Frank____________",
      {
        id: "TVs_Frank____________",
        matchCount: 35,
        rating: 1400,
        type_: "person",
        firstName: "TV's",
        lastName: "Frank",
      },
    ),
    (
      "TVs_Son_of_TVs_Frank_",
      {
        id: "TVs_Son_of_TVs_Frank_",
        matchCount: 65,
        rating: 1100,
        type_: "person",
        firstName: "TV's",
        lastName: "Max",
      },
    ),
    (
      "Tom_Servo____________",
      {
        id: "Tom_Servo____________",
        matchCount: 10,
        rating: 1800,
        type_: "person",
        firstName: "Tom",
        lastName: "Servo",
      },
    ),
  |]);

let tournaments =
  Js.Dict.fromArray([|
    (
      "Bye_Round_Tourney____",
      Tournament.{
        byeQueue: [||],
        date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
        id: "Bye_Round_Tourney____",
        playerIds: [|
          "Joel_Robinson________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
          "Cambot_______________",
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
        |],
        roundList: [|[||]|],
        tieBreaks: [|0, 1, 2, 3|],
        name: "Bye Round Tourney",
      },
    ),
    (
      "Bye_Round_Tourney_2__",
      {
        byeQueue: [||],
        date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
        id: "Bye_Round_Tourney_2__",
        playerIds: [|
          "Joel_Robinson________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
          "Cambot_______________",
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
        |],
        roundList: [|
          [|
            {
              id: "xTXxZHB0sTt__xIAg45fm",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 2592,
              blackNewRating: 1833,
              whiteOrigRating: 2600,
              blackOrigRating: 1700,

              whiteId: "Grandy_McMaster______",
              blackId: "Crow_T_Robot_________",
            },
            {
              id: "zQcf9RWXK7iuU6ibPzrhU",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 2400,
              blackNewRating: 1600,
              whiteOrigRating: 2400,
              blackOrigRating: 1600,

              whiteId: "Joel_Robinson________",
              blackId: "Gypsy________________",
            },
            {
              id: "Vw_X0c7O4vshrYEO-oSzR",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1738,
              blackNewRating: 1526,
              whiteOrigRating: 1800,
              blackOrigRating: 1500,

              whiteId: "Tom_Servo____________",
              blackId: "Cambot_______________",
            },
            {
              id: "iSDujOVkOTrcLv_KJmd7s",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 800,
              blackNewRating: 0,
              whiteOrigRating: 800,
              blackOrigRating: 0,

              whiteId: "Newbie_McNewberson___",
              blackId: "________DUMMY________",
            },
          |],
        |],
        tieBreaks: [|0, 1, 2, 3|],
        name: "Bye Round Tourney 2",
      },
    ),
    (
      "Bye_Tourney_3________",
      {
        byeQueue: [||],
        date: Js.Date.fromString("2019-06-17T23:00:29.603Z"),
        id: "Bye_Tourney_3________",
        playerIds: [|
          "Kinga_Forrester______",
          "Newbie_McNewberson___",
          "Jonah_Heston_________",
        |],
        roundList: [|
          [|
            {
              id: "KkFr4B7FDqiHRWmACgApf",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1894,
              blackNewRating: 2202,
              whiteOrigRating: 1900,
              blackOrigRating: 2200,

              whiteId: "Kinga_Forrester______",
              blackId: "Jonah_Heston_________",
            },
            {
              id: "R_BTsGSziwgyvFZM3yc5u",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 793,
              blackNewRating: 0,
              whiteOrigRating: 793,
              blackOrigRating: 0,

              whiteId: "Newbie_McNewberson___",
              blackId: "________DUMMY________",
            },
          |],
          [|
            {
              id: "rcyCfpZU6olav5kdVac44",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 2187,
              blackNewRating: 953,
              whiteOrigRating: 2202,
              blackOrigRating: 793,

              whiteId: "Jonah_Heston_________",
              blackId: "Newbie_McNewberson___",
            },
            {
              id: "Nc0Om5fEuwSuzFls9wmME",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 1894,
              blackNewRating: 0,
              whiteOrigRating: 1894,
              blackOrigRating: 0,

              whiteId: "Kinga_Forrester______",
              blackId: "________DUMMY________",
            },
          |],
          [|
            {
              id: "uawjKwbiA38RP8pA--tlw",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 952,
              blackNewRating: 1894,
              whiteOrigRating: 953,
              blackOrigRating: 1894,

              whiteId: "Newbie_McNewberson___",
              blackId: "Kinga_Forrester______",
            },
            {
              id: "-kwIDxjPhWVRbqxtRZ26_",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 2187,
              blackNewRating: 0,
              whiteOrigRating: 2187,
              blackOrigRating: 0,

              whiteId: "Jonah_Heston_________",
              blackId: "________DUMMY________",
            },
          |],
        |],
        tieBreaks: [|0, 1, 2, 3|],
        name: "Bye Tourney 3",
      },
    ),
    (
      "Simple_Pairing_______",
      {
        byeQueue: [||],
        date: Js.Date.fromString("2019-06-14T11:40:34.407Z"),
        id: "Simple_Pairing_______",
        playerIds: [|
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
          "Joel_Robinson________",
          "Dr_Clayton_Forrester_",
          "TVs_Frank____________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
        |],
        roundList: [|
          [|
            {
              id: "KdLva8hWqYHdaU9KnFTe2",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1699,
              blackNewRating: 2600,
              whiteOrigRating: 1700,
              blackOrigRating: 2600,

              whiteId: "Crow_T_Robot_________",
              blackId: "Grandy_McMaster______",
            },
            {
              id: "WDPFsNF1yADs4qofFwCY0",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 1650,
              blackNewRating: 2389,
              whiteOrigRating: 1600,
              blackOrigRating: 2400,

              whiteId: "Gypsy________________",
              blackId: "Joel_Robinson________",
            },
            {
              id: "R5sXfTOJw5vrJ4IytAjSi",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1400,
              blackNewRating: 2100,
              whiteOrigRating: 1400,
              blackOrigRating: 2100,

              whiteId: "TVs_Frank____________",
              blackId: "Dr_Clayton_Forrester_",
            },
            {
              id: "2YOsn_JJFnaUMhRBAc9KY",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 1597,
              blackNewRating: 1728,
              whiteOrigRating: 800,
              blackOrigRating: 1800,

              whiteId: "Newbie_McNewberson___",
              blackId: "Tom_Servo____________",
            },
          |],
          [||],
        |],
        tieBreaks: [|0, 1, 2, 3|],
        name: "Simple Pairing",
      },
    ),
    (
      "Pairing_With_Draws___",
      {
        byeQueue: [||],
        date: Js.Date.fromString("2019-06-14T14:18:06.686Z"),
        id: "Pairing_With_Draws___",
        playerIds: [|
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
          "Joel_Robinson________",
          "Dr_Clayton_Forrester_",
          "TVs_Frank____________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
        |],
        roundList: [|
          [|
            {
              id: "ryWXwvFGwBKQqGBbMYeps",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1699,
              blackNewRating: 2600,
              whiteOrigRating: 1700,
              blackOrigRating: 2600,

              whiteId: "Crow_T_Robot_________",
              blackId: "Grandy_McMaster______",
            },
            {
              id: "2KKVbi0AfNxfJAJobTgP5",
              whiteScore: 1.0,
              blackScore: 0.0,
              whiteNewRating: 1650,
              blackNewRating: 2389,
              whiteOrigRating: 1600,
              blackOrigRating: 2400,

              whiteId: "Gypsy________________",
              blackId: "Joel_Robinson________",
            },
            {
              id: "zdlBHBAqgV2qabn2oBa2a",
              whiteScore: 0.0,
              blackScore: 1.0,
              whiteNewRating: 1400,
              blackNewRating: 2100,
              whiteOrigRating: 1400,
              blackOrigRating: 2100,

              whiteId: "TVs_Frank____________",
              blackId: "Dr_Clayton_Forrester_",
            },
            {
              id: "8fGxU3tLpd8GibuSQr9-Y",
              whiteScore: 0.5,
              blackScore: 0.5,
              whiteNewRating: 1197,
              blackNewRating: 1764,
              whiteOrigRating: 800,
              blackOrigRating: 1800,

              whiteId: "Newbie_McNewberson___",
              blackId: "Tom_Servo____________",
            },
          |],
          [||],
        |],
        tieBreaks: [|0, 1, 2, 3|],
        name: "Pairing with draws",
      },
    ),
  |]);