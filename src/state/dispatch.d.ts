import {Player, Tournament} from "../chess-tourney/index";

declare interface ActionByeValue {
    type: "SET_BYE_VALUE",
    byeValue: number
}
declare interface ActionAddPlayer {
    type: "ADD_PLAYER",
    newPlayer: Player
}
declare interface ActionDelPlayer {
    type: "DEL_PLAYER",
    id: number
}
declare interface ActionSetMatchcount {
    type: "SET_PLAYER_MATCHCOUNT",
    id: number,
    matchCount: number
}
declare interface ActionSetRating {
    type: "SET_PLAYER_RATING",
    id: number,
    rating: number
}
declare interface ActionAvoidPair {
    type: "ADD_AVOID_PAIR" | "DEL_AVOID_PAIR",
    pair: number[]
}
declare interface ActionAddTourney {
    type: "ADD_TOURNEY",
    tourney: Tournament
}
declare interface ActionDelTourney {
    type: "DEL_TOURNEY",
    index: number
}
declare interface ActionAddRound {
    type: "ADD_ROUND",
    tourneyId: number
}
declare interface ActionDelLastRound {
    type: "DEL_LAST_ROUND",
    tourneyId: number
}
declare interface ActionAddRemoveTieBreak {
    type: "ADD_TIEBREAK" | "DEL_TIEBREAK",
    tourneyId: number,
    id: number
}
declare interface ActionMoveTieBreak {
    type: "MOVE_TIEBREAK",
    tourneyId: number
    oldIndex: number,
    newIndex: number
}
declare interface ActionSetTourneyPlayers {
    type: "SET_TOURNEY_PLAYERS",
    tourneyId: number,
    players: number[]
}
declare interface ActionSetByeQueue {
    type: "SET_BYE_QUEUE",
    tourneyId: number,
    byeQueue: number[]
}
declare interface ActionAutoPair {
    type: "AUTO_PAIR",
    tourneyId: number,
    roundId: number,
    unpairedPlayers: number[]
}
declare interface ActionManualPair {
    type: "MANUAL_PAIR",
    tourneyId: number,
    roundId: number,
    pair: [number, number]
}
declare interface ActionSetMatchResult {
    type: "SET_MATCH_RESULT",
    tourneyId: number,
    roundId: number,
    matchId: string,
    result: [number, number],
    newRating: [number, number]
}
declare interface ActionDelMatch {
    type: "DEL_MATCH",
    tourneyId: number,
    roundId: number,
    matchId: string
}
declare interface ActionDelMatch {
    type: "SWAP_COLORS",
    tourneyId: number,
    roundId: number,
    matchId: string
}
declare interface ActionMoveMatch {
    type: "MOVE_MATCH",
    tourneyId: number,
    roundId: number,
    oldIndex: number,
    newIndex: number
}
export type Action = (
    ActionByeValue | ActionAddPlayer | ActionDelPlayer | ActionSetMatchcount
    | ActionSetRating | ActionAvoidPair | ActionAddTourney | ActionDelTourney
    | ActionAddRound | ActionDelLastRound | ActionAddRemoveTieBreak
    | ActionMoveTieBreak | ActionSetTourneyPlayers | ActionSetByeQueue
    | ActionAutoPair | ActionManualPair | ActionSetMatchResult | ActionDelMatch
    | SWAP_COLORS | ActionMoveMatch
);

export interface GlobalState {
    options: {
        byeValue: number
    },
    players: Player[],
    avoid: number[][],
    tourneys: Tournament[]
}