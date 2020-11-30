/**
 *
 * @param {Object} state the existing state
 * @param {*} action the action performed on that state
 * @returns {Object} the updated state
 */
function reducer(state = {}, action) {
    const { type, data } = action;
    if (type === "login") {
        return { ...state, profile: data };
    }
}
export default reducer;
