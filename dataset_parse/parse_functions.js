const { ingredientUnits } = require('./units_ids.js');
const { sqlUnitsIds } = require('./units_sql_obj.js');
const { ingredientIdObj } = require('./ingredient_id_obj.js');
const { authorSqlIdObj } = require('./authors_sql_objs.js');
const { mainCatSqlIdObj } = require('./main_cat_sql_objs.js');
const { subCatSqlIdObj } = require('./sub_cat_sql_objs.js');
const { sqlDifficultyIds } = require('./difficulty_id_objs.js');
/* structureRecipes
Restrcutures recipes.
Creates a better structure to parse
ingredients and other properties.
*/
function structureRecipes(objFrom, existItems = new Set(), newObj = {}) {
	const norm_name = objFrom.name.toLowerCase().trim();
	const norm_author = objFrom.author.toLowerCase().trim();
	const nameAuth = norm_name + " " + norm_author;
	if (!existItems.has(nameAuth)) {
		existItems.add(nameAuth);
		newObj.name = norm_name || "N/A";
		newObj.url = objFrom.url || "N/A";
		newObj.image = objFrom.image || "N/A";
		newObj.description = objFrom.description || "N/A";
		newObj.author = norm_author || "N/A";
		newObj.rating = objFrom.rattings || "N/A";
		newObj.vote_count = objFrom.vote_count || 0;
		newObj.serves = objFrom.serves || "N/A";
		newObj.difficulty = objFrom.difficult || "N/A";
		newObj.main_category = objFrom.maincategory || "N/A";
		newObj.sub_category = objFrom.subcategory || "N/A";
		newObj.dish_type = objFrom.dish_type || "N/A";
		newObj.ingredients = objFrom.ingredients.join(",");
		newObj.steps = objFrom.steps.join(" ");
		newObj.prep_time = objFrom.times.Preparation || "N/A";
		newObj.cook_time = objFrom.times.Cooking || "N/A";
		return newObj;
	} else {
		return null;
	}
};


/* extractUnits
Extracts units from recipes,
in order to create a PostgreSQL units table.
"20g butter, 200ml milk, 400g cocoa" => ["g", "ml"];
*/
function extractUnits(objFrom, existItems = new Set(), unitValues = [], units = ingredientUnits) {
	const ingredientArray = JSON.parse(JSON.stringify(objFrom.ingredients.split(",")));
	const ltrs = new Set();
	const nums = new Set();
	ltrs.add("b").add("c").add("d").add("e").add("f").add("g").add("i").add("j").add("k").add("l").add("m").add("n").add("o").add("p").add("q").add("r").add("s").add("t").add("u").add("v").add("w").add("x").add("y").add("z");
	nums.add("½").add("¼").add("¾").add("⅘").add("⅓").add("⅔").add("⅗").add("0").add("1").add("2").add("3").add("4").add("5").add("6").add("7").add("8").add("9");
	let unit = "";
	let qty = "";
	let ptr1 = 0;
	let ptr2 = 0;
	while (ptr1 < ingredientArray.length) {
		const ingredientVal = ingredientArray[ptr1][ptr2];
		const hasLtr = ltrs.has(ingredientVal);
		const isUnit = nums.has(ingredientVal);
		const unitValExists = existItems.has(unit);
		if (ptr2 > ingredientArray[ptr1].length) {
			unit = undefined;
			qty = undefined;
			ptr1++;
			ptr2 = 0;
		} else if (units[unit] && !unitValExists) {
			existItems.add(unit);
			unitValues.push(unit);
			unit = undefined;
			qty = undefined;
			ptr2 = 0;
			ptr1++;
		} else if (hasLtr) {
			unit += ingredientVal;
			ptr2++;
		} else if (!hasLtr) {
			qty += ingredientVal;
			ptr2++;
		} else if (ingredientVal === " ") {
			ptr2++
		} else {
			ptr1++
			ptr2 = 0;
		}
	};
};


