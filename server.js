const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const authDb = require("./server/authDb");
const bodyParser = require("body-parser");
const multer = require("multer");
const uidSafe = require("uid-safe");
const exifr = require("exifr");
const db = require("./server/db");
const path = require("path");
const { uploadMiddleware } = require("./server/s3");
const { moderationMiddleware } = require("./server/rekognition");
const imageRouter = require("./server/imageRoutes");
const authRouter = require("./server/authRoutes");

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
app.use(authRouter);
app.use(imageRouter);

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
    uploadMiddleware,
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
            // http://www.moserware.com/2008/02/does-your-code-pass-turkey-test.html
            // summary: Allways compare by toUpperCase.
            const tag = word.substr(1).toUpperCase();
            tags.push(tag);
        }
    }
    return tags;
}

app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
});
