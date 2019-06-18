import {
    DUMMY_ID,
    getUnmatched,
    rounds2Matches
} from "../../../data-types";
import {Panel, PanelContainer} from "../../../components/utility";
import React, {useEffect, useMemo, useState} from "react";
import {assoc, curry, pipe} from "ramda";
import {
    createPairingData,
    matches2ScoreData,
    setUpperHalves
} from "../../../pairing-scoring";
import {useOptionsDb, useTournament} from "../../../hooks";
import {Dialog} from "@reach/dialog";
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Selecting from "../player-select/selecting";
import Stage from "./stage";

export default function PairPicker({roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {
        tourney,
        activePlayers,
        getPlayer,
        tourneyDispatch
    } = useTournament();
    const {roundList} = tourney;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scoreData, pairData] = useMemo(
        function memoizedGetStats() {
            const matches = rounds2Matches(roundList, roundId);
            const _scoreData = matches2ScoreData(matches);
            const _pairData = pipe(
                curry(createPairingData)(activePlayers, options.avoidPairs),
                // sortDataForPairing,
                setUpperHalves
            )(_scoreData);
            return [_scoreData, _pairData];
        },
        [roundList, activePlayers, roundId, options.avoidPairs]
    );
    // Only calculate unmatched players for the latest round. Old rounds don't
    // get to add new players.
    const unmatched = (
        roundId === roundList.length - 1
        ? getUnmatched(roundList, activePlayers, roundId)
        : {}
    );
    const unmatchedCount = Object.keys(unmatched).length;
    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        unmatchedCount % 2 !== 0
        ? assoc(DUMMY_ID, getPlayer(DUMMY_ID), unmatched)
        : unmatched
    );
    useEffect(
        function cleanPlayersThatWereRemoved() {
            const [p1, p2] = stagedPlayers;
            if (!unmatchedWithDummy[p1] && p1 !== null) {
                setStagedPlayers((pair) => [null, pair[1]]);
            }
            if (!unmatchedWithDummy[p2] && p2 !== null) {
                setStagedPlayers((pair) => [pair[0], null]);
            }
        },
        [unmatchedWithDummy, stagedPlayers]
    );
    return (
        <div className="content-area" style={{width: "720px"}}>
            <div className="toolbar">
                <button
                    className="button-primary"
                    disabled={unmatchedCount === 0}
                    onClick={() => tourneyDispatch({
                        byeValue: options.byeValue,
                        pairData: pairData,
                        players: unmatched,
                        roundId,
                        type: "AUTO_PAIR"
                    })}
                >
                    Auto-pair unmatched players
                </button>{" "}
                <button onClick={() => setIsModalOpen(true)}>
                    Add or remove players from the roster.
                </button>
            </div>
            <PanelContainer>
                <Panel>
                    <SelectList
                        setStagedPlayers={setStagedPlayers}
                        stagedPlayers={stagedPlayers}
                        unmatched={unmatchedWithDummy}
                        pairData={pairData}
                    />
                </Panel>
                <Panel style={{flexGrow: "1"}}>
                    <Stage
                        roundId={roundId}
                        setStagedPlayers={setStagedPlayers}
                        stagedPlayers={stagedPlayers}
                        pairData={pairData}
                    />
                    <PanelContainer>
                        {stagedPlayers.map((id) =>
                            id !== null && (
                                <Panel key={id}>
                                    <PlayerInfo
                                        playerId={id}
                                        roundId={roundId}
                                        scoreData={scoreData}
                                    />
                                </Panel>
                            )
                        )}
                    </PanelContainer>
                </Panel>
            </PanelContainer>
            <Dialog isOpen={isModalOpen}>
                <button
                    className="button-micro"
                    onClick={() => setIsModalOpen(false)}
                >
                    Done
                </button>
                <Selecting />
            </Dialog>
        </div>
    );
}
PairPicker.propTypes = {
    roundId: PropTypes.number,
    tourneyId: PropTypes.number
};
