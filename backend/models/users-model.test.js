process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const User = require("./users.js");
const { genTestUsers } = require("../routes/_test-data.js");

let usr1Test;
let usr2Test;
let usr1TokenTest;
let usr2TokenTest;
let usr1IdTest;
let usr2IdTest;
let listId1Test;
let listId2Test;
let listId3Test;

beforeEach(async () => {
    const { 
			usr1, usr1Token, usr2, usr2Token,
			usr1Id, usr2Id, listId1, listId2,
			listId3
		} = await genTestUsers();
    usr1Test = {...usr1};
    usr2Test = {...usr2};
    usr1TokenTest = usr1Token;
    usr2TokenTest = usr2Token;
	usr1IdTest = usr1Id;
    usr2IdTest = usr2Id;
	listId1Test = listId1;
	listId2Test = listId2;
	listId3Test = listId3;
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("User", () => {
    test("User.register", async () => {
        const data = {
                "username": "newUsr",
		        "first_name": "newUsr",
		        "last_name": "Lokz",
		        "email": "newusr@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password4"
            };
        const user = await User.register(data);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": "newUsr",
		    "first_name": "newUsr",
		    "last_name": "Lokz",
		    "email": "newusr@g.com",
		    "phone": "813 507 4490",
		    "header_img": "testHeaderImage",
		    "profile_img": "testProfileImage",
		    "token": expect.any(String)
        });
    });

	test("User.login", async () => {
		const data = {
			username: usr1Test.username,
			password: "password1"
		}
        const user = await User.login(data);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": usr1Test.username,
		    "token": expect.any(String)
        });
    });

	test("User.getUser", async () => {
		const data = {
			username: usr1Test.username,
			password: "password1"
		}
        const user = await User.getUser(usr1Test.username);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": usr1Test.username,
		    "first_name": usr1Test.first_name,
		    "last_name": usr1Test.last_name,
		    "email": usr1Test.email,
			"is_admin": false,
		    "phone": usr1Test.phone,
		    "header_img": null,
		    "profile_img": null
        });
    });

	test("User.editUser", async () => {
		const data = {
			username: "usr1Test newUsrName",
			first_name: "usr1Test newFname"
		}
        const user = await User.editUser(data, usr1Test.username);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": "usr1Test newUsrName",
		    "first_name": "usr1Test newFname",
		    "last_name": usr1Test.last_name,
		    "email": usr1Test.email,
			"is_admin": false,
		    "phone": usr1Test.phone,
		    "header_img": null,
		    "profile_img": null
        });
    });

	test("User.deleteUser", async () => {
        await User.deleteUser(usr1Test.username);
        const usr = await db.query(`
			SELECT * FROM users WHERE username = '${usr1Test.username}'
		`);
		expect(usr.rows.length).toEqual(0);
    });
});

describe("User.getFavRecipes", () => {
    test("get user's fav recipes", async () => {
        const favRecipes = await User.getFavRecipes(usr1IdTest);
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

describe("User.getSavedRecipes", () => {
    test("get user's saved recipes", async () => {
        const savedRecipes = await User.getSavedRecipes(usr1IdTest);
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

describe("User.getRecipeLists", () => {
	test("get recipelists", async () => {
		const req = await User.getRecipeLists(usr1IdTest);
		expect(req).toEqual([
			{
				"id": expect.any(Number),
				"list_name": "weekly meals",
				"occasion": "meal prep"
			},
			{
				"id": expect.any(Number),
				"list_name": "rasta bash",
				"occasion": "party"
			}
		]);
	});

	test("404 error for not found user", async () => {
		await expect(async () => {
            await User.getRecipeLists(usr2IdTest + 1);
        }).rejects.toThrow(ExpressError);
	});
});

describe("User.getListRecipes", () => {
	test("get recipelists", async () => {
		const req = await User.getListRecipes(usr1IdTest, listId1Test);
		expect(req).toEqual([
			{
				"id": 450,
				"name": "sticky cinnamon figs",
				"author": "jane hornby",
				"rating": 5,
				"vote_count": 30,
				"url": "https://www.bbcgoodfood.com/recipes/sticky-cinnamon-figs",
				"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-339086_11-8e6b423.jpg",
				"description": "A simple and stylish nutty fig pudding ready in just 10 minutes",
				"serves": 4,
				"level": "easy",
				"main_cat_name": "recipes",
				"sub_cat_name": "desserts",
				"steps": "Heat grill to medium high. Cut a deep cross in the top of each fig then ease the top apart like a flower. Sit the figs in a baking dish and drop a small piece of the butter into the centre of each fruit. Drizzle the honey over the figs, then sprinkle with the nuts and spice. Grill for 5 mins until figs are softened and the honey and butter make a sticky sauce in the bottom of the dish. Serve warm, with dollops of mascarpone or yogurt.",
				"prep_time": "5 mins",
				"cook_time": "5 mins"
			},
			{
				"id": 460,
				"name": "apple flapjack crumble",
				"author": "mary cadogan",
				"rating": 5,
				"vote_count": 154,
				"url": "https://www.bbcgoodfood.com/recipes/apple-flapjack-crumble",
				"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1069547_10-f1dcd02.jpg",
				"description": "Sweetening the apples with apricot jam and orange juice makes it twice as fruity and adding a little syrup to the oaty crumble makes great little chewy clusters",
				"serves": 6,
				"level": "easy",
				"main_cat_name": "recipes",
				"sub_cat_name": "desserts",
				"steps": "Heat oven to 190C/fan 170C/gas 5. Peel, core and thinly slice the apples and mix with the jam and orange juice. Spread evenly over a buttered 1.5-litre ovenproof dish, not too deep. Mix the oats, flour and cinnamon in a large bowl. Add the butter in small chunks and rub in gently. Stir in the sugar and rub in again. Drizzle over the syrup, mixing with a knife so it forms small clumps. Sprinkle evenly over the apples and bake for 30-35 mins until the juices from the apples start to bubble up. Cool for 10 mins, then serve with custard, cream or ice cream.",
				"prep_time": "20 mins",
				"cook_time": "35 mins"
			}
		]);
	});

	test("404 error for not found user", async () => {
		await expect(async () => {
            await User.getListRecipes(usr2IdTest + 1, listId3Test);
        }).rejects.toThrow(ExpressError);
	});

	test("404 error for not found list", async () => {
		await expect(async () => {
            await User.getListRecipes(usr2IdTest, listId3Test + 1);
        }).rejects.toThrow(ExpressError);
	});
});