const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:anna:postgres@localhost:5432/streetart");
/**
 * @typedef User
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} firstName
 * @property {string} email
 * @property {string?} pwHash the hashed password. should not be sent to the client
 */

/**
 *
 * @returns {User}
 */
const mapRowToUser = (row, includeHash = false) => {
    let result = {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
    };
    if (includeHash) {
        result.pwHash = row.pw_hash;
    }
    return result;
};

/**
 * @returns {Promise<User?>}
 */
exports.findByEmail = async function findByEmail(email) {
    const { rows } = db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows && rows.length === 1) {
        return mapRowToUser(rows[0], true);
    } else {
        return null;
    }
};

// create table if not exists users(
//     id serial not null primary key,
//     first_name varchar not null,
//     last_name varchar not null,
//     pw_hash varchar not null,
//     email varchar not null unique
// );
/**
 * @param {int} id
 * @returns {Promise<User?>}
 */
exports.findById = async id => {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (rows && rows.length === 0) {
        return mapRowToUser(rows[0]);
    } else {
        return null;
    }
};

exports.createUser = async ({ firstName, lastName, email, pwHash }) => {
    const { rows } = await db.query(
        `INSERT INTO users (first_name, last_name, email, pw_hash)
            VALUES ($1,$2,$3,$4)
            returning *;`,
        [firstName, lastName, email, pwHash]
    );
    return mapRowToUser(rows[0], false);
};
