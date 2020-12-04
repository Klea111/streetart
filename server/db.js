const { query } = require("express");
const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DB_URL);

exports.createArtist = async ({ name }) => {
    const queryResult = await db.query(
        `INSERT INTO artists (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *;`,
        [name]
    );
    return queryResult.rows[0];
};

exports.createImage = async (file, description, userId, tags) => {
    try {
        const { latitude, longitude } = file.exif || { latitude: null, longitude: null };
        let queryResult = await db.query(
            `
        INSERT INTO images
            (user_id, key, description, latitude, longitude, exif, moderation_labels) 
        VALUES 
            ( $1,     $2,  $3,          $4,        $5,       $6,   $7)
        RETURNING *;`,
            [
                userId,
                file.key,
                description || null,
                latitude || null,
                longitude || null,
                file.exif || {},
                JSON.stringify(file.moderation)
            ]
        );
        let row = queryResult.rows[0];
        const image = {
            id: row.id,
            userId,
            key: file.key,
            description,
            latitude: latitude || null,
            longitude: longitude || null,
            tags: [],
            exif: row.exif || {},
            moderationLabels: row.moderation_labels || []
        };

        for (var tag of tags) {
            queryResult = await db.query(
                `INSERT INTO tags(name) VALUES($1) ON CONFLICT DO NOTHING RETURNING *;`,
                [tag]
            );
            if (queryResult.rows.length === 1) {
                tagId = queryResult.rows[0].id;
            } else {
                tagId = (await db.query("SELECT id FROM tags WHERE name = $1", [tag])).rows[0]
                    .id;
            }
            queryResult = await db.query(
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

const loadImageSql = `
        select 
            i.id,
            i.user_id as user_id,
            i.key,
            i.description,
            i.latitude,
            i.longitude,
            i.exif,
            i.moderation_labels,
            u.first_name,
            u.last_name,
            t.name as tag,
            t.id as tag_id
        from images i
        inner join users u on i.user_id = u.id
        left outer join image_tags it on it.image_id = i.id
        left outer join tags t on t.id = it.tag_id
        `;

exports.loadImage = async id => {
    const query = loadImageSql + "where i.id = $1";
    const queryResult = await db.query(query, [id]);
    const row = queryResult.rows[0];
    const image = mapRowToImage(row);
    for (let row of queryResult.rows) {
        if (row.tag) {
            const tag = {
                tag: row.tag,
                id: row.tag_id
            };
            image.tags.push(tag);
        }
    }
    return image;
};

exports.listByTag = async name => {
    const sql = `
        select 
            i.id,
            i.user_id as user_id,
            i.key,
            i.description,
            i.latitude,
            i.longitude,
            i.exif,
            i.moderation_labels, 
            u.first_name,
            u.last_name,
            t.name as tag,
            t.id as tag_id
        from image_tags it 
        inner join tags t on it.tag_id = t.id
        inner join images i on i.id = it.image_id
        inner join users u on u.id = i.user_id
        where exists (
            select * 
            from image_tags other_image_tag
            inner join tags other_tag on other_image_tag.tag_id = other_tag.id
            where other_tag.name = $1
        )
        order by i.id;
    `;
    const queryResult = await db.query(sql, [name]);
    const images = {};
    for (let row of queryResult.rows) {
        let image = mapRowToImage(row);
        if (images[image.id]) {
            images[image.id].tags.push(row.tag);
        } else {
            images[image.id] = image;
        }
    }
    return Object.values(images);
};

exports.listModerationQueue = async () => {
    const sql = ` 
        SELECT * from images WHERE moderation_labels is not null order by upload_time desc;
    `;
    const queryResult = await db.query(sql);
    const result = queryResult.rows.map(row => mapRowToImage(row));
    return result;
};

function mapRowToImage(row) {
    const image = {
        id: row.id,
        userId: row.user_id,
        key: row.key,
        description: row.description,
        latitude: row.latitude,
        longitude: row.longitude,
        exif: row.exif || {},
        moderationLabels: row.moderation_labels || [],
        userName: row.first_name + " " + row.last_name,
        tags: []
    };
    return image;
}

function mapImageRow(row) {
    return {
        artistId: row.artist_id,
        key: row.key,
        userId: row.userId
    };
}
