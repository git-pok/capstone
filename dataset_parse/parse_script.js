const fs = require('fs');
// ALL Recipes
const { recipes } = require('./recipes.js');
const { sqlRecipes } = require('./recipes_w_sql_ids.js');
const { recipesIngredArrays } = require('./parse3.js');
const { sqlIngredObjs } = require('./ingredient_sql_objs.js');
const { sqlAuthIds } = require('./authors_id_objs.js');
// const { recipesIngredients } = require('./recipes_ingredients.json');
// const { recipesIngredArrays } = require('./parse3 copy.js');
// First Parse
// const { recipeObjs } = require('./sql_recipes_obj_w_ids.js');
// Second Parse
// const { ingredientArrs } = require('./sql_ingredients_write_I.js');
// console.log(ingredientArrs);
// Third Parse
// const { ingredientUnits } = require('./sql_ingredients_write_II.js');
// Fourth Parse
// const { ingredientUnitArrs } = require('./sql_ingredients_write_III.js');
// Fifth Parse
// const { ingredientsUnitIds } = require('./units_ids.js');
// Make Ingredient Id Obj
// const { ingredientsIds } = require('./ingredient_w_ids.js');
// Author Parse
// const { authorsIds } = require('./authors_w_ids.js');

const { 
        structureRecipes,
        extractUnits, ingredientsStrToArray,
        parseIngredNoQtyOrUnits, extractAuthors,
        makeRecipesIngTableSql, recipesIngrObjToSql,
        makeIngrIdObj, propToId, makeCatObjs,
        extractRating, extractDifficulty,
        finalRecipesTable
      } = require('./parse_functions.js');

const argV = process.argv;
const [ nodePath, scriptPath, writeFileNm ] = argV;
// console.log(writeFileNm);

function iterateObj(obj) {
  const existItems = new Set();
  const units = [];
  const recipes = [];
  const ingIdObj = {};
  const sqlValues = [];
  // Author parse
  const authorsArray = [];
  const authorsIds = {};

  // ltrs.add("b").add("c").add("d").add("e").add("f").add("g").add("i").add("j").add("k").add("l").add("m").add("n").add("o").add("p").add("q").add("r").add("s").add("t").add("u").add("v").add("w").add("x").add("y").add("z");
	// nums.add("½").add("¼").add("¾").add("⅘").add("⅓").add("⅔").add("⅗").add("0").add("1").add("2").add("3").add("4").add("5").add("6").add("7").add("8").add("9");
	  
  for (let val of obj) {
    // All Recipes
    // Parse1
    // const newRecipeObj = structureRecipes(val, existItems);
    // if (newRecipeObj !== null) recipes.push(newRecipeObj);
    // Parse2
    // extractUnits(val, existItems, units);
    // Parse3
    // const newIngredientStruc = ingredientsStrToArray(val);
    // val.ingredients = JSON.parse(JSON.stringify(newIngredientStruc));
    // Parse4
    // parseIngredNoQtyOrUnits(val.ingredients, existItems, sqlValues);
    // Parse5
    // makeIngrIdObj (val, ingIdObj);
    // Parse6
    // const newObj = JSON.parse(JSON.stringify(val));
    // extractAuthors(newObj, sqlValues, existItems);
    // Parse7
    // const newObj = JSON.parse(JSON.stringify(val));
    // propToId("full_name", newObj, authorsIds);
    // Parse8
    // makeRecipesIngTableSql(val.ingredients, sqlValues, val.id, existItems);
    // Parse9 Didnt Use
    // recipesIngrObjToSql(val, sqlValues);
    // Parse10
    // makeCatObjs("main_category", val, sqlValues, existItems);
    // Parse11
    // extractRating(val, sqlValues, existItems);
    // Parse12
    // extractDifficulty (val, sqlValues, existItems);
    // Parse13
    // finalRecipesTable(val, sqlValues);
  }
  // return recipes;
  // return units;
  // return obj;
  // return ingIdObj;
  // return authorsIds;
  return sqlValues;
}


function writeFile(filePath, content) {
    fs.writeFile(filePath, content, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error writing to ${filePath}! \n${error}!`);
            process.exit(1);
        } 
        console.log(`File write to: ${filePath}, complete!`);
    });
}

async function makeRecipeTableData() {
  // All Recipes
  // Parse1
  // Restructure dataset objects
  // const objParse = iterateObj(recipes);
  // Parse2
  // Make file with all units from recipes
  // const objParse = iterateObj(sqlRecipes);
  // Parse3
  // const objParse = iterateObj(sqlRecipes);
  // Parse4
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse5
  // const objParse = iterateObj(sqlIngredObjs);
  // Parse6
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse7
  // const objParse = iterateObj(sqlAuthIds);
  // Parse8
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse9 Didnt Use
  // const objParse = iterateObj(recipesIngredients);
  // Parse10
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse11
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse12
  // const objParse = iterateObj(recipesIngredArrays);
  // Parse13
  // const objParse = iterateObj(recipesIngredArrays);
  // const content = JSON.stringify(objParse, null, 2);
  const content = JSON.stringify(objParse);
  const filePathDirect = `.`;
  const filePath = `${filePathDirect}/${writeFileNm}`;
  writeFile(filePath, content);
}

makeRecipeTableData();



// readFileNm && writeFileNm ? readFileAndMakeOutputFiles() : console.log('Include File to Read From!')