process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("./error.js");
const Recipe = require("./recipes.js");


afterAll(async () => {
    await db.end();
});

describe("Recipe.getRecipeLikes", () => {
    test("get user ids for recipe likes", async () => {
        const recipeLiks = await Recipe.getRecipeLikes(1684);
        expect(recipeLiks).toEqual([1, 2, 3]);
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
            [
                {
                    "stars": 1,
                    "review": "Did not like seeds.",
                    "user_id": 6
                }
            ]
        )
    });

    test("get recipe reviews", async () => {
        const recipeRvws = await Recipe.getRecipeReviews(120);
        expect(recipeRvws).toEqual(
            [
                {
                    "stars": 3,
                    "review": "Good.",
                    "user_id": 6
                },
                {
                    "stars": 3,
                    "review": "Good.",
                    "user_id": 4
                },
                {
                    "stars": 3,
                    "review": "Good.",
                    "user_id": 7
                }
            ]
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
        const favRecipes = await Recipe.getFavRecipes(11);
        expect(favRecipes).toEqual(
            [
                {
                    "id": 13,
                    "name": "chicken pesto wrap",
                    "author": "barney desmazery",
                    "rating": 5,
                    "vote_count": 6,
                    "url": "https://www.bbcgoodfood.com/recipes/chicken-pesto-wrap",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chicken-pesto-wrap-b147add.jpg",
                    "description": "Swap soggy sandwiches for tortilla wraps filled with chicken, cheese and veggies in this tasty packed lunch recipe that kids will love",
                    "serves": 2,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Mix together the shredded chicken, soured cream, yogurt or mayonnaise with the pesto. Season. Lay a slice of cheese on each wrap, then divide the chicken mixture between them. Sprinkle with red pepper or sweetcorn, then top with the lettuce leaves. Be careful not to overfill or it will be tricky to contain all the filling. Wrap and roll each one, then pack in a lunchbox or tightly wrap in foil.",
                    "prep_time": "10 mins",
                    "cook_time": "No Time"
                },
                {
                    "id": 5,
                    "name": "falafel burgers",
                    "author": "good food team",
                    "rating": 4,
                    "vote_count": 710,
                    "url": "https://www.bbcgoodfood.com/recipes/falafel-burgers-0",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-326597_11-b7385b9.jpg",
                    "description": "A healthy burger that's filling too. These are great for anyone after a satisfying bite low in calories.",
                    "serves": 4,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Drain the chickpeas and pat dry with kitchen paper. Tip into a food processor along with the onion, garlic, parsley, cumin, coriander, harissa paste, flour and a little salt. Blend until fairly smooth, then shape into four patties with your hands. Heat the sunflower oil in a non-stick frying pan, and fry the burgers for 3 mins on each side until lightly golden. Serve with the toasted pitta bread, tomato salsa and green salad.",
                    "prep_time": "10 mins",
                    "cook_time": "6 mins"
                },
                {
                    "id": 57,
                    "name": "foolproof slow roast chicken",
                    "author": "good food team",
                    "rating": 5,
                    "vote_count": 238,
                    "url": "https://www.bbcgoodfood.com/recipes/foolproof-slow-roast-chicken",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-52090_11-61667fe.jpg",
                    "description": "Slow-roasting is a great way to keep chicken nice and moist. Adding the potatoes to the roasting tin infuses them with plenty of flavour, too",
                    "serves": 4,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Heat oven to 160C/fan 140C/gas 3. Brush a large roasting tin all over with butter and smear some over the skin of the chicken. Place the chicken in the tin and arrange the potatoes around it. Put the halved garlic heads in the tin, pour over the white wine and stock, then cover with foil and place in the oven. Cook for 1 hr then remove the foil and give the potatoes a shake. Add the herbs and lemon wedges, then cook uncovered for 50 mins. Turn the heat up to 220C/fan 200C/gas 7. Cook for 30 mins more, then remove the chicken and potatoes from the pan. Cover the chicken loosely with foil and leave to rest on a plate for at least 10 mins before carving. Keep the potatoes warm. Serve with any pan juices.",
                    "prep_time": "15 mins",
                    "cook_time": "2 hrs and 20 mins"
                },
                {
                    "id": 53,
                    "name": "sausage & pesto pizza",
                    "author": "esther clark",
                    "rating": 5,
                    "vote_count": 3,
                    "url": "https://www.bbcgoodfood.com/recipes/sausage-pesto-pizza",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/sausage-and-pesto-pizza-dbf1a0e.jpg",
                    "description": "Make these cheesy sausage and pesto pizzas with just a handful of ingredients for an easy, takeaway-style dinner. If you prefer, make these veggie-friendly using our tip below",
                    "serves": 4,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Remove the pizza dough from the freezer 1-2 hrs before cooking to defrost. Heat the oven to 220C/200C fan/gas 7. Put a large baking sheet in the oven to heat. Tip the chopped tomatoes into a saucepan, simmer uncovered for 15 mins until reduced and saucy, then season to taste. Squeeze the sausagemeat out of the skins and into a bowl. Divide into 10 small balls. Pour the oil into a non-stick frying pan and fry the meatballs over a medium heat for 5 mins until golden brown. Roll the dough out into two oval-shaped pizzas about 20cm long. Top with a layer of the tomato sauce, then swirl in the pesto. Tear the mozzarella and scatter that over along with the sausage meatballs. Slide the pizzas onto the hot baking sheet and cook for 18-20 mins or until crisp and charred at the edges. Scatter over a few basil leaves to serve, if you like.",
                    "prep_time": "20 mins",
                    "cook_time": "40 mins"
                }
            ]
        )
    });
});

