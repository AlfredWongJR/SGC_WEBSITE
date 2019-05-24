import Icons from "../icons";
import {Link} from "@reach/router";
import NewPlayer from "./new-player";
import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import {useAllPlayersDb} from "../../hooks";

export default function PlayerList(props) {
    const [players, dispatch] = useAllPlayersDb();
    const delPlayer = function (event, id) {
        event.preventDefault();
        dispatch({id, type: "DEL_ITEM"});
    };
    return (
        <div>
            <table>
                <caption>Demo Roster</caption>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Rating</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{Object.values(players).map((player) =>
                    <tr key={player.id}>
                        <td className="table__player">
                            {player.firstName}
                        </td>
                        <td className="table__player">
                            {player.lastName}
                        </td>
                        <td className="table__number">{player.rating}</td>
                        <td>
                            <button
                                className="danger iconButton"
                                onClick={(event) => delPlayer(event, player.id)}
                                // eslint-disable-next-line max-len
                                title={`Delete ${player.firstName} ${player.lastName}`}
                                // eslint-disable-next-line max-len
                                aria-label={`Delete ${player.firstName} ${player.lastName}`}
                            >
                                <Icons.Trash />
                            </button>
                        </td>
                        <td>
                            <Link to={String(player.id)}>
                            Open
                                <VisuallyHidden>
                                    {" "}{player.firstName} {player.lastName}
                                </VisuallyHidden>
                                {" "}<Icons.ChevronRight />
                            </Link>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <NewPlayer dispatch={dispatch} />
        </div>
    );
}
