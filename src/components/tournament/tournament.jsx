import React, {useEffect, useMemo} from "react";
import Tooltip from "@reach/tooltip";
import {Link} from "@reach/router";
import last from "ramda/src/last";
import Check from "react-feather/dist/icons/check-circle";
import Alert from "react-feather/dist/icons/alert-circle";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import Trash from "react-feather/dist/icons/trash-2";
import Plus from "react-feather/dist/icons/plus";
import {useTournament, usePlayers} from "../../state";
import {calcNumOfRounds} from "../../data/utility";
import {DUMMY_ID} from "../../data/constants";
import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";
import styles from "./tournament.module.css";

/**
 * @param {Object} props
 */
export default function Tournament({tourneyId, children, navigate}) {
    // eslint-disable-next-line fp/no-mutation
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [tourney, dispatch] = useTournament(tourneyId);
    const {name, players, roundList} = tourney;
    const {playerState, getPlayer, playerDispatch} = usePlayers();
    // This isn't expensive, but why not memoize it?
    const isNewRoundReady = useMemo(
        function () {
            const lastRound = last(roundList);
            if (!lastRound) {
                return true;
            }
            const matchedPlayers = lastRound.reduce(
                /** @param {number[]} acc */
                (acc, match) => acc.concat(match.players),
                []
            );
            const unMatchedPlayers = players.filter(
                (pId) => !matchedPlayers.includes(pId)
            );
            const results = lastRound.map(
                (match) => match.result[0] + match.result[1]
            );
            return (unMatchedPlayers.length === 0 && !results.includes(0));
        },
        [players, roundList]
    );
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = name;
            return function () {
                document.title = origTitle;
            };
        },
        [name]
    );
    const isItOver = roundList.length >= calcNumOfRounds(players.length);
    /** @type {[string, boolean]} */
    const [tooltipText, tooltipWarn] = (function () {
        if (!isNewRoundReady) {
            return [
                "You must complete the last round before beginning a new one.",
                true
            ];
        } else if (isItOver) {
            return ["All necessary rounds have completed.", true];
        } else {
            return ["Ready to begin a new round.", false];
        }
    }());
    function newRound() {
        const confirmText = (
            "All rounds have completed. Are you sure you want to begin a new "
            + "one?"
        );
        if (isItOver) {
            if (!window.confirm(confirmText)) {
                return;
            }
        }
        dispatch({type: "ADD_ROUND", tourneyId});
        return;
    }
    async function delLastRound() {
        if (window.confirm("Are you sure you want to delete the last round?")) {
            await navigate(".");
            // If a match has been scored, then reset it.
            // Should this logic be somewhere else?
            last(roundList).forEach(function (match) {
                if (match.result[0] + match.result[1] === 0) {
                    return; // Don't change players who haven't scored.
                }
                match.players.forEach(function (pId, color) {
                    if (pId === DUMMY_ID) {
                        return; // Don't try to set the dummy.
                    }
                    const {matchCount} = getPlayer(pId);
                    playerDispatch({
                        type: "SET_PLAYER_MATCHCOUNT",
                        id: pId,
                        matchCount: matchCount - 1
                    });
                    playerDispatch({
                        type: "SET_PLAYER_RATING",
                        id: pId,
                        rating: match.origRating[color]
                    });
                });
            });
            dispatch({
                type: "DEL_LAST_ROUND",
                players: playerState.players,
                tourneyId
            });
        }
    }
    return (
        <div className={styles.tournament}>
            <div className={styles.header}>
                <nav>
                    <Link to="/">
                        <ChevronLeft/> Back
                    </Link>
                </nav>
                <h2>{name}</h2>
            </div>
            <div className={styles.sidebar}>
                <nav>
                    <ul>
                        <li><Link to=".">Players</Link></li>
                        <li><Link to="crosstable">Crosstable</Link></li>
                        <li><Link to="scores">Score detail</Link></li>
                    </ul>
                    <hr />
                    <ul>
                        {Object.keys(roundList).map((id) => (
                            <li key={id}>
                                <Link to={`${id}`}>
                                    Round {Number(id) + 1}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <hr />
                <ul>
                    <li>
                        <button
                            onClick={newRound}
                            disabled={!isNewRoundReady}
                        >
                            <Plus/> New round
                        </button>{" "}
                        <Tooltip label={tooltipText}>
                            <span className="helpIcon">
                                {(tooltipWarn)
                                    // @ts-ignore
                                    ? <Alert className="status-alert" />
                                    // @ts-ignore
                                    : <Check className="status-ok" />
                                }
                            </span>
                        </Tooltip>
                    </li>
                    <li>
                        <button
                            className={"danger " + styles.toolbarItem}
                            onClick={delLastRound}
                            disabled={roundList.length === 0}
                        >
                            <Trash /> Remove last round
                        </button>
                    </li>
                    <li>
                        Round progress: {roundList.length}/
                        {calcNumOfRounds(players.length)}{" "}
                    </li>
                </ul>
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
