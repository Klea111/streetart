const express = require("express");
const app = express();
const passport = require("passport");
const Strategy = passport.Strategy;
const LocalStrategy = require("passport-local").Strategy;
const authDb = require("./server/authDb");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const util = require("util");

var cors = require("cors");

dotenv.config();
// auth info https://github.com/passport/express-4.x-local-example/blob/master/server.js

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require("compression")());
app.use(
    require("cookie-session")({
        secret: "7ZoDkQJJMzNKntCwbhnK7V8ySt1yIB1u",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(passport.initialize());
app.use(passport.session());

// this middleware loads the user at each request if there is a user id
// associated with session
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            const user = await authDb.findById(req.session.userId);
            // we do not have to check for password, since the session
            // is already authenticated.
            req.user = user;
            return next();
        } else {
            return next();
        }
    } catch (error) {
        console.log(error);
    }
});

/**
 * This route logs the user in, and stores the userId in the session,
 * so that the middleware above can load it for every subsequent request.
 */
app.post("/api/login", async (req, resp) => {
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
app.post("/api/register", async (req, resp) => {
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

app.get("/test", (req, resp) => {
    return resp.send("hell yeah!");
});

app.get("*", (req, resp) => {
    return resp.send("HELL WORLD");
});

app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
});
