const dotenv = require("dotenv");
const express = require("express");
const authDb = require("./authDb");
const bodyParser = require("body-parser");
const multer = require("multer");
const uidSafe = require("uid-safe");
const exifr = require("exifr");
const db = require("./db");
const path = require("path");
const { uploadMiddleWare } = require("./s3");
const { moderationMiddleware } = require("./rekognition");
const fs = require("fs");
const gm = require("gm");
const router = express.Router();
module.exports = router;

// taken from the imageboard example project
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        // callback(null, __dirname + "/upload");
        const uploadPath = __dirname + "./../upload";
        callback(null, uploadPath);
        // callback(null, __dirname + "../upload");
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
    if (!file) {
        throw "file object not bound to request";
    }
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

const resizeMiddleware = (req, res, next) => {
    const filePath = process.cwd() + `/upload/${req.file.key}.jpg`;
    gm(filePath)
        .resize(980)
        .write(filePath, err => {
            if (!err) {
                next();
            } else {
                console.error(err);
                throw err;
            }
        });
};

const _uploadPipeline = [
    requireLoginMiddleware,
    uploader.single("file"),
    exifrMiddleware,
    resizeMiddleware,
    uploadMiddleWare,
    moderationMiddleware
];

// router.post("/upload", _uploadPipeline, async (req, resp) => {
//     try {
//         const { file } = req;
//         const { description } = req.body;
//         let tags = [];
//         if (description) {
//             tags = parseTags(description);
//         }
//         const image = await db.createImage(file, description, req.user.id, tags);
//         image.exif = null;
//         return resp.json(image);
//     } catch (error) {
//         console.error(error);
//         return resp.status(500).send(error);
//     }
// });

router.get("/api/images/:id", async (req, resp) => {
    try {
        const id = req.params.id;
        const image = await db.loadImage(id);
        return resp.json(image);
    } catch (error) {
        console.error(error);
        return resp.status(500).send(error);
    }
});

router.delete("/api/images/:id", async (req, resp) => {
    try {
        const id = req.params.id;
        await db.deleteImage(id);
        return resp.sendStatus(200);
    } catch (error) {
        console.error(error);
        return resp.status(500).send(error);
    }
});

router.get("/api/images/in-moderation", async (req, resp) => {
    try {
        let queue = await db.listModerationQueue();
        return resp.json(queue);
    } catch (error) {
        console.error(error);
        return resp.status(500).send(error);
    }
});

router.get("/api/images/byTag/:tag", async (req, resp) => {
    try {
        const tag = req.params.tag;
        const images = await db.listByTag(tag);
        return resp.json(images);
    } catch (error) {
        console.error(error);
        return resp.status(500).send(error);
    }
});

router.delete("/api/images/in-moderation/:id", async (req, resp) => {
    const id = req.params.id;
    try {
        await db.deleteModerationLabels(id);
        return resp.sendStatus(200);
    } catch (error) {
        console.error(error);
        return resp.status(500).send(error);
    }
});
