// @ts-check
import {dummyPlayer} from "./player";
import {last} from "lodash";
import pairPlayers from "./pairing";
import createMatch from "./match";
/**
 * @typedef {import("./tournament").tournament} tournament
 * @typedef {import("./player").player} player
 * @typedef {import("./match").match} match
 */
/**
 * @typedef {Object} round
 * @property {number} id
 * @property {tournament} ref_tourney
 * @property {player[]} roster
 * @property {round} ref_prevRound
 * @property {match[]} matches
 * @property {function(): boolean} isComplete
 * @property {function(player): match} getMatchByPlayer
 * @property {function(player): number} playerColor `0` for white, `1` for
 * black, or `-1` if the player wasn't found.
 * @property {function(player)} addPlayer
 * @property {function(): boolean} hasBye
 * @property {function(match)} removeMatch
 * @property {function(string)} toJSON
 */

/**
 *
 * @param {tournament} tourney
 * @param {Object} importObj
 * @returns {round}
 */
function createRound(tourney, importObj = {}) {
    /**
     * @type {round}
     */
    const newRound = {
        id: (
            (importObj.id !== undefined)
            ? importObj.id
            : tourney.roundList.length
        ),
        ref_tourney: tourney,
        roster: importObj.roster || tourney.players.getActive(),
        ref_prevRound: importObj.ref_prevRound || last(tourney.roundList),
        matches: importObj.matches || null,
        isComplete() {
            return !newRound.matches.map((m) => m.isComplete()).includes(false);
        },
        getMatchByPlayer(player) {
            let theMatch = null;
            newRound.matches.forEach(function (match) {
                if (match.roster.includes(player)) {
                    theMatch = match;
                }
            });
            return theMatch;
        },
        playerColor(player) {
            let color = -1;
            const match = newRound.getMatchByPlayer(player);
            if (match) {
                color = match.getPlayerColor(player);
            }
            return color;
        },
        addPlayer(player) {
            newRound.roster.push(player);
            return newRound;
        },
        hasBye() {
            return newRound.roster.includes(dummyPlayer);
        },
        removeMatch(match) {
            if (typeof match === "number") {
                match = newRound.matches[match];
            }
            match.resetResult();
            match.roster.forEach(function (player) {
                player.matchCount -= 1;
            });
            newRound.matches = newRound.matches.filter((m) => m !== match);
            return newRound;
        },
        toJSON(key) {
            if (key === "prevRound") {
                return newRound.id;
            } else {
                return newRound;
            }
        }
    };
    newRound.roster = newRound.roster.map(function (player) {
        if (typeof player === "number") {
            return tourney.players.getPlayerById(player);
        } else {
            return player;
        }
    });
    if (newRound.matches) {
        // If match data was imported, then init it.
        newRound.matches = newRound.matches.map(
            (matchData) => createMatch(
                Object.assign(matchData, {ref_round: newRound})
            )
        );
    } else {
        newRound.matches = pairPlayers(newRound);
    }
    newRound.matches.forEach(function (match, index) {
        match.id = index;
    });
    return newRound;
}

export default Object.freeze(createRound);