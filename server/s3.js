const aws = require("aws-sdk");
const fs = require("fs");

const { AWS_KEY, AWS_SECRET, AWS_BUCKET } = process.env;
if (!AWS_KEY) {
    throw "AWS_KEY not set";
}
if (!AWS_SECRET) {
    throw "AWS_SECRET not set";
}
if (!AWS_BUCKET) {
    throw "AWS_S3_BUCKET not set";
}

const s3 = new aws.S3({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
    region: "eu-central-1" // Frankfurt
});
const BUCKET_NAME = AWS_BUCKET;

exports.BUCKET = BUCKET_NAME;
/**
 *
 * @param {string} key
 * @returns string the s3 path for a given key
 */
exports.getPathForImage = key => {
    return "uploads/" + key + ".jpg";
};
/**
 *
 * @param {string} key
 * @returns {string}
 * */
exports.getUrl = key => {
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${this.getPathForImage(key)}`;
};

/**
 * upload middleware. Puts a freshly uploaded file from /uploads to
 * s3. Configuration is done by environment args. Set the credentials
 * by setting AWS_SECRET and AWS_KEY, the bucket by AWS_S3_BUCKET
 */
exports.uploadMiddleware = async (req, res, next) => {
    if (!req.file) {
        console.log("multer failed :-/");
        return res.sendStatus(500);
    }
    const { key, mimetype, size, path, filename } = req.file;
    let extension = filename.substring(filename.length - 4);
    extension = extension.toLowerCase();
    const buffer = fs.readFileSync(path);
    try {
        const request = {
            Bucket: AWS_BUCKET,
            ACL: "public-read",
            Key: "uploads/" + key + extension,
            Body: buffer, //fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size
        };
        await s3.putObject(request).promise();
        next();
        fs.unlink(path, () => {});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
};
