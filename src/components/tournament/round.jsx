// @ts-check
import React, {Fragment, useState, useContext} from "react";
import numeral from "numeral";
import {OpenButton, PanelContainer, Panel, BackButton} from "../utility";
import {getPlayer, calcNewRatings, dummyPlayer} from "../../data/player";
import {genPlayerData} from "../../pairing-scoring/scoring";
import {BLACK, WHITE} from "../../data/constants";
import {getById, getIndexById} from "../../data/utility";
import {DataContext} from "../../state/global-state";

/**
 * @param {Object} props
 * @param {number} props.roundId
 * @param {number} props.tourneyId
 */
export default function Round({roundId, tourneyId,}) {
    const {data, dispatch} = useContext(DataContext);
    const playerList = data.players;
    const tourney = data.tourneys[tourneyId];
    const matchList = tourney.roundList[roundId];
    /** @type {number} */
    const defaultMatch = null;
    const [selectedMatch, setSelectedMatch] = useState(defaultMatch);
    /** @type {number[]} */
    const defaultPlayers = [];
    const [selectedPlayers, setSelectedPlayers] = useState(defaultPlayers);
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    function selectPlayer(event) {
        const pId = Number(event.target.value);
        if (event.target.checked) {
            setSelectedPlayers(function (prevState) {
                // stop React from adding an ID twice in a row
                if (!prevState.includes(pId)) {
                    prevState.push(pId);
                }
                // ensure that only the last two players stay selected.
                return prevState.slice(-2);
            });
        } else {
            setSelectedPlayers(selectedPlayers.filter((id) => id !== pId));
        }
    }
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unMatched = tourney.players.filter(
        (pId) => !matched.includes(pId)
    );
    /** @param {number[]} unpairedPlayers */
    function autoPair(unpairedPlayers) {
        dispatch({
            type: "AUTO_PAIR",
            tourneyId: tourneyId,
            roundId: roundId,
            unpairedPlayers: unpairedPlayers
        });
    }
    /** @param {number[]} pair */
    function manualPair(pair) {
        dispatch({
            type: "MANUAL_PAIR",
            tourneyId: tourneyId,
            roundId: roundId,
            unpairedPlayers: pair
        });
    }
    /**
     * @param {number} matchId
     * @param {[number, number]} result
     */
    function setMatchResult(matchId, result) {
        const match = getById(tourney.roundList[roundId], matchId);
        const white = getPlayer(match.players[WHITE], playerList);
        const black = getPlayer(match.players[BLACK], playerList);
        const newRating = calcNewRatings(
            match.origRating,
            [white.matchCount, black.matchCount],
            result
        );
        dispatch({
            type: "SET_PLAYER_RATING",
            id: white.id,
            rating: newRating[WHITE]
        });
        dispatch({
            type: "SET_PLAYER_RATING",
            id: black.id,
            rating: newRating[BLACK]
        });
        // if the result hasn't been scored yet, increment the matchCount
        if (match.result.reduce((a, b) => a + b) === 0) {
            dispatch({
                type: "SET_PLAYER_MATCHCOUNT",
                id: white.id,
                matchCount: white.matchCount + 1
            });
            dispatch({
                type: "SET_PLAYER_MATCHCOUNT",
                id: black.id,
                matchCount: black.matchCount + 1
            });
        }
        // setPlayerList([...playerList]);
        dispatch({
            type: "SET_MATCH_RESULT",
            tourneyId: tourneyId,
            roundId: roundId,
            matchId: matchId,
            result: result,
            newRating: newRating
        });
    }
    /** @param {number} matchId */
    function unMatch(matchId) {
        const match = getById(tourney.roundList[roundId], matchId);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.players.forEach(function (pId, color) {
                dispatch({
                    type: "SET_PLAYER_MATCHCOUNT",
                    id: pId,
                    matchCount: getPlayer(pId, playerList).matchCount - 1
                });
                dispatch({
                    type: "SET_PLAYER_RATING",
                    id: pId,
                    rating: match.origRating[color]
                });
            });
        }
        dispatch({
            type: "DEL_MATCH",
            tourneyId: tourneyId,
            roundId: roundId,
            matchId: matchId
        });
        setSelectedMatch(null);
    }
    function swapColors(matchId) {
        dispatch({
            type: "SWAP_COLORS",
            tourneyId: tourneyId,
            roundId: roundId,
            matchId: matchId
        });
    }
    /**
     * @param {number} matchId
     * @param {number} direction
     */
    function moveMatch(matchId, direction) {
        const matchesRef = data.tourneys[tourneyId].roundList[roundId];
        const mIndex = getIndexById(matchesRef, matchId);
        dispatch({
            type: "MOVE_MATCH",
            tourneyId: tourneyId,
            roundId: roundId,
            matchId: matchId,
            oldIndex: mIndex,
            newIndex: mIndex + direction
        });
    }
    return (
        <PanelContainer>
            <Panel>
                <div className="toolbar">
                    <button
                        className="danger"
                        onClick={() => unMatch(selectedMatch)}
                        disabled={selectedMatch === null}>
                        Unmatch
                    </button>
                    <button
                        onClick={() => swapColors(selectedMatch)}
                        disabled={selectedMatch === null}>
                        Swap colors
                    </button>
                    <button
                        onClick={() => moveMatch(selectedMatch, -1)}
                        disabled={selectedMatch === null}>
                        Move up
                    </button>
                    <button
                        onClick={() => moveMatch(selectedMatch, 1)}
                        disabled={selectedMatch === null}>
                        Move down
                    </button>
                </div>
                <table className="table__roster">
                    <caption>Round {roundId + 1} results</caption>
                    <thead>
                        <tr>
                            <th className="row__id">#</th>
                            <th className="row__player">White</th>
                            <th className="row__result">Result</th>
                            <th className="row__player">Black</th>
                            <th className="row__controls"></th>
                        </tr>
                    </thead>
                    <tbody>{matchList.map((match, pos) => <tr key={match.id}>
                        <td className="table__number row__id">
                            {pos + 1}
                        </td>
                        <td className="table__player row__player">
                            {getPlayer(
                                match.players[0],
                                playerList
                            ).firstName}
                            {" "}
                            {getPlayer(
                                match.players[0],
                                playerList
                            ).lastName}
                        </td>
                        <td className="data__input row__result">
                            <input
                                type="radio"
                                checked={
                                    (match.result[0] > match.result[1])}
                                onChange={
                                    () => setMatchResult(match.id, [1, 0])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                            <input
                                type="radio"
                                checked={match.result.every((x) => x === 0.5)}
                                onChange={
                                    () => setMatchResult(match.id, [0.5, 0.5])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                            <input
                                type="radio"
                                checked={(match.result[1] > match.result[0])}
                                onChange={
                                    () => setMatchResult(match.id, [0, 1])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                        </td>
                        <td className="table__player row__player">
                            {getPlayer(match.players[1], playerList).firstName}
                            {" "}
                            {getPlayer(match.players[1], playerList).lastName}
                        </td>
                        <td className="data__input row__controls">
                            {(selectedMatch !== match.id)
                                ? <OpenButton
                                    action={
                                        () => setSelectedMatch(match.id)
                                    } />
                                : <BackButton
                                    action={() => setSelectedMatch(null)} />
                            }
                        </td>
                    </tr>)}</tbody>
                </table>
            </Panel>
            <Panel>
                {selectedMatch !== null &&
                <PanelContainer>
                    <Panel>
                        <PlayerMatchInfo
                            match={getById(matchList, selectedMatch)}
                            color={0}
                            tourneyId={tourneyId}
                            roundId={roundId}/>
                    </Panel>
                    <Panel>
                        <PlayerMatchInfo
                            match={getById(matchList, selectedMatch)}
                            color={1}
                            tourneyId={tourneyId}
                            roundId={roundId}/>
                    </Panel>
                </PanelContainer>
                }
                {unMatched.length > 0 && (
                    <Fragment>
                        <h3>Unmatched players</h3>
                        <ul>
                            {unMatched.map((pId) =>
                                <li key={pId}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPlayers.includes(pId)}
                                        value={pId}
                                        onChange={selectPlayer}/>
                                    {getPlayer(pId, playerList).firstName}
                                    {" "}
                                    {getPlayer(pId, playerList).lastName}
                                </li>
                            )}
                            {(unMatched.length % 2 !== 0) &&
                            <li>
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedPlayers.includes(dummyPlayer.id)
                                    }
                                    value={dummyPlayer.id}
                                    onChange={selectPlayer}/>
                                {dummyPlayer.firstName} {dummyPlayer.lastName}
                            </li>
                            }
                        </ul>
                        <button
                            onClick={() => manualPair(selectedPlayers)}
                            disabled={selectedPlayers.length !== 2}>
                            Pair checked
                        </button>
                        {" "}
                        <button
                            onClick={() => autoPair(unMatched)}
                            disabled={unMatched.length === 0}>
                            Auto-pair
                        </button>
                    </Fragment>
                )}
            </Panel>
        </PanelContainer>
    );
}

