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