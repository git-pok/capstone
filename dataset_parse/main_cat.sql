DROP DATABASE IF EXISTS recipe_dev;
CREATE DATABASE recipe_dev;
\c recipe_dev

CREATE TABLE main_category (
    id SERIAL PRIMARY KEY,
    main_cat_name TEXT UNIQUE NOT NULL
);

INSERT INTO main_category
    (main_cat_name)
VALUES
    ('recipes'),
    ('baking'),
    ('health');