/* ingredientsStrToArray
Turns ingredients string to Array.
"20g butter, 200ml milk, 400g cocoa" =>
["20g butter", "200ml milk", "400g cocoa"];
*/
function ingredientsStrToArray(objFrom) {
	const unitValues = [];
	const ingredient = JSON.parse(JSON.stringify(objFrom.ingredients));
	let ptr1 = 0;
	let ptr2 = 0;
	while (ptr2 < ingredient.length) {
		if (ingredient[ptr2] === "," && ingredient[ptr2 + 1] !== " ") {
			unitValues.push(ingredient.slice(ptr1, ptr2));
			ptr1 = ptr2 + 1;
			ptr2++;
		} else {
			ptr2++;
		}
	}
	return unitValues;
};


/* parseIngredNoQtyOrUnits
Parses ingredients without qty and units.
"20g butter, 200ml milk, 400g cocoa" =>
[{"butter"}, {"milk"}, {"cocoa"}];
*/
function parseIngredNoQtyOrUnits(arr, existItems = new Set(), sqlValues = [], units = ingredientUnits) {
	const ltrs = new Set();
	const nums = new Set();
	const dividerSn = "/";
	ltrs.add(",").add("a").add("b").add("c").add("d").add("e").add("f").add("g").add("h").add("i").add("j").add("k").add("l").add("m").add("n").add("o").add("p").add("q").add("r").add("s").add("t").add("u").add("v").add("w").add("x").add("y").add("z");
	nums.add("½").add("¼").add("¾").add("⅘").add("⅓").add("⅔").add("⅗").add("0").add("1").add("2").add("3").add("4").add("5").add("6").add("7").add("8").add("9");
	// let qty;
	let unit = "";
	let ptr1 = 0;
	let ptr2 = 0;
	let lastNumIdx;
	while (ptr1 < arr.length) {
		ingredientVal = arr[ptr1][ptr2];
		const hasLtr = ltrs.has(ingredientVal);
		if (ingredientVal === undefined) {
			unit = "";
			ptr1++;
			ptr2 = 0;
			lastNumIdx = undefined;
		}
		else if (ingredientVal === " ") {
			if (!unit && arr[ptr1][ptr2 + 1] !== "x") {
				ptr2++;
			}
			else if (arr[ptr1][ptr2 + 1] === "x" && arr[ptr1][ptr2 + 2] === " " && ltrs.has(arr[ptr1][ptr2 + 3])) {
				const ingredient = arr[ptr1].slice(ptr2 + 3);
				const trimmedIngredient = ingredient.trim();
				if (!existItems.has(trimmedIngredient)) {
					existItems.add(trimmedIngredient);
					sqlValues.push({trimmedIngredient});
				};
				unit = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
			}
			else if (arr[ptr1][ptr2 + 1] === "x" && arr[ptr1][ptr2 + 2] === " ") {
				ptr2 = ptr2 + 3;
				unit = "";
			}
			else if (units[unit] && arr[ptr1][ptr2 + 1] === "/" && arr[ptr1][ptr2 + 2] === " ") {
				// leaves nums out
				// 150-200g / 5-7oz log firm => log firm
				// 2 x 160g cans
				ptr2 = ptr2 + 3;
				unit = "";
				// slices from /
				// const ingredient = arr[ptr1].slice(ptr2 + 2);
				// const trimmedIngredient = ingredient.trim();
				// if (!existItems.has(trimmedIngredient)) {
				// 	existItems.add(trimmedIngredient);
				// 	sqlValues.push({trimmedIngredient});
				// };
				// unit = "";
				// ptr1++;
				// ptr2 = 0;
				// lastNumIdx = undefined;
			}
			else if (unit && !units[unit]) {
				const ingredient = lastNumIdx !== undefined ? arr[ptr1].slice(lastNumIdx + 1) : arr[ptr1].slice(0);
				const trimmedIngredient = ingredient.trim();
				if (!existItems.has(trimmedIngredient)) {
					existItems.add(trimmedIngredient);
					sqlValues.push({trimmedIngredient});
				};
				unit = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
			}
			else if (unit && units[unit]) {
				const ingredient = arr[ptr1].slice(ptr2 + 1);
				const trimmedIngredient = ingredient.trim();
				if (!existItems.has(trimmedIngredient)) {
					existItems.add(trimmedIngredient);
					sqlValues.push({trimmedIngredient});
				};
				unit = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
			}
		}
		else if (ptr2 === arr[ptr1].length - 1) {
			const ingredient = lastNumIdx !== undefined ? arr[ptr1].slice(lastNumIdx + 1) : arr[ptr1].slice(0);
			const trimmedIngredient = ingredient.trim();
			if (!existItems.has(trimmedIngredient)) {
				existItems.add(trimmedIngredient);
				sqlValues.push({trimmedIngredient});
			};
			unit = "";
			ptr1++;
			ptr2 = 0;
			lastNumIdx = undefined;
		}
		else if (ingredientVal === dividerSn) {
			ptr2++;
			unit = "";
		}
		else if (ingredientVal !== " " && !ltrs.has(ingredientVal) && arr[ptr1][ptr2 + 1] === "x") {
			lastNumIdx = ptr2 + 1;
			ptr2++;
		}
		else if (ingredientVal !== " " && !ltrs.has(ingredientVal)) {
			lastNumIdx = ptr2;
			ptr2++;
		}
		else if (ltrs.has(ingredientVal)) {
			unit += ingredientVal;
			ptr2++;
		}
	};
	// TRIP 1: no space after tomatoes.
	// ingredients [
	// 	'2 seeded wraps',
	// 	'a little olive oil, for brushing',
	// 	'1 roasted red pepper, from a jar',
	// 	'2 tomatoes',
	// 	'2 tbsp tomato purée',
	// 	'1 tbsp chopped dill',
	// 	'2 tbsp chopped parsley',
	// 	'2 eggs',
	// 	'65g pack  rocket'
	//   ]

	// TRIP 2 empty array value
	// ingredients [
	// 	'1 tbsp olive oil',
	// 	'800g piece of lean fillet steak (ask for a piece from the middle of the fillet with an even thickness)',
	// 	'25g butter',
	// 	'1 banana shallot, finely chopped',
	// 	'1 garlic clove, chopped',
	// 	'500g button mushrooms, very finely chopped in a food processor',
	// 	'2 tsp chopped soft-leaf thyme',
	// 	'12 slices prosciutto',
	// 	'50g Claxton blue cheese or stilton, crumbled',
	// 	'25g walnuts, roughly chopped',
	// 	'500g pack all-butter puff pastry',
	// 	'plain flour, for dusting',
	// 	'1 egg and 1 yolk, beaten',
	// 	'seasonal vegetables, to serve',
	// 	'1 banana shallot, finely chopped',
	// 	'1 garlic cloves, chopped',
	// 	'150ml red wine',
	// 	'1 large thyme sprig',
	// 	'2 bay leaves',
	// 	'600ml beef stock',
	// 	'2 tbsp plain flour, mixed to a paste with 3 tbsp water',
	// 	''
	//   ]
};


