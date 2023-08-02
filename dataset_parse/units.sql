DROP DATABASE IF EXISTS recipe_dev;
CREATE DATABASE recipe_dev;
\c recipe_dev

CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  unit TEXT UNIQUE NOT NULL
);

INSERT INTO units
  (unit)
VALUES
  ('g'),
  ('tsp'),
  ('tbsp'),
  ('ml'),
  ('l'),
  ('kg'),
  ('cm'),
  ('litre'),
  ('dl'),
  ('fl oz'),
  ('cup'),
  ('c'),
  ('p'),
  ('fl pt'),
  ('pt'),
  ('q'),
  ('qt'),
  ('fl qt'),
  ('gal'),
  ('oz'),
  ('mg'),
  ('mm'),
  ('m'),
  ('-ml/-fl oz'),
  ('no unit');