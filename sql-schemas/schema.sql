DROP DATABASE IF EXISTS savour;
CREATE DATABASE savour;
\c savour



CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR (121) UNIQUE NOT NULL
);


CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  unit VARCHAR (30) UNIQUE NOT NULL
);


CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  ingredient TEXT UNIQUE NOT NULL
);


CREATE TABLE main_category (
    id SERIAL PRIMARY KEY,
    main_cat_name VARCHAR (121) UNIQUE NOT NULL
);


CREATE TABLE sub_category (
    id SERIAL PRIMARY KEY,
    sub_cat_name VARCHAR (121) UNIQUE NOT NULL
);


CREATE TABLE difficulty (
    id SERIAL PRIMARY KEY,
    level VARCHAR (30) UNIQUE NOT NULL
);


CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  image TEXT,
  description TEXT NOT NULL,
  author_id INTEGER REFERENCES authors (id),
  serves INTEGER NOT NULL,
  difficulty_id INTEGER REFERENCES difficulty (id),
  main_category_id INTEGER REFERENCES main_category (id),
  sub_category_id INTEGER REFERENCES sub_category (id),
  steps TEXT NOT NULL,
  prep_time TEXT,
  cook_time TEXT
);


CREATE TABLE recipes_ingredients (
  id SERIAL,
  recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
  qty TEXT DEFAULT '1',
  unit_id INTEGER REFERENCES units (id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients (id) ON DELETE CASCADE
);


CREATE TABLE ratings (
  recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  vote_count INTEGER NOT NULL,
  PRIMARY KEY (recipe_id)
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR (30) UNIQUE NOT NULL,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR (30) NOT NULL,
    email TEXT CHECK (email ILIKE '%@%'),
    is_admin BOOLEAN DEFAULT FALSE,
    phone TEXT,
    header_img TEXT,
    profile_img TEXT,
    password TEXT UNIQUE NOT NULL
);


CREATE TABLE disliked_recipes (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE liked_recipes (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, recipe_id)
);


CREATE TABLE favorite_recipes (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, recipe_id)
);


CREATE TABLE saved_recipes (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE
);


CREATE TABLE occasions (
    id SERIAL PRIMARY KEY,
    occasion VARCHAR (121) UNIQUE NOT NULL
);


CREATE TABLE recipelists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    occasion_id INTEGER REFERENCES occasions (id),
    list_name VARCHAR (30) NOT NULL
);


CREATE TABLE recipelists_recipes (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id),
    list_id INTEGER REFERENCES recipelists (id) ON DELETE CASCADE
);


CREATE TABLE tips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
    tip TEXT NOT NULL
);


CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK(stars < 6),
    review TEXT NOT NULL
);


CREATE TABLE shoppinglists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id),
    list_name VARCHAR (121) NOT NULL
);


CREATE TABLE shoppinglists_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES shoppinglists (id) ON DELETE CASCADE,
    qty INTEGER,
    unit_id INTEGER REFERENCES units (id),
    ingredient_id INTEGER REFERENCES ingredients (id)
);


CREATE TABLE user_recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    recipe_name VARCHAR (121) NOT NULL
);


CREATE TABLE user_recipes_ingredients (
    id SERIAL PRIMARY KEY,
    user_recipe_id INTEGER REFERENCES user_recipes (id) ON DELETE CASCADE,
    qty INTEGER DEFAULT 1,
    unit_id INTEGER REFERENCES units (id),
    ingredient_id INTEGER REFERENCES ingredients (id)
);