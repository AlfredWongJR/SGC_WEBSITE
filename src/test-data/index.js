import fromJSON from "tcomb/lib/fromJSON";
import options from "./options.json";
import players from "./players.json";
import tournaments from "./tournaments.json";
import {types} from "../data-types";

export default Object.freeze({
    options: fromJSON(options, types.db.Options),
    players: fromJSON(players, types.db.Players),
    tournaments: fromJSON(tournaments, types.db.Tourneys)
});