/* extractAuthors
Parses authors.
*/
function extractAuthors(objFrom, sqlValues = [], existItems) {
	const norm_author = objFrom.author.toLowerCase().trim();
	if (!existItems.has(norm_author)) {
		existItems.add(norm_author);
		sqlValues.push({norm_author});
	};
};


/* makeRecipesIngTableSql
Makes objs with recipe id, qty, unit id, and ingredient id.
*/
function makeRecipesIngTableSql(arr, sqlValues, recipeId = null, existItems, unitsObj = sqlUnitsIds, ingrIdObj = ingredientIdObj) {
	const ltrs = new Set();
	const nums = new Set();
	const dividerSn = "/";
	ltrs.add(",").add("a").add("b").add("c").add("d").add("e").add("f").add("g").add("h").add("i").add("j").add("k").add("l").add("m").add("n").add("o").add("p").add("q").add("r").add("s").add("t").add("u").add("v").add("w").add("x").add("y").add("z");
	nums.add("½").add("¼").add("¾").add("⅘").add("⅓").add("⅔").add("⅗").add("0").add("1").add("2").add("3").add("4").add("5").add("6").add("7").add("8").add("9");
	let qty = "";
	let unit = "";
	let ptr1 = 0;
	let ptr2 = 0;
	let lastNumIdx;
	while (ptr1 < arr.length) {
		ingredientVal = arr[ptr1][ptr2];
		const hasLtr = ltrs.has(ingredientVal);
		if (ingredientVal === undefined) {
			unit = "";
			qty = "";
			ptr1++;
			ptr2 = 0;
			lastNumIdx = undefined;
		}
		else if (ingredientVal === " ") {
			if (!unit && arr[ptr1][ptr2 + 1] !== "x") {
				ptr2++;
			}
			else if (arr[ptr1][ptr2 + 1] === "x" && arr[ptr1][ptr2 + 2] === " " && ltrs.has(arr[ptr1][ptr2 + 3])) {
				const ingredient = arr[ptr1].slice(ptr2 + 3);
				const trimmedIngredient = ingredient.trim();
				qty += arr[ptr1][ptr2 + 1];
				// // NEW LOGIC
				const ingredientId = ingrIdObj[trimmedIngredient];
				const unitId = unitsObj[unit] || unitsObj["no unit"];
				const entry = recipeId + " " + qty + " " + unitId + " " + ingredientId;
				if (!existItems.has(entry)) {
					existItems.add(entry);
					sqlValues.push({recipeId, qty, unitId, ingredientId});
				};
				unit = "";
				qty = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
				// sqlValues.push({qty});
			}
			else if (arr[ptr1][ptr2 + 1] === "x" && arr[ptr1][ptr2 + 2] === " ") {
				qty += arr[ptr1][ptr2 + 1];
				ptr2 = ptr2 + 3;
				unit = "";
			}
			else if (unitsObj[unit] && arr[ptr1][ptr2 + 1] === "/" && arr[ptr1][ptr2 + 2] === " ") {
				const hasQty = qty.indexOf("x");
				qty = hasQty !== -1 ? qty.slice(0, hasQty + 1) : "";
				ptr2 = ptr2 + 3;
				// console.log("QTY / SPACE", qty);
				// console.log(arr[ptr1]);
				unit = "";
			}
			else if (unit && !unitsObj[unit]) {
				const ingredient = lastNumIdx !== undefined ? arr[ptr1].slice(lastNumIdx + 1) : arr[ptr1].slice(0);
				const trimmedIngredient = ingredient.trim();
				// // NEW LOGIC
				const ingredientId = ingrIdObj[trimmedIngredient];
				const unitId = unitsObj[unit] || unitsObj["no unit"];
				const entry = recipeId + " " + qty + " " + unitId + " " + ingredientId;
				if (!existItems.has(entry)) {
					existItems.add(entry);
					sqlValues.push({recipeId, qty, unitId, ingredientId});
				};
				unit = "";
				qty = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
				// sqlValues.push({qty});
			}
			else if (unit && unitsObj[unit]) {
				const ingredient = arr[ptr1].slice(ptr2 + 1);
				const trimmedIngredient = ingredient.trim();
				// // NEW LOGIC
				const ingredientId = ingrIdObj[trimmedIngredient];
				const unitId = unitsObj[unit] || unitsObj["no unit"];
				const entry = recipeId + " " + qty + " " + unitId + " " + ingredientId;
				if (!existItems.has(entry)) {
					existItems.add(entry);
					sqlValues.push({recipeId, qty, unitId, ingredientId});
				};
				unit = "";
				qty = "";
				ptr1++;
				ptr2 = 0;
				lastNumIdx = undefined;
				// sqlValues.push({qty});
			}
		}
		else if (ptr2 === arr[ptr1].length - 1) {
			const ingredient = lastNumIdx !== undefined ? arr[ptr1].slice(lastNumIdx + 1) : arr[ptr1].slice(0);
			const trimmedIngredient = ingredient.trim();
			// // NEW LOGIC
			const ingredientId = ingrIdObj[trimmedIngredient];
			const unitId = unitsObj[unit] || unitsObj["no unit"];
			const entry = recipeId + " " + qty + " " + unitId + " " + ingredientId;
			if (!existItems.has(entry)) {
				existItems.add(entry);
				sqlValues.push({recipeId, qty, unitId, ingredientId});
			};
			unit = "";
			qty = "";
			ptr1++;
			ptr2 = 0;
			lastNumIdx = undefined;
			// sqlValues.push({qty});
		}
		else if (ingredientVal === dividerSn) {
			qty = "";
			ptr2++;
			// console.log("QTY / NO SPACE", qty);
			// console.log(arr[ptr1]);
			unit = "";
		}
		else if (ingredientVal !== " " && !ltrs.has(ingredientVal) && arr[ptr1][ptr2 + 1] === "x") {
			lastNumIdx = ptr2 + 1;
			qty += arr[ptr1][ptr2];
			qty += arr[ptr1][ptr2 + 1];
			// console.log("QTY X NO SPACE", qty);
			// console.log(arr[ptr1]);
			ptr2++;
		}
		else if (ingredientVal !== " " && !ltrs.has(ingredientVal)) {
			lastNumIdx = ptr2;
			qty += arr[ptr1][ptr2];
			ptr2++;
		}
		else if (ltrs.has(ingredientVal)) {
			unit += ingredientVal;
			ptr2++;
		}
	};
}



