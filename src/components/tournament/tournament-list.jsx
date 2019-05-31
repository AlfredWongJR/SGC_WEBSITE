import {DateFormat, SortLabel} from "../utility";
import React, {useState} from "react";
import {
    useAllTournamentsDb,
    useDocumentTitle,
    useSortedTable
} from "../../hooks";
import {Dialog} from "@reach/dialog";
import HasSidebar from "../sidebar-default";
import Icons from "../icons";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useAllTournamentsDb();
    const sorted = useSortedTable(Object.values(tourneys), "date", true);
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
        setIsFormOpen(false);
    }

    function deleteTournament(id, name) {
        const message = "Are you sure you want to delete “" + name + "”?";
        if (window.confirm(message)) {
            dispatch({id, type: "DEL_ITEM"});
        }
    }

    return (
        <HasSidebar>
            <div className="content-area">
                <div className="toolbar toolbar__left">
                    <button
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Icons.Plus /> Add tournament
                    </button>
                </div>
                {(Object.keys(tourneys).length > 0)
                ?
                <table>
                    <caption>Tournament list</caption>
                    <thead>
                        <tr>
                            <th>
                                <SortLabel
                                    data={sorted}
                                    label="Name"
                                    sortKey="name"
                                />
                            </th>
                            <th>
                                <SortLabel
                                    data={sorted}
                                    label="Date"
                                    sortKey="date"
                                />
                            </th>
                            <th><VisuallyHidden>Controls</VisuallyHidden></th>
                        </tr>
                    </thead>
                    <tbody className="content">
                        {sorted.table.map(({date, id, name}) =>
                            <tr key={id} className="buttons-on-hover">
                                <td>
                                    <Link to={id}>
                                        {name}
                                    </Link>
                                </td>
                                <td>
                                    <DateFormat date={date} />
                                </td>
                                <td>
                                    <button
                                        aria-label={`Delete “${name}”`}
                                        className="danger button-ghost"
                                        title={`Delete “${name}”`}
                                        onClick={
                                            () => deleteTournament(id, name)
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
                        className="button-micro"
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
        </HasSidebar>
    );
}
