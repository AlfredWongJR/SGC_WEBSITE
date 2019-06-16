import {
    assoc,
    descend,
    dissoc,
    filter,
    last,
    map,
    mergeRight,
    pipe,
    pluck,
    prop,
    sort,
    sortWith,
    splitAt,
    sum
} from "ramda";
import blossom from "edmonds-blossom";
import t from "tcomb";
import types from "./types";

const priority = (value) => (condition) => (condition) ? value : 0;
const divisiblePriority = (dividend) => (divisor) => dividend / divisor;

// These following consts probably need to be tweaked a lot.

// The weight given to avoid players meeting twice. This same weight is given to
// avoid matching players on each other's "avoid" list.
// This is the highest priority. (USCF § 27A1)
const avoidMeetingTwice = priority(32);

// The weight given to match players with equal scores. This gets divided
// against the difference between each players' scores, plus one. For example,
// players with scores `1` and `3` would have this priority divided by `3`.
// Players with scores `0` and `3` would have this priority divided by `4`.
// Players with equal scores would divide it by `1`, leaving it unchanged.
// (USCF § 27A2)
const sameScores = divisiblePriority(16);

// The weight given to match players in lower versus upper halves. This is only
// applied to players being matched within the same score group. (USCF § 27A3)
const halfPosition = divisiblePriority(8);
const sameHalfPriority = () => 0;
const differentHalf = (isDiffHalf) => (isDiffHalf)
    ? halfPosition
    : sameHalfPriority;

// The weight given to match players with opposite due colors.
// (USCF § 27A4 and § 27A5)
const differentDueColor = priority(4);

// This is useful for dividing against a calculated priority, to inspect how
// "compatible" two players may be.
const maxPriority = sum([
    differentHalf(true)(1),
    differentDueColor(true),
    sameScores(1),
    avoidMeetingTwice(true)
]);
export {maxPriority};

// The pairing code is broken up into several functions which take each other's
// input to build the data necessary to pair players appropriately.
// Using a function like Ramda's `pipe` to put them together, the final product
// will look something like this:
// ```js
// const pairs = pipe(
//     rounds2Matches,
//     matches2ScoreData,
//     createPairingData,
//     setUpperHalves,
//     setByePlayer,
//     pairPlayers // <-- the function that actually pairs them!
// )(roundList);
// ```
// (This may be outdated as the actual functions aren't stable yet.)

// Given two `PairingData` objects, this assigns a number for how much they
// should be matched. The number gets fed to the `blossom` algorithm.
export function calcPairIdeal(player1, player2) {
    if (player1.id === player2.id) {
        return 0;
    }
    const metBefore = player1.opponents.includes(player2.id);
    const mustAvoid = player1.avoidIds.includes(player2.id);
    const p1LastColor = last(player1.colors);
    const p2LastColor = last(player2.colors);
    const scoreDiff = Math.abs(player1.score - player2.score) + 1;
    const halfDiff = Math.abs(player1.halfPos - player2.halfPos) + 1;
    const isDiffHalf = (
        player1.isUpperHalf !== player2.isUpperHalf
        && player1.score === player2.score
    );
    return sum([
        differentDueColor(
            p1LastColor === undefined || p1LastColor !== p2LastColor
        ),
        sameScores(scoreDiff),
        differentHalf(isDiffHalf)(halfDiff),
        avoidMeetingTwice(!metBefore && !mustAvoid)
    ]);
}

const splitInHalf = (list) => splitAt(list.length / 2, list);

// for each object sent to this, it determines whether or not it's in the
// "upper half" of it's score group.
// (USCF § 29C1.)
function upperHalfReducer(acc, playerData, ignore, src) {
    types.PairingData(playerData);
    const [upperHalfIds, lowerHalfIds] = pipe(
        filter((p2) => p2.score === playerData.score),
        // this may be redundant if the list was already sorted.
        sort(descend(prop("rating"))),
        map((p) => p.id),
        splitInHalf
    )(src);
    const isUpperHalf = upperHalfIds.includes(playerData.id);
    const halfPos = (isUpperHalf)
        ? upperHalfIds.indexOf(playerData.id)
        : lowerHalfIds.indexOf(playerData.id);
    return assoc(
        playerData.id,
        mergeRight(playerData, {halfPos, isUpperHalf}),
        acc
    );
}
export function setUpperHalves(data) {
    return Object.values(data).reduce(upperHalfReducer, {});
}

