const aws = require("aws-sdk");
const s3 = require("./s3");

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
const rekognition = new aws.Rekognition({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
    region: "eu-central-1" // Frankfurt
});

exports.moderate = async key => {
    const file = s3.getPathForImage(key);
    const response = await rekognition
        .detectModerationLabels({
            MinConfidence: 80,
            Image: {
                S3Object: {
                    Bucket: s3.BUCKET,
                    Name: s3.getPathForImage(key)
                }
            }
        })
        .promise();
    return response.ModerationLabels.map(label => [label.ParentName, label.Name].join("/"));
};

exports.moderationMiddleware = async (req, res, next) => {
    try {
        const key = req.file.key;
        const labels = await this.moderate(key);
        if (labels.length > 0) {
            req.file.moderation = labels;
        } else {
            req.file.moderation = null;
        }
        next();
    } catch (error) {
        console.error(error);
    }
};