function PlayerMatchInfo({match, color, tourneyId, roundId}) {
    const {data} = useContext(DataContext);
    const playerList = data.players;
    const playerData = genPlayerData(
        match.players[color],
        playerList,
        data.avoid,
        data.tourneys[tourneyId].roundList,
        roundId
    );
    const colorBalance = playerData.colorBalance;
    let prettyBalance = "Even";
    if (colorBalance < 0) {
        prettyBalance = "White +" + Math.abs(colorBalance);
    } else if (colorBalance > 0) {
        prettyBalance = "Black +" + colorBalance;
    }
    return (
        <dl className="player-card">
            <h3>
                {playerData.data.firstName}
                {" "}
                {playerData.data.lastName}
            </h3>
            <dt>Score</dt>
            <dd>{playerData.score}</dd>
            <dt>Rating</dt>
            <dd>
                {match.origRating[color]}
                {" "}
                (
                {numeral(
                    match.newRating[color] - match.origRating[color]
                ).format("+0")}
                )
            </dd>
            <dt>Color balance</dt>
            <dd>{prettyBalance}</dd>
            <dt>Has had a bye round</dt>
            <dd>{(playerData.hasHadBye) ? "Yes" : "No"}</dd>
            <dt>Opponent history</dt>
            <dd>
                <ol>
                    {playerData.opponentHistory.map((opId) =>
                        <li key={opId}>
                            {getPlayer(opId, playerList).firstName}
                            {" "}
                            {getPlayer(opId, playerList).lastName}
                        </li>
                    )}
                </ol>
            </dd>
            <dt>Players to avoid</dt>
            <dd>
                <ol>
                    {playerData.avoidList.map((pId) =>
                        <li key={pId}>
                            {getPlayer(pId, playerList).firstName}
                            {" "}
                            {getPlayer(pId, playerList).lastName}
                        </li>
                    )}
                </ol>
            </dd>
        </dl>
    );
}
