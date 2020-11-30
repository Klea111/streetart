import axios from "axios";

// documenting these parameters and return types so that vscode can show me what they can do helps so much.
// found at https://stackoverflow.com/questions/6460604/how-to-describe-object-arguments-in-jsdoc

/**
 * @typedef AuthApiResult
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * logs the user in and returns his profile
 * @returns {Promise<AuthApiResult>}
 */
export async function login(email, password) {
    const url = "/api/login";
    const result = await axios.post(url, { email, password });
    return result.data;
}
/**
 * register the user and immediately logs her in
 * @returns {AuthApiResult}
 */
export async function register({ email, firstName, lastName, password }) {
    const url = "/api/register";
    const body = arguments[0];
    const { data } = await axios.post(url, body);
    return data;
}
