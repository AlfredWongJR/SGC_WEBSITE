import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Selecting from "./selecting";
import {useTournament, usePlayers} from "../../../state";
import {PanelContainer, Panel, PlayerLink} from "../../utility";
import {hasHadBye} from "../../../pairing-scoring/scoring";

/**
 * @param {Object} props
 */
export default function PlayerSelect({tourneyId}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [{players, byeQueue, roundList}, dispatch] = useTournament(tourneyId);
    const {getPlayer} = usePlayers();
    const [isSelecting, setIsSelecting] = useState(players.length === 0);
    // if (isSelecting) {
    //     return (
    //         <Selecting tourneyId={tourneyId} setIsSelecting={setIsSelecting} />
    //     );
    // } else {
    //     return (
    //         <Roster tourneyId={tourneyId} setIsSelecting={setIsSelecting} />
    //     );
    // }
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsSelecting(true)}>
                    Edit player roster
                </button>
                <table>
                    <caption>Current roster</caption>
                    <thead>
                        <tr>
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((pId) => (
                            <tr
                                key={pId}
                                className={getPlayer(pId).type + " player"}
                            >
                                <td><PlayerLink id={pId} firstName /></td>
                                <td><PlayerLink id={pId} lastName /></td>
                                <td>
                                    <button
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_BYE_QUEUE",
                                                byeQueue: byeQueue.concat(
                                                    [pId]
                                                ),
                                                tourneyId
                                            })
                                        }
                                        disabled={byeQueue.includes(
                                            pId
                                        )}
                                    >
                                        Bye signup
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel>
                <h3>Bye queue</h3>
                {(byeQueue.length === 0) &&
                    <p>No players have signed up for a bye round.</p>
                }
                <ol>
                    {byeQueue.map((pId) => (
                        <li
                            key={pId}
                            className={
                                hasHadBye(pId, roundList)
                                    ? "disabled"
                                    : ""
                            }
                        >
                            {getPlayer(pId).firstName}{" "}
                            {getPlayer(pId).lastName}
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "SET_BYE_QUEUE",
                                        byeQueue: byeQueue.filter(
                                            (id) => pId !== id
                                        ),
                                        tourneyId
                                    })
                                }
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ol>
            </Panel>
            <Dialog isOpen={isSelecting}>
                <button onClick={() => setIsSelecting(false)}>Done</button>
                <Selecting tourneyId={tourneyId} />
            </Dialog>
        </PanelContainer>
    );
}
