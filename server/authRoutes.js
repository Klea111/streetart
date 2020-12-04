const express = require("express");
const router = express.Router();
const authDb = require("./authDb");
const util = require("util");
const bcrypt = require("bcrypt");
module.exports = router;
/**
 * This route logs the user in, and stores the userId in the session,
 * so that the middleware above can load it for every subsequent request.
 */
router.post("/api/login", async (req, resp) => {
    const { email, password } = req.body;
    const user = await authDb.findByEmail(email);
    const compare = util.promisify(bcrypt.compare);
    // https://zellwk.com/blog/converting-callbacks-to-promises/
    // util.promisify takes a function with a callback as a parameter
    // and returns a function that returns a Promise. We could just
    // use bcrypt.hashSync, but I've been told that async is better
    // for performance reasons, especially under heavy load.
    const isPasswordCorrect = await compare(password, user.pwHash);
    if (isPasswordCorrect) {
        req.session.userId = user.id;
        user.pwHash = undefined;
        return resp.json(user);
    } else {
        return resp.status(404).send("UserDoesNotExistOrWrongPassword");
    }
});

/**
 * This creates a new user with the provided credentials and profile details.
 * If the user already exists, return 400.
 */
router.post("/api/register", async (req, resp) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await authDb.findByEmail(email);
        if (existingUser) {
            return resp.status(400).send("UserExists");
        } else {
            const salt = bcrypt.genSaltSync(10);
            const pwHash = bcrypt.hashSync(password, salt);
            const user = await authDb.createUser({ firstName, lastName, email, pwHash });
            req.session.userId = user.id;
            return resp.json(user);
        }
    } catch (e) {
        console.error(e);
        return resp.status(500).send(e);
    }
});

router.get("/api/users/me", async (req, resp) => {
    let { user } = req;
    if (req.user) {
        let result = { ...user, pwHash: undefined };
        return resp.json(result);
    } else {
        return resp.sendStatus(400);
    }
});
