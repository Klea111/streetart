create table if not exists users(
    id serial not null primary key,
    first_name varchar not null,
    last_name varchar not null,
    email varchar not null unique,
    pw_hash varchar not null
);