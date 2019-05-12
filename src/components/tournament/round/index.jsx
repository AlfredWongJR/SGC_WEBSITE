import React, {useState} from "react";
import "@reach/menu-button/styles.css";
import curry from "ramda/src/curry";
import Repeat from "react-feather/dist/icons/repeat";
import Trash from "react-feather/dist/icons/trash-2";
import ArrowUp from "react-feather/dist/icons/arrow-up";
import ArrowDown from "react-feather/dist/icons/arrow-down";
import MatchRow from "./match-row";
import PlayerMatchInfo from "./player-match-info";
import PairPicker from "./pair-picker";
import {PanelContainer, Panel} from "../../utility";
import {getPlayerById} from "../../../data/player";
import {getById, getIndexById} from "../../../data/utility";
import {useTournament} from "../../../state/tourneys-state";
import {usePlayers} from "../../../state/player-state";
import style from "./round.module.css";

/**
 * @param {Object} props
 * @param {number} props.roundId
 * @param {number} props.tourneyId
 */
export default function Round({roundId, tourneyId}) {
    const [tourney, dispatch] = useTournament(tourneyId);
    const {playerState, playerDispatch} = usePlayers();
    const getPlayer = curry(getPlayerById)(playerState.players);
    const matchList = tourney.roundList[roundId];
    /** @type {string} */
    const defaultMatch = null;
    const [selectedMatch, setSelectedMatch] = useState(defaultMatch);
    /** @param {string} matchId */
    function unMatch(matchId) {
        const match = getById(tourney.roundList[roundId], matchId);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.players.forEach(function (pId, color) {
                playerDispatch({
                    type: "SET_PLAYER_MATCHCOUNT",
                    id: pId,
                    matchCount: getPlayer(pId).matchCount - 1
                });
                playerDispatch({
                    type: "SET_PLAYER_RATING",
                    id: pId,
                    rating: match.origRating[color]
                });
            });
        }
        dispatch({type: "DEL_MATCH", tourneyId, roundId, matchId});
        setSelectedMatch(null);
    }
    /** @param {string} matchId */
    function swapColors(matchId) {
        dispatch({type: "SWAP_COLORS", tourneyId, roundId, matchId});
    }
    /**
     * @param {string} matchId
     * @param {number} direction
     */
    function moveMatch(matchId, direction) {
        const matchesRef = tourney.roundList[roundId];
        const oldIndex = getIndexById(matchesRef, matchId);
        const newIndex = (
            (oldIndex + direction >= 0)
            ? oldIndex + direction
            : 0
        );
        dispatch({type: "MOVE_MATCH", tourneyId, roundId, oldIndex, newIndex});
    }
    return (
        <PanelContainer>
            <Panel>
                <div className={style.toolbar}>
                    <button
                        className="danger iconButton"
                        onClick={() => unMatch(selectedMatch)}
                        disabled={selectedMatch === null}
                        title="Unmatch"
                        aria-label="Unmatch"
                    >
                        <Trash />
                    </button>
                    <button
                        className="iconButton"
                        onClick={() => swapColors(selectedMatch)}
                        disabled={selectedMatch === null}
                        title="Swap colors"
                        aria-label="Swap colors"
                    >
                        <Repeat />
                    </button>
                    <button
                        className="iconButton"
                        onClick={() => moveMatch(selectedMatch, -1)}
                        disabled={selectedMatch === null}
                        title="Move up"
                        aria-label="Move up"
                    >
                        <ArrowUp />
                    </button>
                    <button
                        className="iconButton"
                        onClick={() => moveMatch(selectedMatch, 1)}
                        disabled={selectedMatch === null}
                        title="Move down"
                        aria-label="Move down"
                    >
                        <ArrowDown/>
                    </button>
                </div>
                {(matchList.length === 0) &&
                    <p>No players matched yet.</p>
                }
                <table className={style.table}>
                    {(matchList.length > 0) &&
                        <caption>Round {roundId + 1} results</caption>
                    }
                    <tbody>
                        {(matchList.length > 0) &&
                            <tr>
                                <th className="row__id" scope="col">
                                    #
                                </th>
                                <th className="row__player" scope="col">
                                    White
                                </th>
                                <th className="row__player" scope="col">
                                    Black
                                </th>
                                <th className="row__result" scope="col">
                                    Result
                                </th>
                                <th className="row__controls" scope="col">
                                    Controls
                                </th>
                            </tr>
                        }
                        {matchList.map((match, pos) => (
                            <MatchRow
                                key={match.id}
                                pos={pos}
                                match={match}
                                tourneyId={tourneyId}
                                roundId={roundId}
                                selectedMatch={selectedMatch}
                                setSelectedMatch={setSelectedMatch}
                            />
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel>
                {selectedMatch !== null && (
                    <PanelContainer>
                        <Panel>
                            <PlayerMatchInfo
                                match={getById(matchList, selectedMatch)}
                                color={0}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                        <Panel>
                            <PlayerMatchInfo
                                match={getById(matchList, selectedMatch)}
                                color={1}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                    </PanelContainer>
                )}
                <PairPicker
                    tourneyId={tourneyId}
                    roundId={roundId}
                />
            </Panel>
        </PanelContainer>
    );
}
