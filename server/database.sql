create table if not exists users(
    id serial not null primary key,
    first_name varchar not null,
    last_name varchar not null,
    email varchar not null unique,
    pw_hash varchar not null
);

create table if not exists images(
    id serial not null primary key,
    user_id int not null references users(id),
    key varchar not null,
    description varchar null,
    latitude float null,
    longitude float null, 
    -- there is no need to query for specific exif tags beyond latitude and longitude
    -- so we can just dump everything into a json column. This data could become useful
    -- later so we do not just throw it away.
    exif json null,
    
);
alter table images add column if not exists upload_time timestamp default NOW();
-- same as with the exif tags: We do not need to search by label, and just 
-- dropping all of them into a json column is a fast and easy way to quickly
-- get something running
alter table images add column if not exists moderation_labels json null;

create table if not exists tags (
    id serial not null primary key,
    name varchar not null unique
);

create table if not exists image_tags (
    -- "on delete cascade" means that when a tag is deleted the database will 
    -- delete all image_tags referencing that tag. Same for the reference to
    -- images. An image_tag that refers to a non-existing image or a nonexisting
    -- tag makes no sense at all. 
    tag_id int not null references tags(id) on delete cascade,
    image_id int not null references images(id) on delete cascade,
    primary key (tag_id, image_id)
);



create table if not exists user_subscriptions (
    target_user_id int not null references users(id),
    source_user_id int not null references user(id),
    primary key (target_user_id, source_user_id)
);

create table if not exists tag_subscriptions (
    target_user_id int not null references users(id),
    tag_id int not null references tags(id)
);