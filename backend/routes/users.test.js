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

describe("/POST /users/register", () => {
    test("register user", async () => {
        // console.log("USER1TEST", usr1Test);
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password"
            });
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual([{
            "id": expect.any(Number),
		    "username": "dremon",
		    "first_name": "dremon",
		    "last_name": "Lokz",
		    "email": "dremon@g.com",
		    "phone": "813 507 4490",
		    "header_img": "testHeaderImage",
		    "profile_img": "testProfileImage",
		    "token": expect.any(String)
        }]);
    });

    test("400 error for registering user with is_admin", async () => {
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
                "is_admin": true,
		        "password": "password"
            });
        expect(req.statusCode).toBe(400);
    });

    test("400 error for registering user with wrong schema", async () => {
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": 8135074490,
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password"
            });
        expect(req.statusCode).toBe(400);
    });

    // test("error for is_admin", async () => {
    //     const req = await request(app).get(`/recipes/${5}`)
    //         .set("_token", `Bearer`);
    //     expect(req.statusCode).toBe(400);
    // });
});

describe("/POST /users/login", () => {
    test("login", async () => {
        const req = await request(app).post("/users/login")
            .send({
                "username": usr1Test.username,
                "password": "password1"
            });
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            { 
                user: {
                    "id": expect.any(Number),
                    "username": usr1Test.username,
                    "token": expect.any(String)
                }
            }
        ]);
    });

    test("400 error for logging in with invalid password", async () => {
        const req = await request(app).post("/users/login")
            .send({
                "username": usr1Test.username,
                "password": "wrongPassword"
            });
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:username", () => {
    test("get user", async () => {
        const req = await request(app)
            .get(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([{
            user: {
                "id": expect.any(Number),
                "username": usr1Test.username,
                "first_name": usr1Test.first_name,
                "last_name": usr1Test.last_name,
                "email": usr1Test.email,
                "is_admin": false,
                "phone": expect.any(String),
		        "header_img": null,
		        "profile_img": null
            }
        }]);
    });

    test("404 error for non exist user", async () => {
        const req = await request(app)
            .get(`/users/inVldUsr`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(404);
    });

    test("400 error for no token", async () => {
        const req = await request(app)
            .get(`/users/inVldUsr`)
        expect(req.statusCode).toBe(400);
    });
});

describe("/PATCH /users/:username", () => {
    test("edit user", async () => {
        const req = await request(app)
            .patch(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
            })
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([{
            user: {
                "id": expect.any(Number),
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
                "is_admin": false,
                "phone": expect.any(String),
		        "header_img": null,
		        "profile_img": null
            }
        }]);
    });

    test("400 error for editing is_admin", async () => {
        const req = await request(app)
            .patch(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
                "is_admin": true
            })
        expect(req.statusCode).toBe(400);
    });

    test("404 error for non exist user", async () => {
        const req = await request(app)
            .patch(`/users/inVldUsr`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com"
            })
        expect(req.statusCode).toBe(404);
    });
});

describe("/DELETE /users/:username", () => {
    test("delete user", async () => {
        const req = await request(app)
            .delete(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(200);
        const deletedUsr = await db.query(`
            SELECT * FROM users where username = '${usr1Test.username}'
        `);
        expect(deletedUsr.rows.length).toEqual(0);
    });

    test("404 error for deleting non exist user", async () => {
        const req = await request(app)
            .delete(`/users/inVldUsr`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(404);
    });
});