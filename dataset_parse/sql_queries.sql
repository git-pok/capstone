SELECT name, qty, unit, ingredient FROM recipes_ingredients ri JOIN recipes r ON ri.recipe_id = r.id JOIN units u ON ri.unit_id = u.id JOIN ingredients i ON ri.ingredient_id = i.id  WHERE name = 'warm beet, chorizo & pear salad';
SELECT name, qty, unit, ingredient FROM recipes_ingredients ri JOIN recipes r ON ri.recipe_id = r.id JOIN units u ON ri.unit_id = u.id JOIN ingredients i ON ri.ingredient_id = i.id  WHERE recipe_id = 1684;
SELECT name, qty, unit, ingredient FROM recipes_ingredients ri JOIN recipes r ON ri.recipe_id = r.id JOIN units u ON ri.unit_id = u.id JOIN ingredients i ON ri.ingredient_id = i.id  WHERE recipe_id = 361;
SELECT re.name, ra.rating, ra.vote_count FROM ratings ra JOIN recipes re ON ra.recipe_id = re.id WHERE ra.recipe_id = 1164;
SELECT re.name, ra.rating, ra.vote_count FROM ratings ra JOIN recipes re ON ra.recipe_id = re.id WHERE ra.vote_count > 200 AND ra.rating = 5;
SELECT re.name, a.full_name  FROM recipes re JOIN authors a ON re.author_id = a.id  WHERE name = 'chilli con carne recipe';

-- HAS ERROR
SELECT name, qty, unit, ingredient FROM recipes_ingredients ri JOIN recipes r ON ri.recipe_id = r.id JOIN units u ON ri.unit_id = u.id JOIN ingredients i ON ri.ingredient_id = i.id  WHERE recipe_id = 666;
SELECT name, qty, unit, ingredient FROM recipes_ingredients ri JOIN recipes r ON ri.recipe_id = r.id JOIN units u ON ri.unit_id = u.id JOIN ingredients i ON ri.ingredient_id = i.id  WHERE recipe_id = 23;