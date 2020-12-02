import { loadUser as apiLoadUser } from "./apiClient";
/**
 *
 * @param {Object} state the existing state
 * @param {*} action the action performed on that state
 * @returns {Object} the updated state
 */
function reducer(state = {}, action) {
    const { type, payload } = action;
    switch (type) {
        case "login":
            return { ...state, profile: payload };
    }
}
export default reducer;
export async function loadUser(dispatch, getState) {
    const response = await apiLoadUser();
    dispatch({ type: "login", payload: response });
}
