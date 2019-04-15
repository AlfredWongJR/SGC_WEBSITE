// @ts-check
/**
 * @typedef {import("./player").Player} Player
 */
/**
 * @typedef {Object} ConfigItem
 * @property {string} name
 * @property {string} funcName
 * @property {boolean} active
 */
function createDefaultConfig() {
    /** @type {Object<string, ConfigItem[]>} */
    const defaultConfig = {
        tieBreak: [
            {
                "name": "Modified median",
                "funcName": "modifiedMedian",
                "active": true
            },
            {
                "name": "Solkoff",
                "funcName": "solkoff",
                "active": true
            },
            {
                "name": "Cumulative score",
                "funcName": "playerScoreCum",
                "active": true
            },
            {
                "name": "Cumulative of opposition",
                "funcName": "playerOppScoreCum",
                "active": true
            },
            {
                "name": "Most black",
                "funcName": "playerColorBalance",
                "active": false
            }
        ]
    };
    return defaultConfig;
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {*}
 */
function JSONretriever(key, value) {
    // When a player object is stored in one of these keys, return a list of
    // their IDs instead of the original objects.
    if (key.startsWith("ref_")) {
        return undefined;
    } else {
        return value;
    }
}

export {
    JSONretriever,
    createDefaultConfig
};