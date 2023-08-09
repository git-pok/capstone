process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const SECRET_KEY = require("../keys.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ExpressError = require("../models/error.js");
const {
    BCRYPT_WORK_FACTOR,
} = require("../config.js");

const { } = require("../helpers/sql.js");
const { hashPassword } = require("../helpers/users.js");

// console.log("$#$#$#$#$ DB", db);
let usr1;
let usr2;
let usr2Token;

beforeEach(async () => {
    const pwd1 = hashPassword("password1");
    const pwd2 = hashPassword("password2");
    // const token1 = 
    usr1 = {
        username: "usr1",
		first_name: "usr1fn",
		last_name: "usr1ln",
		email: "usr1@g.com",
		phone: "813 507 4490",
        password: pwd1
    }

    usr2 = {
        username: "usr2",
		first_name: "usr2fn",
		last_name: "usr2ln",
		email: "usr2@g.com",
		phone: "813 507 4490",
        password: pwd2
    }
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("/recipes", () => {
    test("/GET", async () => {

    });
});