import "@reach/dialog/styles.css";
import {BLACK, DUMMY_ID, WHITE} from "../../../data-types";
import {Panel, PanelContainer} from "../../utility";
import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import Icons from "../../icons";
import PlayerMatchInfo from "./player-match-info";
import PropTypes from "prop-types";
import {calcNewRatings} from "../../../pairing-scoring";
import {usePlayers} from "../../../state";
import {useTournament} from "../../../hooks";
import {winnerSelect} from "./round.module.css";

export default function MatchRow({
    pos,
    match,
    tourneyId,
    roundId,
    selectedMatch,
    setSelectedMatch
}) {
    const {tourney, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    const {playerDispatch, getPlayer} = usePlayers();
    const [openModal, setOpenModal] = useState(false);
    const resultCode = (function () {
        if (match.result[0] > match.result[1]) {
            return "WHITE";
        } else if (match.result[1] > match.result[0]) {
            return "BLACK";
        } else if (match.result.every((x) => x === 0.5)) {
            return "DRAW";
        } else {
            return "NOTSET";
        }
    }());
    const whiteName = (
        getPlayer(match.players[0]).firstName
        + " "
        + getPlayer(match.players[0]).lastName
    );
    const blackName = (
        getPlayer(match.players[1]).firstName
        + " "
        + getPlayer(match.players[1]).lastName
    );

    function setMatchResult(event) {
        const result = (function () {
            switch (event.target.value) {
            case "WHITE":
                return [1, 0];
            case "BLACK":
                return [0, 1];
            case "DRAW":
                return [0.5, 0.5];
            case "NOTSET":
                return [0, 0];
            default:
                throw new Error();
            }
        }());
        const white = getPlayer(match.players[WHITE]);
        const black = getPlayer(match.players[BLACK]);
        const newRating = (
            (event.currentTarget.value === "NOTSET")
            ? match.origRating
            : calcNewRatings(
                match.origRating,
                [white.matchCount, black.matchCount],
                result
            )
        );
        playerDispatch({
            id: white.id,
            rating: newRating[WHITE],
            type: "SET_PLAYER_RATING"
        });
        playerDispatch({
            id: black.id,
            rating: newRating[BLACK],
            type: "SET_PLAYER_RATING"
        });
        // if the result hasn't been scored yet, increment the matchCount
        if (match.result.reduce((a, b) => a + b) === 0) {
            playerDispatch({
                id: white.id,
                matchCount: white.matchCount + 1,
                type: "SET_PLAYER_MATCHCOUNT"
            });
            playerDispatch({
                id: black.id,
                matchCount: black.matchCount + 1,
                type: "SET_PLAYER_MATCHCOUNT"
            });
        }
        dispatch({
            matchId: match.id,
            newRating,
            result,
            roundId,
            type: "SET_MATCH_RESULT"
        });
    }

    return (
        <tr className={match.id === selectedMatch ? "selected" : ""}>
            <th className="table__number row__id" scope="row">{pos + 1}</th>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-white`}
            >
                {whiteName}{" "}
                {resultCode === "WHITE" && (
                    <span role="img" aria-hidden>
                        🏆
                    </span>
                )}
            </td>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-black`}
            >
                {blackName}{" "}
                {resultCode === "BLACK" && (
                    <span role="img" aria-hidden>
                        🏆
                    </span>
                )}
            </td>
            <td className="data__input row__controls">
                <select
                    onBlur={setMatchResult}
                    onChange={setMatchResult}
                    disabled={match.players.includes(DUMMY_ID)}
                    value={resultCode}
                    className={winnerSelect}
                >
                    <option value="NOTSET">
                        Select a winner
                    </option>
                    <option value="WHITE">
                        {whiteName} won
                    </option>
                    <option value="BLACK">
                        {blackName} won
                    </option>
                    <option value="DRAW">
                        Draw
                    </option>
                </select>
            </td>
            <td className="data__input row__controls">
                {(selectedMatch !== match.id)
                ? (
                    <button
                        className="iconButton"
                        onClick={() => setSelectedMatch(match.id)}
                        title="Edit match"
                    >
                        <Icons.Edit />
                    </button>
                ) : (
                    <button
                        className="iconButton"
                        onClick={() => setSelectedMatch(null)}
                        title="End editing match"
                    >
                        <Icons.Check />
                    </button>
                )}
                <button
                    className="iconButton"
                    onClick={() => setOpenModal(true)}
                    title="Open match information."
                >
                    <Icons.Info />
                    <Hidden>
                        View information for match:{" "}
                        {whiteName} versus {blackName}
                    </Hidden>
                </button>
                <Dialog isOpen={openModal}>
                    <button onClick={() => setOpenModal(false)}>
                        close
                    </button>
                    <p>{tourney.name}</p>
                    <p>Round {roundId + 1}, match {pos + 1}</p>
                    <PanelContainer>
                        <Panel>
                            <PlayerMatchInfo
                                matchId={match.id}
                                color={0}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                        <Panel>
                            <PlayerMatchInfo
                                matchId={match.id}
                                color={1}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                    </PanelContainer>
                </Dialog>
            </td>
        </tr>
    );
}
MatchRow.propTypes = {
    match: PropTypes.object,
    pos: PropTypes.number,
    roundId: PropTypes.number,
    selectedMatch: PropTypes.string,
    setSelectedMatch: PropTypes.func,
    tourneyId: PropTypes.number
};
