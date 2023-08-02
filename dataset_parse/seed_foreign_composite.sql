DROP DATABASE IF EXISTS recipe_pk;
CREATE DATABASE recipe_pk;
\c recipe_pk

CREATE TABLE users (
    id SERIAL,
    name TEXT,
    PRIMARY KEY (id, name)
);

INSERT INTO users
    (name)
VALUES
    ('fvin'),
    ('toraq');

CREATE TABLE recipes (
    users_id INTEGER,
    users_name TEXT,
    FOREIGN KEY (users_id, users_name) REFERENCES users ON DELETE CASCADE
);

INSERT INTO recipes
    (users_id, users_name)
VALUES
(1, 'fvin'),
(2, 'toraq');