import React, {useState, useContext} from "react";
import curry from "ramda/src/curry";
import numeral from "numeral";
import dashify from "dashify";
import {PanelContainer, Panel} from "../utility";
import {dummyPlayer, getPlayerById} from "../../data/player";
import {DataContext} from "state/global-state";
import {calcStandings, tieBreakMethods} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";

// let's make a custom numeral format. I don't really know how this works.
numeral.register("format", "half", {
    regexps: {
        format: /(1\/2)/,
        unformat: /(1\/2)/
    },
    format: function (value, format, roundingFunction) {
        let whole = Math.floor(value);
        let remainder = value - whole;
        if (remainder === 0.5) {
            remainder = "½";
        } else if (remainder === 0) {
            remainder = "";
        }
        if (whole === 0 && remainder) {
            whole = "";
        }
        // let output = numeral._.numberToFormat(value, format, roundingFunction);
        // return output;
        return String(whole) + remainder;
    }
});

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 */
function ScoreList({tourneyId}) {
    const {data} = useContext(DataContext);
    const getPlayer = curry(getPlayerById)(data.players);
    const tourney = data.tourneys[tourneyId];
    const [standingTree, tbMethods] = calcStandings(
        tourney.tieBreaks,
        tourney.roundList
    );
    return (
        <table className={style.table}>
            <caption>Standings</caption>
            <tbody>
                <tr className={style.topHeader}>
                    <th scope="col">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col">Score</th>
                    {tbMethods.map((name, i) => (
                        <th key={i} scope="col">
                            {name}
                        </th>
                    ))}
                </tr>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.filter(
                        (p) => p.id !== dummyPlayer.id
                    ).map((standing, j, src) => (
                        <tr key={standing.id} className={style.row}>
                            {j === 0 && ( // Only display the rank once
                                <th
                                    scope="row"
                                    className={"table__number " + style.rank}
                                    rowSpan={src.length}
                                >
                                    {numeral(rank + 1).format("0o")}
                                </th>
                            )}
                            <th
                                scope="row"
                                className={style.playerName}
                                data-testid={rank}
                            >
                                {getPlayer(standing.id).firstName}&nbsp;
                                {getPlayer(standing.id).lastName}
                            </th>
                            <td
                                className="table__number"
                                data-testid={dashify(
                                    getPlayer(standing.id).firstName
                                    + getPlayer(standing.id).lastName
                                    + " score"
                                )}
                            >
                                {numeral(standing.score).format("1/2")}
                            </td>
                            {standing.tieBreaks.map((score, i) => (
                                <td
                                    key={i}
                                    className="table__number"
                                    data-testid={dashify(
                                        getPlayer(standing.id).firstName
                                        + getPlayer(standing.id).lastName
                                        + tbMethods[i]
                                    )}
                                >
                                    {numeral(score).format("1/2")}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

function SelectTieBreaks({tourneyId}) {
    const {data, dispatch} = useContext(DataContext);
    const tourney = data.tourneys[tourneyId];
    const [selectedTb, setSelectedTb] = useState(null);
    /** @param {number} [id] */
    function toggleTb(id = null) {
        if (!id) {
            id = selectedTb;
        }
        const tieBreaks = data.tourneys[tourneyId].tieBreaks;
        if (tieBreaks.includes(id)) {
            dispatch({type: "DEL_TIEBREAK", id: id, tourneyId: tourneyId});
        } else {
            dispatch({type: "ADD_TIEBREAK", id: id, tourneyId: tourneyId});
        }
    }
    /** @param {number} direction */
    function moveTb(direction) {
        const index = data.tourneys[tourneyId].tieBreaks.indexOf(selectedTb);
        dispatch({
            type: "MOVE_TIEBREAK",
            tourneyId: tourneyId,
            oldIndex: index,
            newIndex: index + direction
        });
    }
    return (
        <div>
            <h3>Selected tiebreak methods</h3>
            <div className="toolbar">
                <button
                    onClick={() => toggleTb()}
                    disabled={selectedTb === null}
                >
                    Toggle
                </button>
                <button
                    onClick={() => moveTb(-1)}
                    disabled={selectedTb === null}
                >
                    Move up
                </button>
                <button
                    onClick={() => moveTb(1)}
                    disabled={selectedTb === null}
                >
                    Move down
                </button>
                <button
                    onClick={() => setSelectedTb(null)}
                    disabled={selectedTb === null}
                >
                    Done
                </button>
            </div>
            <ol>
                {tourney.tieBreaks.map((id) => (
                    <li key={id}>
                        {tieBreakMethods[id].name}
                        <button
                            onClick={() =>
                                selectedTb === id
                                    ? setSelectedTb(null)
                                    : setSelectedTb(id)
                            }
                            disabled={
                                selectedTb !== null && selectedTb !== id
                            }
                        >
                            {selectedTb === id ? "Done" : "Edit"}
                        </button>
                    </li>
                ))}
            </ol>
            <h3>Available tiebreak methods</h3>
            <ol>
                {tieBreakMethods.map((method, i) => (
                    <li key={i}>
                        <span
                            className={
                                tourney.tieBreaks.includes(i)
                                    ? "enabled"
                                    : "disabled"
                            }
                        >
                            {method.name}
                        </span>
                        {!tourney.tieBreaks.includes(i) && (
                            <button onClick={() => toggleTb(i)}>
                                Add
                            </button>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

const Scores = ({tourneyId}) => (
    <PanelContainer>
        <Panel>
            <ScoreList tourneyId={tourneyId}/>
        </Panel>
        <Panel>
            <SelectTieBreaks tourneyId={tourneyId}/>
        </Panel>
    </PanelContainer>
);

export default Scores;
