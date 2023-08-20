process.env.NODE_ENV = "test";
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const {
    defineProps, definePropsPure
} = require("./all-purpose.js");


let obj1 = {};

beforeEach(async () => {
    obj1.name = "dumplings";
    obj1.cat = "chineese"
});

afterEach(() => {
    delete obj1.name;
    delete obj1.cat;
});
// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});


describe("definePropsPure", () => {
    test("define props in empty object", () => {
        const propsArr = [["username", "biz"], ["first_name", "bizq"]];
        const newObj = definePropsPure(propsArr, {});
        expect(newObj).toEqual(
            {
                username: "biz", first_name: "bizq"
            }
        );
    });

    test("define props in object", () => {
        const propsArr = [["first_name", "bizq"], ["last_name", "dreco"]];
        const object = {
            name: "V", rating: 5,
            username: "vn", header_img: "img"
        };
        const newObj = definePropsPure(propsArr, object);
        expect(newObj).toEqual(
            {
                name: "V", rating: 5,
                username: "vn", header_img: "img",
                first_name: "bizq", last_name: "dreco"
            }
        );
    });
    
    test("error for non array in propsArr arg", () => {
        const propsArr = { name: "l", age: 8 };
        function error () {
            definePropsPure(propsArr, {});
        }
        expect(error).toThrow(ExpressError);
    });
});

describe("defineProps", () => {
    test("define props in empty object", () => {
        const obj = {};
        expect(obj.username).toEqual(undefined);
        expect(obj.first_name).toEqual(undefined);
        const propsArr = [["username", "biz"], ["first_name", "bizq"]];
        const newObj = defineProps(propsArr, obj);
        expect(newObj).toEqual(undefined);
        expect(obj.username).toEqual("biz");
        expect(obj.first_name).toEqual("bizq");
    });

    test("define props in empty object", () => {
        expect(obj1.username).toEqual(undefined);
        expect(obj1.first_name).toEqual(undefined);
        const propsArr = [["username", "biz"], ["first_name", "bizq"]];
        const newObj = defineProps(propsArr, obj1);
        expect(newObj).toEqual(undefined);
        expect(obj1.username).toEqual("biz");
        expect(obj1.first_name).toEqual("bizq");
    });
    
    test("error for non array in propsArr arg", () => {
        const propsArr = { name: "l", age: 8 };
        function error () {
            defineProps(propsArr, {});
        }
        expect(error).toThrow(ExpressError);
    });
});