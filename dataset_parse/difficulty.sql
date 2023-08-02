DROP DATABASE IF EXISTS recipe_dev;
CREATE DATABASE recipe_dev;
\c recipe_dev

CREATE TABLE difficulty (
    id SERIAL PRIMARY KEY,
    phase TEXT UNIQUE NOT NULL
);

INSERT INTO difficulty
    (phase)
VALUES
    ('easy'),
    ('more effort'),
    ('a challenge');