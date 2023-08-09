process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const { genTestUsers } = require("./_test-data.js");

let usr1Test;
let usr2Test;
let usr1TokenTest;
let usr2TokenTest;

beforeEach(async () => {
    const { usr1, usr1Token, usr2, usr2Token } = await genTestUsers();
    usr1Test = {...usr1};
    usr2Test = {...usr2};
    usr1TokenTest = usr1Token;
    usr2TokenTest = usr2Token;
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("/GET /recipes/:id", () => {
    test("get recipe", async () => {
        const req = await request(app).get(`/recipes/${5}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toEqual(1);
        expect(req.body[0].id).toEqual(5);
        expect(req.body).toEqual([{
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
		    "cook_time": "6 mins",
		    "liked_user_ids": [],
		    "disliked_user_ids": []
        }]);
    });

    test("400 error for non logged in user", async () => {
        const req = await request(app).get(`/recipes/${5}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /recipes", () => {
    test("get recipes no filters", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toEqual(1686);
        expect(req.body[0].id).toEqual(expect.any(Number));
        expect(req.body[0].name).toEqual(expect.any(String));
        expect(req.body[0].name).toEqual(expect.any(String));
        expect(req.body[0].description).toEqual(expect.any(String));
        expect(req.body[0].author).toEqual(expect.any(String));
    });

    test("get recipes with name filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ name: "chicken" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].name).toContain("chicken");
        expect(req.body[1].name).toContain("chicken");
        expect(req.body[req.body.length - 1].name).toContain("chicken");
    });

    test("get recipes with orderBy filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ orderBy: "rating" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].rating).toEqual(1);
    });

    test("get recipes with orderBy/chronOrder filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ orderBy: "rating", chronOrder: "desc" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].rating).toEqual(5);
    });

    test("400 error for non logged in user", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer`)
            .query({ orderBy: "rating", chronOrder: "desc" });
        expect(req.statusCode).toBe(400);
    });
});