/* recipesIngrObjToSql
Makes sql query's from recipe objs.
*/
function recipesIngrObjToSql (obj, sqlValues) {
	const sqlVals = [];
	let sql;
	for (let val in obj) {
		if (typeof obj[val] !== "number") {
			sqlVals.push(`'${obj[val]}'`);
		}
		else sqlVals.push(obj[val]);
	}
	sql = `(${sqlVals.join(", ")})`;
	sqlValues.push(sql);
};


/* makeIngrIdObj
Makes obj with ingredient name as the prop,
and its sql id as a value.
This will allow is to make sql inserts.
*/
function makeIngrIdObj (objFrom, objTo) {
	objTo[objFrom.ingredient] = objFrom.id;
}

/* propToId
Makes obj with a property set to an id.
*/
function propToId (val, objFrom, objTo) {
	objTo[objFrom[val]] = objFrom.id;
}


/* makeCatObjs
Makes objs with recipe categorys.
*/
function makeCatObjs (cat, objFrom, arrayTo, existItems, newObj = {}) {
	const norm_cat = objFrom[cat].toLowerCase().trim();
	if (!existItems.has(norm_cat)) {
		existItems.add(norm_cat);
		newObj[cat] = norm_cat;
		arrayTo.push(newObj);
	}
}



/* extractRating
Parses ratings.
*/
function extractRating(objFrom, sqlValues = [], existItems) {
	const id = objFrom.id;
	const rating = objFrom.rating;
	const vote_count = objFrom.vote_count;
	if (!existItems.has(id)) {
		existItems.add(id);
		sqlValues.push({id, rating, vote_count});
	};
}


