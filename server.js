const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const passport = require("passport");
const authDb = require("./server/authDb");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const util = require("util");
const multer = require("multer");
const uidSafe = require("uid-safe");
const exifr = require("exifr");
const db = require("./server/db");
const path = require("path");
const { response } = require("express");
const { upload } = require("./server/s3");
const { moderationMiddleware } = require("./server/rekognition");
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

// taken from the imageboard example project
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/upload");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            file.key = uid;
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 6 * 1024 * 1024 // 6 * 1024kb = 6MB
    }
});

const exifrMiddleware = async (req, res, next) => {
    let file = req.file;
    let path = file.path;
    const parsed = await exifr.parse(path, { gps: true });
    file.exif = parsed;
    next();
};

const requireLoginMiddleware = (req, res, next) => {
    if (req.user.id) {
        next();
    } else {
        return res.redirect("/login");
    }
};

const _uploadPipeline = [
    requireLoginMiddleware,
    uploader.single("file"),
    exifrMiddleware,
    upload,
    moderationMiddleware
];
app.post("/upload", _uploadPipeline, async (req, resp) => {
    const { file } = req;
    const { description } = req.body;
    let tags = [];
    if (description) {
        tags = parseTags(description);
    }
    const image = await db.createImage(file, description, req.user.id, tags);
    image.exif = null;
    return resp.json(image);
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

app.get("/api/users/me", async (req, resp) => {
    let { user } = req;
    if (req.user) {
        let result = { ...user, pwHash: undefined };
        return resp.json(result);
    } else {
        return resp.sendStatus(400);
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

/**
 *
 * @param {string} str
 * @returns {string[]} the array of tags
 */
function parseTags(str) {
    // found at https://blog.abelotech.com/posts/split-string-into-tokens-javascript/
    const words = str.split(/\s+/);
    const tags = [];
    for (let word of words) {
        if (word.length > 1 && word[0] === "#") {
            const tag = word.substr(1);
            tags.push(tag);
        }
    }
    return tags;
}
