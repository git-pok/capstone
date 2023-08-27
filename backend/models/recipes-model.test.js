process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("./error.js");
const Recipe = require("./recipes.js");
const { genTestUsers } = require("../test-data/_test-data.js");


let usr1Test;
let usr2Test;
let usr1TokenTest;
let usr2TokenTest;
let usr1IdTest;
let usr2IdTest;

beforeEach(async () => {
    const { 
            usr1, usr1Token, usr2, usr2Token,
            usr1Id, usr2Id
        } = await genTestUsers();
    usr1Test = {...usr1};
    usr2Test = {...usr2};
    usr1TokenTest = usr1Token;
    usr2TokenTest = usr2Token;
    usr1IdTest = usr1Id;
    usr2IdTest = usr2Id;
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("Recipe.getLikesOrDis", () => {
    test("get user ids for recipe likes", async () => {
        const recipeliks = await Recipe.getLikesOrDis(1684);
        expect(recipeliks).toEqual([]);
    });
});

describe("Recipe.getLikesOrDis", () => {
    test("get user ids for recipe dislikes", async () => {
        const recipeDisliks = await Recipe.getLikesOrDis(1684, false);
        expect(recipeDisliks).toEqual([]);
    });
});

describe("Recipe.getRecipeIngrdts", () => {
    test("get ingredients for recipe", async () => {
        const recipeIngrdts = await Recipe.getRecipeIngrdts(1684);
        expect(recipeIngrdts).toEqual(
            [
                {
                    "qty": "410",
                    "unit": "g",
                    "ingredient": "can  peach halves",
                    "ingredient_id": 7316
                },
                {
                    "qty": "100",
                    "unit": "g",
                    "ingredient": "frozen raspberry, plus a few for garnish",
                    "ingredient_id": 7317
                },
                {
                    "qty": "100",
                    "unit": "ml",
                    "ingredient": "orange juice",
                    "ingredient_id": 143
                }
            ]
        )
    });
});

describe("Recipe.getRecipeReviews", () => {
    test("get recipe reviews", async () => {
        const recipeRvws = await Recipe.getRecipeReviews(14);
        expect(recipeRvws).toEqual(
            []
        )
    });
});

describe("Recipe.defineLiksDis", () => {
    test("request and define recipe likes/dislikes on array, impure", async () => {
        const recipe = [{
            "id": 1686,
            "name": "vitamin booster smoothie",
            "author": "good food team",
            "rating": 3,
            "vote_count": 10,
            "url": "https://www.bbcgoodfood.com/recipes/vitamin-booster-smoothie",
            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vitamin-booster-3c28ae8.jpg",
            "description": "Up your vitamin quota with help from this bright and fresh smoothie. Orange, carrot, celery and mango pack a nutritious punch",
            "serves": 1,
            "level": "easy",
            "main_cat_name": "health",
            "sub_cat_name": "smoothies",
            "steps": "Put all the orange, carrot, celery and mango in the blender, top up with water, then blitz until smooth.",
            "prep_time": "5 mins",
            "cook_time": "No Time"
        }];
        const newRecipeArray = await Recipe.defineLiksDis(recipe);
        expect(recipe).toEqual(
            [
                {
                    "id": 1686,
                    "name": "vitamin booster smoothie",
                    "author": "good food team",
                    "rating": 3,
                    "vote_count": 10,
                    "url": "https://www.bbcgoodfood.com/recipes/vitamin-booster-smoothie",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vitamin-booster-3c28ae8.jpg",
                    "description": "Up your vitamin quota with help from this bright and fresh smoothie. Orange, carrot, celery and mango pack a nutritious punch",
                    "serves": 1,
                    "level": "easy",
                    "main_cat_name": "health",
                    "sub_cat_name": "smoothies",
                    "steps": "Put all the orange, carrot, celery and mango in the blender, top up with water, then blitz until smooth.",
                    "prep_time": "5 mins",
                    "cook_time": "No Time",
                    "liked_user_ids": [],
                    "disliked_user_ids": []
                }
            ]
        );
        expect(recipe).toBe(newRecipeArray);
    });

    test("request and define recipe likes/dislikes on array, pure", async () => {
        const recipe = [{
            "id": 1686,
            "name": "vitamin booster smoothie",
            "author": "good food team",
            "rating": 3,
            "vote_count": 10,
            "url": "https://www.bbcgoodfood.com/recipes/vitamin-booster-smoothie",
            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vitamin-booster-3c28ae8.jpg",
            "description": "Up your vitamin quota with help from this bright and fresh smoothie. Orange, carrot, celery and mango pack a nutritious punch",
            "serves": 1,
            "level": "easy",
            "main_cat_name": "health",
            "sub_cat_name": "smoothies",
            "steps": "Put all the orange, carrot, celery and mango in the blender, top up with water, then blitz until smooth.",
            "prep_time": "5 mins",
            "cook_time": "No Time"
        }];
        const newRecipeArray = await Recipe.defineLiksDis(recipe, true);
        expect(newRecipeArray).toEqual(
            [
                {
                    "id": 1686,
                    "name": "vitamin booster smoothie",
                    "author": "good food team",
                    "rating": 3,
                    "vote_count": 10,
                    "url": "https://www.bbcgoodfood.com/recipes/vitamin-booster-smoothie",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vitamin-booster-3c28ae8.jpg",
                    "description": "Up your vitamin quota with help from this bright and fresh smoothie. Orange, carrot, celery and mango pack a nutritious punch",
                    "serves": 1,
                    "level": "easy",
                    "main_cat_name": "health",
                    "sub_cat_name": "smoothies",
                    "steps": "Put all the orange, carrot, celery and mango in the blender, top up with water, then blitz until smooth.",
                    "prep_time": "5 mins",
                    "cook_time": "No Time",
                    "liked_user_ids": [],
                    "disliked_user_ids": []
                }
            ]
        );
        expect(recipe).not.toBe(newRecipeArray);
    });
});

describe("Recipe.recipeOrRecipes", () => {
    test("get recipe", async () => {
        const recipe = await Recipe.recipeOrRecipes(220);
        expect(recipe).toEqual([{
            "id": 220,
		    "name": "carrot cake overnight oats",
			"author": "sophie godwin – cookery writer",
			"rating": 3,
			"vote_count": 40,
			"url": "https://www.bbcgoodfood.com/recipes/carrot-cake-overnight-oats",
			"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/carrot-cake-oats-85f0f96.jpg",
			"description": "Give overnight oats a tasty boost with our indulgent carrot cake version. This simple, healthy breakfast recipe takes just 10 minutes to prepare",
			"serves": 1,
			"level": "easy",
			"main_cat_name": "recipes",
			"sub_cat_name": "breakfast recipes",
			"steps": "Mix the grated carrot, mixed spice and cinnamon with the oats, 150ml water and a pinch of salt, then cover and chill in the fridge overnight. The next day, stir in the honey and sultanas then top with Greek yogurt.",
			"prep_time": "10 mins",
			"cook_time": "No Time",
			"liked_user_ids": [],
			"disliked_user_ids": [],
            "reviews": [],
            "ingredients": [
                {
                    "qty": "40",
                    "unit": "g",
                    "ingredient": "grated carrot",
                    "ingredient_id": 1361
                },
                {
                    "qty": "",
                    "unit": "no unit",
                    "ingredient": "a big pinch of mixed spice",
                    "ingredient_id": 1362
                },
                {
                    "qty": "¼",
                    "unit": "tsp",
                    "ingredient": "cinnamon",
                    "ingredient_id": 698
                },
                {
                    "qty": "50",
                    "unit": "g",
                    "ingredient": "rolled porridge oats",
                    "ingredient_id": 1363
                },
                {
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "honey",
                    "ingredient_id": 337
                },
                {
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "sultanas",
                    "ingredient_id": 1364
                }
            ]
        }]);
    });
    
    test("404 error for not found recipe", async () => {
        await expect(async () => {
            await Recipe.recipeOrRecipes(2000);
        }).rejects.toThrow(ExpressError);
    })
});

describe("Recipe.recipeOrRecipes, no id parameter", () => {
	test("get recipes", async () => {
        const recipes = await Recipe.recipeOrRecipes();
        expect(recipes.length).toEqual(1686);
        expect(recipes[0].id).toEqual(expect.any(Number));
        expect(recipes[0].name).toEqual(expect.any(String));
        expect(recipes[0].name).toEqual(expect.any(String));
        expect(recipes[0].description).toEqual(expect.any(String));
        expect(recipes[0].author).toEqual(expect.any(String));
    });
});

describe("Recipe.recipesFilter", () => {
	test("get recipe with name filter", async () => {
		const qry = { name: "chicken" };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].name).toContain("chicken");
        expect(recipes[0]["disliked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[20].name).toContain("chicken");
        expect(recipes[20]["liked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[recipes.length - 1].name).toContain("chicken");
    });

	test("get recipe with orderBy/chronOrder filter", async () => {
		const qry = { orderBy: "rating", chronOrder: "desc" };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].rating).toEqual(5);
        expect(recipes[0]["liked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[0]["disliked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[recipes.length - 1].rating).toEqual(1);
    });

	test("get recipe with rating filter", async () => {
		const qry = { rating: 5 };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].rating).toEqual(5);
        expect(recipes[0]["liked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[0]["disliked_user_ids"]).toEqual(expect.any((Array)));
        expect(recipes[recipes.length - 1].rating).toEqual(5);
    });

    test("error for chron order without order by", async () => {
		const qry = { rating: 5, chronOrder: "asc" };
        await expect(async () => {
            await Recipe.recipesFilter(qry);
        }).rejects.toThrow(ExpressError);
    });
});