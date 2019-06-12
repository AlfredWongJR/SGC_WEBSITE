import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
import PairPicker from "../index";
import PropTypes from "prop-types";
import React from "react";
import {TournamentProvider} from "../../../../hooks";

const {click} = fireEvent;

afterEach(cleanup);

const BattleForGothamCity = ({children}) => (
    <TournamentProvider tourneyId="tvAdS4YbSOznrBgrg0ITA">
        {children}
    </TournamentProvider>
);
BattleForGothamCity.propTypes = {children: PropTypes.node.isRequired};

it("Selecting and unselecting players works", function () {
    const {queryByText, getByText, getByLabelText} = render(
        <BattleForGothamCity><PairPicker roundId={1}/></BattleForGothamCity>
    );
    click(getByText(/add bruce wayne/i));
    expect(getByText(/white: bruce wayne/i)).toBeInTheDocument();
    click(getByText(/add dick grayson/i));
    expect(getByText(/black: dick grayson/i)).toBeInTheDocument();
    click(getByLabelText(/remove bruce wayne/i));
    expect(queryByText(/white: bruce wayne/i)).not.toBeInTheDocument();
    click(getByLabelText(/remove dick grayson/i));
    expect(queryByText(/black: dick grayson/i)).not.toBeInTheDocument();
});
it("Swapping colors works", function () {
    const {getByText} = render(
        <BattleForGothamCity><PairPicker roundId={1}/></BattleForGothamCity>
    );
    click(getByText(/add bruce wayne/i));
    click(getByText(/add dick grayson/i));
    click(getByText(/swap colors/i));
    expect(getByText(/white: dick grayson/i)).toBeInTheDocument();
    expect(getByText(/black: bruce wayne/i)).toBeInTheDocument();

});
it("Removed players are removed from selection", function () {
    const {getByText, queryByText, getByLabelText} = render(
        <BattleForGothamCity><PairPicker roundId={1}/></BattleForGothamCity>
    );
    click(getByText(/add bruce wayne/i));
    expect(getByText(/white: bruce wayne/i)).toBeInTheDocument();
    click(getByText(/add or remove players from the roster/i));
    click(getByLabelText(/Select Bruce Wayne/i));
    click(getByText(/^done$/i));
    expect(queryByText(/white: bruce wayne/i)).not.toBeInTheDocument();
});
it("Selecting bye players works", function () {
    const {getByText, getByLabelText} = render(
        <BattleForGothamCity><PairPicker roundId={1}/></BattleForGothamCity>
    );
    // Remove a player to make the number uneven.
    // TODO: use premade test data that doesn't require doing this manually.
    click(getByText(/add or remove players from the roster/i));
    click(getByLabelText(/Select Bruce Wayne/i));
    click(getByText(/^done$/i));
    click(getByText(/add bye player/i));
    expect(getByText(/white: bye player/i)).toBeInTheDocument();
});
it("Selected bye players are removed when not needed anymore", function () {
    const {getByText, getByLabelText, queryByText} = render(
        <BattleForGothamCity><PairPicker roundId={1}/></BattleForGothamCity>
    );
    // Remove a player to make the number uneven.
    // TODO: use premade test data that doesn't require doing this manually.
    click(getByText(/add or remove players from the roster/i));
    click(getByLabelText(/Select Bruce Wayne/i));
    click(getByText(/^done$/i));
    click(getByText(/add bye player/i));
    // Add a player to make it even again.
    click(getByText(/add or remove players from the roster/i));
    click(getByLabelText(/Select Bruce Wayne/i));
    click(getByText(/^done$/i));
    expect(queryByText(/white: bye player/i)).not.toBeInTheDocument();
});
