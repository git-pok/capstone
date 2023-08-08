process.env.NODE_ENV = "test";
// const request = require("supertest");
// const app = require("../app.js");
const { db } = require("../config.js");
// const SECRET_KEY = require("../keys.js");
// const ExpressError = require("../models/error.js");
// const {
//     BCRYPT_WORK_FACTOR,
// } = require("../config.js");

const {
    arrayConcat, genJoinSql, qryObjToOrderBySql,
    genSql, genWhereSqlArr,
} = require("../helpers/sql.js");

// beforeEach(() => {

// })

// afterEach(() => {
    
// })
// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});

// console.log("BCRYPT_WORK_FACTOR", BCRYPT_WORK_FACTOR);
// console.log("SECRET_KEY", SECRET_KEY);
// console.log("app", app);
// console.log("request", request);
const array1 = ["SELECT name FROM recipes", "WHERE name = 'chicken'"];
const array2 = ["SELECT rating FROM ratings", "WHERE rating =", 1];
describe("arrayConcat", () => {
    test("concat array of strings", () => {
        const concatedArr = arrayConcat(array1);
        expect(concatedArr).toEqual(
            "SELECT name FROM recipes WHERE name = 'chicken'"
        );
    });
    test("concat array of strings and numbers", () => {
        const concatedArr = arrayConcat(array2);
        expect(concatedArr).toEqual(
            "SELECT rating FROM ratings WHERE rating = 1"
        );
    });

    test("error for object", () => {
        function errorConcat() {
            arrayConcat({one: 1});
        }
        expect(errorConcat).toThrow(ExpressError);
        // expect(() => {
        //     arrayConcat(array1, array2);
        // }).toThrow();
    });
});

describe("genJoinSql", () => {
    test("create join sql", () => {
        const joinArr = [
            ["authors", "author_id", "id"],
            ["ratings", "rating_id", "id"]
        ];
        const joinSql = genJoinSql("r.", joinArr, "JOIN");
        expect(joinSql).toEqual(
            "JOIN authors a ON r.author_id = a.id JOIN ratings rt ON r.rating_id = rt.id"
        );
    });

    test("error for object", () => {
        function errorJoin() {
            genJoinSql("r.", {one: 1}, "JOIN");
        }
        expect(errorJoin).toThrow(ExpressError);
    });

    test("error for string", () => {
        function errorJoin() {
            genJoinSql("r.", "string", "JOIN");
        }
        expect(errorJoin).toThrow(ExpressError);
    });
});

describe("qryObjToOrderBySql", () => {
    test("create order by with orderBy param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name"
        );
    });

    test("create order by with orderBy/chronOrder param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name", chronOrder: "asc"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name ASC"
        );
    });

    test("create order by with orderBy/orderBy2/chronOrder param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name", orderBy2: "rating",
            chronOrder: "asc"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name, rt.rating ASC"
        );
    });

    test("receive empty string for non exist params", () => {
        const qry = {
            nonExist: "testAuth", nonExist2: "testNm"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            ""
        );
    });
});

describe("genSql", () => {
    test("create select sql", () => {
        const data = [
            "first_name", "last_name", "age"
        ];
        const selectSql = genSql("select", "users", data);
        expect(selectSql).toEqual({
            sql: "SELECT first_name, last_name, age FROM users",
            values: []
        });
    });

    test("create strict update sql with no returning", () => {
        const data = { first_name: "fvin2", last_name: "I2" };
        const selectSql = genSql("update", "users", data, true);
        expect(selectSql).toEqual({
            sql: "UPDATE users SET first_name = $1, last_name = $2",
            values: ["fvin2", "I2" ]
        });
    });

    test("create strict update sql with returning", () => {
        const data = { first_name: "fvin2", last_name: "I2" };
        const returning2 = [ "first_name", "last_name" ];
        const selectSql = genSql("update", "users", data, true, returning2);
        expect(selectSql).toEqual({
            sql: "UPDATE users SET first_name = $1, last_name = $2 RETURNING first_name, last_name",
            values: ["fvin2", "I2" ]
        });
    });

    test("create strict insert sql with returning and all caps argument", () => {
        const data = { first_name: "fvin2", last_name: "I2" };
        const returning2 = [ "first_name", "last_name" ];
        const selectSql = genSql("INSERT", "users", data, true, returning2);
        expect(selectSql).toEqual({
            sql: "INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING first_name, last_name",
            values: ["fvin2", "I2" ]
        });
    });

    test("error for invalid qryType", () => {
        const data = { first_name: "fvin2", last_name: "I2" };
        function errorGenSql() {
            genSql("notallowed", "users", data, true);
        }
        expect(errorGenSql).toThrow(ExpressError);
    });
});

describe("genWhereSqlArr", () => {
    test("case insensitive where qry", () => {
        const columnValObj = {
            name: "chicken", full_name: "lu",
        };
        const selectSql = genWhereSqlArr(columnValObj, 1);
        expect(selectSql).toEqual({
            whereSql: "WHERE name ILIKE $1 AND full_name ILIKE $2",
            values: ["%chicken%", "%lu%"]
        });
    });

    test("exact values where qry", () => {
        const columnValObj = {
            name: "chicken", full_name: "lu",
            rating: 5
        };
        const selectSql = genWhereSqlArr(columnValObj, 1, true);
        expect(selectSql).toEqual({
            whereSql: "WHERE name = $1 AND full_name = $2 AND rating = $3",
            values: ["chicken", "lu", 5]
        });
    });

    test("exact values with table abreviations", () => {
        const columnValObj = {
            name: "chicken", full_name: "lu",
            rating: 5
        };
        const selectSql = genWhereSqlArr(columnValObj, 1, true, false, true);
        expect(selectSql).toEqual({
            whereSql: "WHERE r.name = $1 AND a.full_name = $2 AND rt.rating = $3",
            values: ["chicken", "lu", 5]
        });
    });
});