// Sort the data so matchups default to order by score and rating.
const sortByScoreThenRating = sortWith([
    descend(prop("score")),
    descend(prop("rating"))
]);
// This this returns a tuple of two objects: The modified array of player data
// without the player assigned a bye, and the player assigned a bye.
// If no player is assigned a bye, the second object is `null`.
// After calling this, be sure to add the bye round after the non-bye'd
// players are paired.
export function setByePlayer(byeQueue, dummyId, data) {
    t.dict(t.String, types.PairingData);
    const hasNotHadBye = (p) => !p.opponents.includes(dummyId);
    // if the list is even, just return it.
    if (Object.keys(data).length % 2 === 0) {
        return [data, null];
    }
    const dataList = pipe(
        Object.values,
        filter(hasNotHadBye),
        sortByScoreThenRating
    )(data);
    const playersWithoutByes = dataList.map((p) => p.id);
    const nextByeSignup = t.list(t.String)(byeQueue).filter(
        (id) => playersWithoutByes.includes(id)
    )[0];
    const dataForNextBye = (nextByeSignup)
        // Assign the bye to the next person who signed up.
        ? data[nextByeSignup]
        // Assign a bye to the lowest-rated player in the lowest score group.
        // Because the list is sorted, the last player is the lowest.
        // (USCF § 29L2.)
        : last(dataList);
    // In the impossible situation that *everyone* has played a bye round
    // previously, then just pick the last player.
    const id = (dataForNextBye)
        ? dataForNextBye.id
        // TODO: test for this
        : pipe(Object.values, sortByScoreThenRating, last)(data);
    const byeData = data[id];
    const dataWithoutBye = dissoc(id, data);
    return [dataWithoutBye, byeData];
}

const netScoreDescend = (pair1, pair2) => (
    sum(pluck("score", pair2)) - sum(pluck("score", pair1))
);
const netRatingDescend = (pair1, pair2) => (
    sum(pluck("rating", pair2)) - sum(pluck("rating", pair1))
);
const sortByNetScoreThenRating = sortWith([netScoreDescend, netRatingDescend]);

// Create pairings according to the rules specified in USCF § 27, § 28,
//  and § 29. This is a work in progress and does not account for all of the
// rules yet.
export function pairPlayers(pairingData) {
    t.dict(t.String, types.PairingData);
    // Because `blossom` has to use numbers that correspond to array indices,
    // we'll use `playerIdArray` as our source for that.
    const playerIdArray = Object.keys(pairingData);
    // Turn the data into blossom-compatible input.
    function idealReduce(accArr, player1, index, srcArr) {
        // slice out players who have already computed, plus the current one
        const playerMatches = srcArr.slice(index + 1).map(
            (player2) => [
                playerIdArray.indexOf(player1.id),
                playerIdArray.indexOf(player2.id),
                calcPairIdeal(player1, player2)
            ]
        );
        return accArr.concat(playerMatches);
    }
    const potentialMatches = Object.values(pairingData).reduce(idealReduce, []);
    // Feed all of the potential matches to Edmonds-blossom and let the
    // algorithm work its magic. This returns an array where each index is the
    // ID of one player and each value is the ID of the matched player.
    const blossomResults = blossom(potentialMatches);
    // Translate those IDs into actual pairs of player Ids.
    const reducedResults = blossomResults.reduce(
        function blossom2Pairs(acc, p1Index, p2Index) {
            // Filter out unmatched players. Blossom will automatically include
            // their missing IDs in its results.
            if (p1Index !== -1) {
                // Translate the indices into ID strings
                const p1Id = playerIdArray[p1Index];
                const p2Id = playerIdArray[p2Index];
                const p1 = pairingData[p1Id];
                const p2 = pairingData[p2Id];

                // TODO: in the future, we may store the ideal for debugging
                // Because it rarely serves a purpose, we're not including it
                // for simplification.
                // const ideal = potentialMatches.filter(
                //     (pair) => pair[0] === p1Id && pair[1] === p2Id
                // )[0][2];

                // Blossom returns a lot of redundant matches. Check that this
                // matchup wasn't already added.
                const matched = acc.map((pair) => pair[0]);
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    return acc.concat([[p1, p2]]);
                }
            }
            return acc;
        },
        []
    );
    // Sort by net score and rating for board placement.
    const sortedResults = sortByNetScoreThenRating(reducedResults);
    const matches = sortedResults.map(
        function assignColorsForPair(pair) {
            const [player1, player2] = pair;
            // This is a quick-and-dirty heuristic to keep color balances
            // mostly equal. Ideally, it would also examine due colors and how
            // many times a player played each color last.
            return (sum(player1.colorScores) < sum(player2.colorScores))
                // player 1 has played as white more than player 2
                ? [player2.id, player1.id]
                // player 1 has played as black more than player 2
                // (or they're equal).
                : [player1.id, player2.id];
        }
    );
    return matches;
}
