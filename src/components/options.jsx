import React from "react";
import {useTournaments} from "../state/tourneys-state";

/**
 * @param {Object} props
 */
export function Options(props) {
    const [tourneys] = useTournaments();
    // const options = data.options;
    const options = {byeValue: 1};
    // @ts-ignore
    const dispatch = (o) => null;
    return (
        <div>
            <form>
                <fieldset>
                    <legend>Bye options</legend>
                    Select how many points a bye is worth:
                    {" "}
                    <label>
                        1
                        <input
                            type="radio"
                            checked={options.byeValue === 1}
                            onChange={
                                () => dispatch({
                                    type: "SET_BYE_VALUE",
                                    byeValue: 1
                                })
                            } />
                    </label>
                    <label>
                        0.5
                        <input
                            type="radio"
                            checked={options.byeValue === 0.5}
                            onChange={
                                () => dispatch({
                                    type: "SET_BYE_VALUE",
                                    byeValue: 0.5
                                })
                            } />
                    </label>
                </fieldset>
            </form>
            {/* <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
                <legend>Export tournaments</legend>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputTourney}
                    readOnly
                    name="tourneyData"
                    />
                <input type="submit" value="load" disabled />
            </fieldset>
            </form> */}
            <form onSubmit={(event) => event.preventDefault()}>
                <fieldset>
                    <legend>Export data</legend>
                    <textarea
                        className="json"
                        rows={25}
                        cols={50}
                        value={JSON.stringify(tourneys, null, 2)}
                        name="playerdata"
                        readOnly />
                    <input type="submit" value="Load" disabled />
                </fieldset>
            </form>
        </div>
    );
}
