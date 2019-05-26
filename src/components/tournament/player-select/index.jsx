import {Panel, PanelContainer} from "../../utility";
import React, {useState} from "react";
import {hasHadBye, rounds2Matches} from "../../../pairing-scoring";
import {Dialog} from "@reach/dialog";
import Icons from "../../icons";
import Selecting from "./selecting";
import {useTournament} from "../../../hooks";

export default function PlayerSelect(props) {
    const {tourney, tourneyDispatch, players} = useTournament();
    const {playerIds, roundList, byeQueue} = tourney;
    const dispatch = tourneyDispatch;
    const [isSelecting, setIsSelecting] = useState(playerIds.length === 0);
    const matches = rounds2Matches(roundList);
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsSelecting(true)}>
                    <Icons.Edit /> Edit player roster
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
                        {Object.values(players).map(
                            ({type, id, firstName, lastName}) => (
                                <tr key={id} className={type + " player"}>
                                    <td>{firstName}</td>
                                    <td>{lastName}</td>
                                    <td>
                                        <button
                                            disabled={byeQueue.includes(id)}
                                            onClick={() =>
                                                dispatch({
                                                    byeQueue:
                                                        byeQueue.concat([id]),
                                                    type: "SET_BYE_QUEUE"
                                                })
                                            }
                                        >
                                            Bye signup
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </Panel>
            <Panel>
                <h3>Bye queue</h3>
                {byeQueue.length === 0 &&
                    <p>No players have signed up for a bye round.</p>
                }
                <ol>
                    {byeQueue.map((pId) => (
                        <li
                            key={pId}
                            className={
                                (hasHadBye(pId, matches))
                                ? "disabled"
                                : ""
                            }
                        >
                            {players[pId].firstName}{" "}
                            {players[pId].lastName}
                            <button
                                onClick={() =>
                                    dispatch({
                                        byeQueue: byeQueue.filter(
                                            (id) => pId !== id
                                        ),
                                        type: "SET_BYE_QUEUE"
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
                <Selecting />
            </Dialog>
        </PanelContainer>
    );
}
PlayerSelect.propTypes = {};
