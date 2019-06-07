import {ScoreData, Standing} from "./types";
import {
    append,
    descend,
    lensIndex,
    over,
    path,
    prop,
    sortWith
} from "ramda";
import {
    areScoresEqual,
    isNotDummyObj
} from "./helpers";
import {
    getPlayerScore,
    tieBreakMethods
} from "./scoring";

/**
 * This is useful for cases where the regular factory functions return empty
 * results because a player hasn't been added yet.
 */
const createBlankScoreData = (id) => ScoreData({
    colorScores: [],
    colors: [],
    id,
    opponentResults: {},
    ratings: [],
    results: [],
    resultsNoByes: []
});
export {createBlankScoreData};

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * TODO: this needs performance improvements.
 * @returns {[Standing[], string[]]} The the list of the standings and a list
 * of the methods used. Each standing has a `tieBreaks` property which lists the
 * score associated with each method. The order of these coresponds to the order
 * of the method names in the second list.
 */
export function createStandingList(scoreData, methods) {
    // const scoreData = matches2ScoreData(rounds2Matches(roundList, roundId));
    const selectedTieBreaks = methods.map((i) => tieBreakMethods[i]);
    const tieBreakNames = selectedTieBreaks.map((m) => m.name);
    // Get a flat list of all of the players and their scores.
    const standings = Object.keys(scoreData).map(
        (id) => Standing({
            id,
            score: getPlayerScore(scoreData, id),
            tieBreaks: selectedTieBreaks.map(({func}) => func(scoreData, id))
        })
    );
    // create a list of functions to pass to `sortWith`. This will sort by
    // scores and then by each tiebreak value.
    const sortFuncList = Object.keys(selectedTieBreaks).reduce(
        (acc, key) => acc.concat([descend(path(["tieBreaks", key]))]),
        [descend(prop("score"))]
    );
    const standingsSorted = sortWith(sortFuncList, standings);
    return [standingsSorted, tieBreakNames];
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * example: `[[Dale, Audrey], [Pete], [Bob]]`
 * Dale and Audrey are tied for first, Pete is 2nd, Bob is 3rd.
 * @returns {[Standing[][], string[]]} The standings and the list of method used
 */
export function createStandingTree(scoreData, methods) {
    const [
        standingsFlat,
        tieBreakNames
    ] = createStandingList(scoreData, methods);
    const standingsFlatNoByes = standingsFlat.filter(isNotDummyObj);
    const standingsTree = standingsFlatNoByes.reduce(
        /** @param {Standing[][]} acc*/
        function assignStandingsToTree(acc, standing, i, orig) {
            const prevStanding = orig[i - 1];
            const isNewRank = (
                // Always make a new rank for the first player
                (i === 0) ? true : !areScoresEqual(standing, prevStanding)
            );
            if (isNewRank) {
                return append([standing], acc);
            }
            // If this player has the same score as the last, list them together
            return over(lensIndex(acc.length - 1), append(standing), acc);
        },
        []
    );
    return [standingsTree, tieBreakNames];
}