/* extractDifficulty
Parses difficulty.
*/
function extractDifficulty(objFrom, sqlValues = [], existItems) {
	const difficulty = objFrom.difficulty.toLowerCase().trim();
	if (!existItems.has(difficulty)) {
		existItems.add(difficulty);
		sqlValues.push({difficulty});
	};
}




/* finalRecipesTable
Makes final recipes obj.
Has author_id, no ingredients,
no rating, no vote_count,
and category and sub category ids.
*/
function finalRecipesTable(
	objFrom, sqlValues, newObj = {},
	authIds = authorSqlIdObj,
	mCatIds = mainCatSqlIdObj,
	sCatIds = subCatSqlIdObj,
	diffSqlIds = sqlDifficultyIds) {
		newObj.id = objFrom.id;
		newObj.name = objFrom.name;
      	newObj.url = objFrom.url;
      	newObj.image = objFrom.image;
      	newObj.description = objFrom.description;
		const author = objFrom.author;
      	newObj.author_id = authIds[author];
      	// newObj.rating = objFrom.rating;
      	// newObj.vote_count = objFrom.vote_count;
      	newObj.serves = objFrom.serves;
		const difficulty = objFrom.difficulty.toLowerCase().trim();
      	newObj.difficulty_id = sqlDifficultyIds[difficulty];
		const main_category = objFrom.main_category.toLowerCase().trim();
      	newObj.main_category_id = mCatIds[main_category];
		const sub_category = objFrom.sub_category.toLowerCase().trim();
      	newObj.sub_category_id = sCatIds[sub_category];
      	// newObj.dish_type = objFrom.dish_type || "N/A";
      	newObj.steps = objFrom.steps;
      	newObj.prep_time = objFrom.prep_time || "N/A";
      	newObj.cook_time = objFrom.cook_time || "N/A";
		sqlValues.push(newObj);
}


module.exports = {
	structureRecipes, extractUnits,
	ingredientsStrToArray, parseIngredNoQtyOrUnits,
	makeIngrIdObj, extractAuthors, propToId,
	makeRecipesIngTableSql, recipesIngrObjToSql,
	makeCatObjs, extractRating, extractDifficulty,
	finalRecipesTable
};