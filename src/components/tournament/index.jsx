import PropTypes from "prop-types";
import React from "react";
import Tournament from "./tournament";
import TournamentList from "./list";

const TournamentIndex = (props) => (
    <div>
        {props.children}
    </div>
);
TournamentIndex.propTypes = {
    children: PropTypes.node,
    path: PropTypes.string
};

export default TournamentIndex;
export {Tournament, TournamentList};
