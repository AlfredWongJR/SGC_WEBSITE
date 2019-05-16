import {createContext, createElement, useContext, useReducer} from "react";
import {assoc} from "ramda";
import defaultOptions from "./demo-options.json";
/**
 * @typedef {import("./dispatch").OptionAction} OptionAction
 */

/**
 * @param {typeof defaultOptions} state
 * @param {OptionAction} action
 */
function reducer(state, action) {
    switch (action.type) {
    case "SET_BYE_VALUE":
        return assoc("byeValue", action.byeValue, state);
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type.");
    }
}

/** @type {[typeof defaultOptions, React.Dispatch<OptionAction>]} */
const defaultContext = null;
const OptionsContext = createContext(defaultContext);

export function useOptions() {
    return useContext(OptionsContext);
}

/**
 * @param {Object} props
 */
export function OptionsProvider(props) {
    const [data, dispatch] = useReducer(reducer, defaultOptions);
    return (
        createElement(
            OptionsContext.Provider,
            {value: [data, dispatch]},
            props.children
        )
    );
}
