const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const Recipe = require("../models/recipes.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { isFilter } = require("../helpers/recipes.js");

/**
 * "/:id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe.
 */
router.get("/:id", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.getRecipe(id);
        return res.status(200).json([
            recipe
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/"
 * route type: GET
 * Authorization: logged in
 * Returns recipes.
 */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const qry = req.query;
        const filterExists = isFilter(qry);
        const recipes = filterExists ? await Recipe.recipesFilter(qry) : await Recipe.getRecipes();
        return res.status(200).json(
            recipes
        );
    } catch (err) {
        return next(err);
    }
});

/**
 * "/register"
 * route type: POST
 * Authorization: none
 * Returns object of submitted data,
 * and token
 */
// router.post("/register", async (req, res, next) => {
//     try {
//         const data = req.body;
//         const registeredUser = await User.register(data);
//         return res.status(201).json({
//             user: registeredUser
//         });
//     } catch (err) {
//         return next(err);
//     }
// });

/**
 * "/login"
 * route type: POST
 * Authorization: none
 * Returns token.
 */
// router.post("/login", async (req, res, next) => {
//     try {
//         const data = req.body;
//         const user = await User.login(data);
//         return res.status(200).json({
//             user
//         });
//     } catch (err) {
//         return next(err);
//     }
// });


/**
 * "/username"
 * route type: PATCH
 * Authorization: logged in
 * Returns updated user data.
 */
// router.patch("/:username", isLoggedIn, async (req, res, next) => {
//     try {
//         const { username } = req.params;
//         const data = req.body;
//         const user = await User.editUser(data, username);
//         return res.status(200).json({
//             user
//         });
//     } catch (err) {
//         return next(err);
//     }
// });

/**
 * "/username"
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
// router.delete("/:username", isLoggedIn, async (req, res, next) => {
//     try {
//         const { username } = req.params;
//         const user = await User.deleteUser(username);
//         return res.status(200).json([{
//             message: `Deleted ${username}!`
//         }]);
//     } catch (err) {
//         return next(err);
//     }
// });


module.exports = router;