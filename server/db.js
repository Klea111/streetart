const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DB_URL);

exports.createArtist = async ({ name }) => {
    const result = await db.query(
        `INSERT INTO artists (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *;`,
        [name]
    );
    return result.rows[0];
};

exports.createImage = async (file, description, userId, tags) => {
    try {
        const { latitude, longitude } = file.exif;
        let result = await db.query(
            `
        INSERT INTO images
            (user_id, key, description, latitude, longitude, exif, moderation_labels) 
        VALUES 
            ( $1,     $2,  $3,          $4,        $5,       $6,   $7)
        RETURNING *;`,
            [
                userId,
                file.key,
                description,
                latitude,
                longitude,
                file.exif,
                file.moderationLabels
            ]
        );
        let row = result.rows[0];
        const image = {
            id: row.id,
            userId,
            key: file.key,
            description,
            latitude,
            longitude,
            tags: [],
            exif: row.exif || {},
            moderationLabels: row.moderation_labels || []
        };

        for (var tag of tags) {
            result = await db.query(
                `INSERT INTO tags(name) VALUES($1) ON CONFLICT DO NOTHING RETURNING *;`,
                [tag]
            );
            if (result.rows.length === 1) {
                tagId = result.rows[0].id;
            } else {
                tagId = (await db.query("SELECT id FROM tags WHERE name = $1", [tag])).rows[0]
                    .id;
            }
            result = await db.query(
                `
                INSERT INTO image_tags(tag_id, image_id) VALUES($1, $2) ON CONFLICT DO NOTHING;`,
                [tagId, image.id]
            );
            let newTag = { id: tagId, name: tag };
            image.tags.push(newTag);
        }
        return image;
    } catch (error) {
        console.error(error);
    }
};

function mapImageRow(row) {
    return {
        artistId: row.artist_id,
        key: row.key,
        userId: row.userId
    };
}
