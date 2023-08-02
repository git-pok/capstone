DROP DATABASE IF EXISTS recipe_dev;
CREATE DATABASE recipe_dev;
\c recipe_dev

CREATE TABLE sub_category (
    id SERIAL PRIMARY KEY,
    sub_cat_name TEXT UNIQUE NOT NULL
);

INSERT INTO sub_category
    (sub_cat_name)
VALUES
    ('lunch recipes'),
    ('breakfast recipes'),
    ('sweet treats'),
    ('dinner recipes'),
    ('storecupboard'),
    ('desserts'),
    ('cheese recipes'),
    ('fish and seafood'),
    ('pasta'),
    ('vegan'),
    ('kids'' baking'),
    ('meat'),
    ('chicken'),
    ('savoury pastries'),
    ('keto'),
    ('low calorie'),
    ('salads'),
    ('vegan baking'),
    ('vegetarian'),
    ('bread'),
    ('cakes'),
    ('quick bakes'),
    ('biscuit recipes'),
    ('high protein'),
    ('free-from baking'),
    ('breakfast'),
    ('dinner'),
    ('smoothies'),
    ('fitness & lifestyle'),
    ('lunch');