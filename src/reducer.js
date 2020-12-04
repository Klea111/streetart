import { loadUser as apiLoadUser } from "./apiClient";
/**
 *
 * @param {Object} state the existing state
 * @param {*} action the action performed on that state
 * @returns {Object} the updated state
 */
//        dispatch({ type: "image-selected", payload: uploadedFile });

function reducer(state = {}, action) {
    const { type, payload } = action;
    console.log("action", action);
    let newState;
    switch (type) {
        case "login":
            newState = { ...state, profile: payload };
            break;
        case "image-selected":
            newState = { ...state, selectedImage: payload };
            break;
        case "images-selected":
            newState = {
                ...state,
                selectedImages: payload
            };
            if (action.selectedTag) {
                newState.selectedTag = action.selectedTag;
            }
            break;
        case "tag-selected":
            newState = {
                ...state,
                selectedTag: payload
            };
            break;
        default:
            break;
    }
    newState = newState || state;
    console.log("newState", newState);
    return newState || state;
}
export default reducer;
export async function loadUser(dispatch, getState) {
    const response = await apiLoadUser();
    dispatch({ type: "login", payload: response });
}
// export async function loadImage(dispatch, getState) {
//     const response =
// }
