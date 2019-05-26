import {BLACK, WHITE} from "../data-types";
import EloRank from "elo-rank";
import t from "tcomb";

export function kFactor(matchCount) {
    const ne = t.Number(matchCount) || 1;
    return (800 / ne);
}

export function calcNewRatings(origRatings, matchCounts, result) {
    t.tuple([t.Number, t.Number])(origRatings);
    t.tuple([t.Number, t.Number])(matchCounts);
    t.tuple([t.Number, t.Number])(result);
    const whiteElo = new EloRank(kFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(kFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
    const newRating = [
        whiteElo.updateRating(
            scoreExpected[WHITE],
            result[WHITE],
            origRatings[WHITE]
        ),
        blackElo.updateRating(
            scoreExpected[BLACK],
            result[BLACK],
            origRatings[BLACK]
        )
    ];
    return newRating.map((rating) => (rating < FLOOR) ? FLOOR : rating);
}