describe("Recipe.getSavedRecipes", () => {
    test("get user's saved recipes", async () => {
        const savedRecipes = await Recipe.getSavedRecipes(6);
        expect(savedRecipes).toEqual(
            [
                {
                    "id": 14,
                    "name": "broccoli pasta salad with eggs & sunflower seeds",
                    "author": "good food team",
                    "rating": 4,
                    "vote_count": 5,
                    "url": "https://www.bbcgoodfood.com/recipes/broccoli-pasta-salad-eggs-sunflower-seeds",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/broccoli-pasta-salad-with-eggs-sunflower-seeds-758d30d.jpg",
                    "description": "Pack in protein, carbohydrate and vitamins with this broccoli, pasta and eggs dish, a healthy vegetarian lunch to keep you going on a busy afternoon",
                    "serves": 2,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Hard-boil the eggs for 8 mins, then shell and halve. Meanwhile, boil the pasta for 5 mins, add the broccoli and beans, and cook 5 mins more or until everything is tender. Drain, reserving the water, then tip the pasta and veg into a bowl and stir in the miso, ginger, oil and 4 tbsp pasta water. Serve topped with the eggs and seeds.",
                    "prep_time": "10 mins",
                    "cook_time": "10 mins"
                },
                {
                    "id": 120,
                    "name": "double bean & roasted pepper chilli",
                    "author": "sarah cook",
                    "rating": 5,
                    "vote_count": 290,
                    "url": "https://www.bbcgoodfood.com/recipes/double-bean-roasted-pepper-chilli",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chilli-16e065a.jpg",
                    "description": "This warming vegetarian chilli is a low-fat, healthy option that packs in the veggies and flavour. Serve with Tabasco sauce, soured cream or yoghurt.",
                    "serves": 8,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "dinner recipes",
                    "steps": "Put the onions, celery and chopped peppers with the oil in your largest flameproof casserole dish or heavy-based saucepan, and fry gently over a low heat until soft but not coloured. Drain both jars of peppers over a bowl to catch the juices. Put a quarter of the peppers into a food processor with the chipotle paste, vinegar, cocoa, dried spices and herbs. Whizz to a purée, then stir into the softened veg and cook for a few mins. Add the tomatoes and refried beans with 1 can water and the reserved pepper juice. Simmer for 1 hr until thickened, smoky and the tomato chunks have broken down to a smoother sauce. At this stage you can cool and chill the sauce if making ahead. Otherwise add the kidney and black beans, and the remaining roasted peppers, cut into bite-sized pieces, then reheat. (This makes a large batch, so once the sauce is ready it might be easier to split it between two pans when you add the beans and peppers.) Once bubbling and the beans are hot, season to taste and serve.",
                    "prep_time": "30 mins",
                    "cook_time": "1 hr and 15 mins"
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
                },
                {
                    "id": 63,
                    "name": "vegan kale pesto pasta",
                    "author": "tracey raye - health editor & nutritionist",
                    "rating": 5,
                    "vote_count": 21,
                    "url": "https://www.bbcgoodfood.com/recipes/vegan-kale-pesto-pasta",
                    "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/Kale-Pesto-df3faaf.jpg",
                    "description": "Whizz up kale, pumpkin seeds, basil and garlic to make this easy kale pesto. It's perfect stirred through wholemeal spaghetti for a healthy vegan meal",
                    "serves": 4,
                    "level": "easy",
                    "main_cat_name": "recipes",
                    "sub_cat_name": "lunch recipes",
                    "steps": "Bring a pan of water to the boil. Cook the kale for 30 secs, drain and transfer to a bowl of ice-cold water for 5 mins. Drain again and pat dry with kitchen paper. Put the basil, garlic, seeds, oil, nutritional yeast, lemon juice and zest, and drained kale in a food processor. Blitz until smooth, then season. Loosen with a splash of water, if it’s too thick. Cook the pasta following pack instructions, then toss with the pesto and serve.",
                    "prep_time": "10 mins",
                    "cook_time": "10 mins"
                }
            ]
        )
    });
});