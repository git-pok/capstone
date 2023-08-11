process.env.NODE_ENV = "test";
const { db } = require("../config.js");
const SECRET_KEY = require("../keys.js");
const {
    validateSchema, hashPassword, generateToken,
    decodeToken, verifyPassword
} = require("../helpers/users.js");
const ExpressError = require("../models/error.js");
const {
    BCRYPT_WORK_FACTOR,
} = require("../config.js");


let usr1;
let usr2;
let usr1Token;
let usr2Token;

async function genTestUsers () {
    const pwd1 = await hashPassword("password1");
    const pwd2 = await hashPassword("password2");

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
    const usr1Res = await db.query(`
        INSERT INTO users (username, first_name, last_name, email, phone, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, id`,
        ["usr1", "usr1fn", "usr1ln", "usr1@g.com", "813 507 4490", pwd1]
    );

    const usr2Res = await db.query(`
        INSERT INTO users (username, first_name, last_name, email, phone, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, id`,
        ["usr2", "usr2fn", "usr2ln", "usr2@g.com", "813 507 4490", pwd2]
    );

    usr1Token = generateToken(usr1Res.rows[0], SECRET_KEY);
    usr2Token = generateToken(usr2Res.rows[0], SECRET_KEY);
    
    const usr1Id = usr1Res.rows[0].id;
    const usr2Id = usr2Res.rows[0].id;
    await db.query(`
        INSERT INTO favorite_recipes (user_id, recipe_id)
        VALUES ($1, $2), ($3, $4)`,
        [usr1Id, 6, usr1Id, 100]
    );

    await db.query(`
        INSERT INTO saved_recipes (user_id, recipe_id)
        VALUES ($1, $2), ($3, $4)`,
        [usr1Id, 300, usr1Id, 400]
    );

    return {
        usr1,
        usr1Token,
        usr2,
        usr2Token,
        usr1Id,
        usr2Id
    };
}


module.exports = {
    genTestUsers
}