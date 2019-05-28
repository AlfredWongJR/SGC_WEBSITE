import React, {useState} from "react";
import {useAllTournamentsDb, useDocumentTitle} from "../../hooks";
import {Dialog} from "@reach/dialog";
import Icons from "../icons";
import {Link} from "@reach/router";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useAllTournamentsDb();
    const [newTourneyName, setNewTourneyName] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    useDocumentTitle("tournament list");

    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }

    function makeTournament(event) {
        event.preventDefault();
        dispatch({
            name: newTourneyName,
            type: "ADD_TOURNEY"
        });
        setNewTourneyName("");
    }

    return (
        <div>
            <button
                onClick={() => setIsFormOpen(true)}
            >
                <Icons.Plus /> Add tournament
            </button>
            {(Object.keys(tourneys).length > 0)
            ?
            <table>
                <caption>Tournament list</caption>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Controls</th>
                    </tr>
                    {Object.values(tourneys).map(({name, id}) =>
                        <tr key={id}>
                            <td>
                                <Link to={id}>
                                    {name}
                                </Link>
                            </td>
                            <td>
                                <button
                                    aria-label={`Delete “${name}”`}
                                    className="danger ghost"
                                    title={`Delete “${name}”`}
                                    onClick={
                                        () => dispatch({id, type: "DEL_ITEM"})
                                    }
                                >
                                    <Icons.Trash />
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            : <p>No tournaments added yet.</p>
            }
            <Dialog isOpen={isFormOpen}>
                <button
                    className="micro"
                    onClick={() => setIsFormOpen(false)}
                >
                    Close
                </button>
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <label htmlFor="tourney-name">Name:</label>
                        <input
                            name="tourney-name"
                            placeholder="tournament name"
                            required={true}
                            type="text"
                            value={newTourneyName}
                            onChange={updateNewName}
                        />{" "}
                        <input
                            className="button-primary"
                            type="submit"
                            value="Create"
                        />
                    </fieldset>
                </form>
            </Dialog>
        </div>
    );
}
