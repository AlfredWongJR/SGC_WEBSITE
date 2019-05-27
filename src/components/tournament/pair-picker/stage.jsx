import {BLACK, WHITE} from "../../../data-types";
import React, {Fragment} from "react";
import {lensIndex, set} from "ramda";
import {useOptionsDb, useTournament} from "../../../hooks";
import Icons from "../../icons";
import PropTypes from "prop-types";

export default function Stage({
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {tourneyDispatch, players} = useTournament();
    const dispatch = tourneyDispatch;
    const [options] = useOptionsDb();
    const [white, black] = stagedPlayers;

    function unstage(color) {
        setStagedPlayers((prevState) => set(lensIndex(color), null, prevState));
    }

    function match() {
        dispatch({
            byeValue: options.byeValue,
            pair: [players[white], players[black]],
            roundId,
            type: "MANUAL_PAIR"
        });
        setStagedPlayers([null, null]);
    }

    return (
        <div>
            <h2>Selected for matching:</h2>
            <p>
                White:{" "}
                {white !== null &&
                    <Fragment>
                        {players[white].firstName}{" "}
                        {players[white].lastName}{" "}
                        <button onClick={() => unstage(WHITE)}>
                            <Icons.UserMinus /> Remove
                        </button>
                    </Fragment>
                }
            </p>
            <p>
                Black:{" "}
                {black !== null &&
                    <Fragment>
                        {players[black].firstName}{" "}
                        {players[black].lastName}{" "}
                        <button onClick={() => unstage(BLACK)}>
                            <Icons.UserMinus /> Remove
                        </button>
                    </Fragment>
                }
            </p>
            <button
                disabled={
                    stagedPlayers.every((id) => id === null)
                }
                onClick={() => setStagedPlayers(
                    (prevState) => ([prevState[BLACK], prevState[WHITE]])
                )}
            >
                <Icons.Repeat/> Swap colors
            </button>{" "}
            <button
                disabled={stagedPlayers.includes(null)}
                onClick={match}
            >
                <Icons.Check/> Match selected
            </button>{" "}
        </div>
    );
}
Stage.propTypes = {
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string)
};
