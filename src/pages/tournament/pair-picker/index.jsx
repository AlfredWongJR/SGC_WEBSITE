import {Panel, PanelContainer} from "../../../components/utility";
import React, {useEffect, useMemo, useState} from "react";
import {
    createPairingData,
    matches2ScoreData,
    setUpperHalves
} from "../../../pairing-scoring";
import {curry, pipe} from "ramda";
import {Dialog} from "@reach/dialog";
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Selecting from "../player-select/selecting";
import Stage from "./stage";
import {rounds2Matches} from "../../../data-types";
import {useOptionsDb} from "../../../hooks";

export default function PairPicker({
    roundId,
    tournament,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy
}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {
        tourney,
        activePlayers,
        players,
        getPlayer,
        tourneyDispatch
    } = tournament;
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
                        tourneyDispatch={tourneyDispatch}
                        getPlayer={getPlayer}
                    />
                    <PanelContainer>
                        {stagedPlayers.map((id) =>
                            id !== null && (
                                <Panel key={id}>
                                    <PlayerInfo
                                        playerId={id}
                                        scoreData={scoreData}
                                        players={players}
                                        getPlayer={getPlayer}
                                    />
                                </Panel>
                            )
                        )}
                    </PanelContainer>
                </Panel>
            </PanelContainer>
            <Dialog
                isOpen={isModalOpen}
                onDismiss={() => setIsModalOpen(false)}
            >
                <button
                    className="button-micro"
                    onClick={() => setIsModalOpen(false)}
                >
                    Done
                </button>
                <Selecting
                    tourney={tourney}
                    tourneyDispatch={tourneyDispatch}
                />
            </Dialog>
        </div>
    );
}
PairPicker.propTypes = {
    roundId: PropTypes.number.isRequired,
    tournament: PropTypes.object.isRequired,
    unmatched: PropTypes.object.isRequired,
    unmatchedCount: PropTypes.number.isRequired,
    unmatchedWithDummy: PropTypes.object.isRequired
};
