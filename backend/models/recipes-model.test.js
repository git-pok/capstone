process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("./error.js");
const Recipe = require("./recipes.js");
const { genTestUsers } = require("./_models-test-data.js");


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

describe("Recipe.getFavRecipes", () => {
    test("get user's fav recipes", async () => {
        const favRecipes = await Recipe.getFavRecipes(usr1IdTest);
        expect(favRecipes).toEqual(
            [
                {
                    "id": 6,
		            "name": "egg & avocado open sandwich",
		            "author": "chelsie collins",
		            "rating": 4,
		            "vote_count": 5,
		            "url": "https://www.bbcgoodfood.com/recipes/egg-avocado-open-sandwich",
		            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/egg-avocado-open-sandwich-3b6ef94.jpg",
		            "description": "Give your lunch box a moreish makeover - take the ingredients separately and assemble for a fresh and healthy midday meal",
		            "serves": 1,
		            "level": "easy",
		            "main_cat_name": "recipes",
		            "sub_cat_name": "lunch recipes",
		            "steps": "Bring a medium pan of water to the boil. Add the eggs and cook for 8-9 mins until hard-boiled. Meanwhile, halve the avocado and scoop the flesh into a bowl. Add the lime juice, season well and mash with a fork. When the eggs are cooked, run under cold water for 2 mins before removing the shells. Spread the avocado on the rye bread. Slice the eggs into thin rounds and place on top of the avocado. Drizzle some chilli sauce over the eggs, scatter the cress on top and add a good grinding of black pepper.",
		            "prep_time": "10 mins",
		            "cook_time": "10 mins"
                },
                {
                    "id": 100,
		            "name": "next level chilli con carne",
		            "author": "barney desmazery",
		            "rating": 4,
		            "vote_count": 43,
		            "url": "https://www.bbcgoodfood.com/recipes/next-level-chilli-con-carne",
		            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/the-ultimate-chilli-edb1c8c.jpg",
		            "description": "Reinvent this classic comfort food with our one-pan version that is enrichened with peanut butter, espresso powder and dark chocolate. You won't look back",
		            "serves": 8,
		            "level": "more effort",
		            "main_cat_name": "recipes",
		            "sub_cat_name": "dinner recipes",
		            "steps": "Heat oven to 140C/120C fan/gas 1. Over a high heat, toast the whole chillies on all sides until you can smell them cooking, then remove and set aside. Keep the pan on the heat and toast the peppercorns, cumin seeds and coriander seeds until they just start to change colour, then grind to a powder using a pestle and mortar or spice grinder. Mix with the smoked paprika and oregano (this is a standard tex-mex seasoning), then set aside. Return the casserole to the heat, add half the oil and heat until shimmering. Fry the beef in batches, adding more oil if you need to, until it’s browned on all sides, then set aside. Fry the onions in the pan over a low heat for about 8 mins until soft and golden, then add the garlic and cook for 1 min more. Working fast, add the meat and juices, the spice mix, tomato purée, peanut butter and coffee to the pan and cook for 2-3 mins, stirring to coat the meat until everything is thick and gloopy, then pour in the vinegar and stock. Add the toasted chillies back into the casserole, along with the bay leaves, cinnamon and some salt. Bring to a simmer and stir well, then cover with the lid and cook in the oven for 3hrs, stirring occasionally, until the meat is very tender but not falling apart. Take the casserole out of the oven, put back on the stove and remove the lid. Simmer the sauce for 5 mins, then stir in the semolina flour and simmer for 2-3 mins more. Finely grate over the chocolate, stir through with the beans and simmer for a minute more to heat through. Fish out the chillies, then leave everything to rest for at least 15 mins. Bring the pan to the table. Serve with bowls of accompaniments and the chilli paste (see tip below) to add heat.",
		            "prep_time": "25 mins",
		            "cook_time": "3 hrs"
                }
            ]
        )
    });
});

describe("Recipe.getSavedRecipes", () => {
    test("get user's saved recipes", async () => {
        const savedRecipes = await Recipe.getSavedRecipes(usr1IdTest);
        expect(savedRecipes).toEqual(
            [
                {
                    "id": 400,
		            "name": "nettle & blue cheese rarebit",
		            "author": "good food team",
		            "rating": 5,
		            "vote_count": 3,
		            "url": "https://www.bbcgoodfood.com/recipes/nettle-blue-cheese-rarebit",
		            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1286499_8-0596bb1.jpg",
		            "description": "No nettles? This simple rustic dish can also be made using spinach",
		            "serves": 4,
		            "level": "easy",
		            "main_cat_name": "recipes",
		            "sub_cat_name": "cheese recipes",
		            "steps": "Heat the olive oil in a frying pan. Add the nettles and cook for 1 min until wilted. Allow to cool for 1 min, then roughly chop. Add to a bowl with the crème fraÎche, mustard and half the blue cheese. Stir in seasoning and set aside. Heat the grill and lightly toast the bread on both sides. Divide the nettle and cheese mix between the toasts then pile on the remaining cheese and grill until golden and bubbling. Serve immediately.",
		            "prep_time": "5 mins",
		            "cook_time": "15 mins"
                },
                {
                    "id": 300,
		            "name": "vegan chilli",
		            "author": "barney desmazery",
		            "rating": 5,
		            "vote_count": 232,
		            "url": "https://www.bbcgoodfood.com/recipes/vegan-chilli",
		            "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vegan-chilli-be48585.jpg",
		            "description": "Our healthy vegan chilli recipe packs in plenty of vegetables and doesn’t fall short on the flavour front. Serve it with rice or in jacket potatoes for a filling supper",
		            "serves": 4,
		            "level": "easy",
		            "main_cat_name": "recipes",
		            "sub_cat_name": "storecupboard",
		            "steps": "Heat the oven to 200C/180C fan/gas 6. Put the sweet potato in a roasting tin and drizzle over 1½ tbsp oil, 1 tsp smoked paprika and 1 tsp ground cumin. Give everything a good mix so that all the chunks are coated in spices, season with salt and pepper, then roast for 25 mins until cooked. Meanwhile, heat the remaining oil in a large saucepan over a medium heat. Add the onion, carrot and celery. Cook for 8-10 mins, stirring occasionally until soft, then crush in the garlic and cook for 1 min more. Add the remaining dried spices and tomato purée. Give everything a good mix and cook for 1 min more. Add the red pepper, chopped tomatoes and 200ml water. Bring the chilli to a boil, then simmer for 20 mins. Tip in the beans and cook for another 10 mins before adding the sweet potato. Season to taste then serve with lime wedges, guacamole, rice and coriander. Will keep, in an airtight container in the freezer, for up to three months.To make in a slow cookerHeat the oil in a large frying pan over a medium heat. Add the onion, carrot and celery. Cook for 8-10 mins, stirring occasionally until soft, then crush in the garlic, tip in the sweet potato chunks and cook for 1 min more. Add all the dried spices, oregano and tomato purée, cook for 1 min, then tip into a slow cooker.Add the red pepper and chopped tomatoes. Give everything a good stir then cook on low for 5 hrs. Stir in the beans and cook for another 30 mins to 1 hr. Season to taste and serve with lime wedges, guacamole, rice and coriander.",
		            "prep_time": "15 mins",
		            "cook_time": "45 mins"
                }
            ]
        )
    });
});