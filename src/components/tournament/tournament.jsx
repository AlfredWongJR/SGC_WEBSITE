import Header from "./header";
import PropTypes from "prop-types";
import React from "react";
import Sidebar from "./sidebar";
import {TournamentProvider} from "../../hooks";
import styles from "./tournament.module.css";
// import {useTournament} from "../../state";

export default function Tournament(props) {
    const tourneyId = Number(props.tourneyId);
    // const [tourney] = useTournament(tourneyId);
    // const {name} = tourney;
    return (
        <TournamentProvider tourneyId={tourneyId}>
            <div className={styles.tournament}>
                <Header className={styles.header} />
                <Sidebar className={styles.sidebar} navigate={props.navigate} />
                <div className={styles.content}>
                    {props.children}
                </div>
            </div>
        </TournamentProvider>
    );
}
Tournament.propTypes = {
    children: PropTypes.node,
    navigate: PropTypes.func,
    path: PropTypes.string,
    tourneyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
