process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("./error.js");
const Recipe = require("./recipes.js");
const { genTestUsers } = require("../routes/_test-data.js");


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

describe("Recipe.getRecipeLikes", () => {
    test("get user ids for recipe likes", async () => {
        const recipeLiks = await Recipe.getRecipeLikes(1684);
        expect(recipeLiks).toEqual([]);
    });
});

describe("Recipe.getRecipeDisLikes", () => {
    test("get user ids for recipe dislikes", async () => {
        const recipeDisliks = await Recipe.getRecipeDisLikes(1684);
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
                    "ingredient": "can  peach halves"
                },
                {
                    "qty": "100",
                    "unit": "g",
                    "ingredient": "frozen raspberry, plus a few for garnish"
                },
                {
                    "qty": "100",
                    "unit": "ml",
                    "ingredient": "orange juice"
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

describe("Recipe.getRecipe", () => {
    test("get recipe", async () => {
        const recipe = await Recipe.getRecipe(220);
        expect(recipe).toEqual({
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
                    "ingredient": "grated carrot"
                },
                {
                    "qty": "",
                    "unit": "no unit",
                    "ingredient": "a big pinch of mixed spice"
                },
                {
                    "qty": "¼",
                    "unit": "tsp",
                    "ingredient": "cinnamon"
                },
                {
                    "qty": "50",
                    "unit": "g",
                    "ingredient": "rolled porridge oats"
                },
                {
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "honey"
                },
                {
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "sultanas"
                }
            ]
        });
    });
    
    test("404 error for not found recipe", async () => {
        await expect(async () => {
            await Recipe.getRecipe(2000);
        }).rejects.toThrow(ExpressError);
    })
});

describe("Recipe.getRecipes", () => {
	test("get recipes", async () => {
        const recipes = await Recipe.getRecipes();
        expect(recipes.length).toEqual(1686);
        expect(recipes[0].id).toEqual(expect.any(Number));
        expect(recipes[0].name).toEqual(expect.any(String));
        expect(recipes[0].name).toEqual(expect.any(String));
        expect(recipes[0].description).toEqual(expect.any(String));
        expect(recipes[0].author).toEqual(expect.any(String));
    });
});

describe("Recipe.recipesFilter", () => {
	test("name filter", async () => {
		const qry = { name: "chicken" };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].name).toContain("chicken");
        expect(recipes[20].name).toContain("chicken");
        expect(recipes[recipes.length - 1].name).toContain("chicken");
    });

	test("orderBy/chronOrder filter", async () => {
		const qry = { orderBy: "rating", chronOrder: "desc" };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].rating).toEqual(5);
        expect(recipes[recipes.length - 1].rating).toEqual(1);
    });

	test("rating filter", async () => {
		const qry = { rating: 5 };
        const recipes = await Recipe.recipesFilter(qry);
        expect(recipes[0].rating).toEqual(5);
        expect(recipes[recipes.length - 1].rating).toEqual(5);
    });
});