const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/users.js");
const { validateSchema, hashPassword } = require("../helpers/users.js");
const { isLoggedIn } = require("../middleware/auth.js");
/**
 * "/register"
 * route type: POST
 * Authorization: none
 * Returns object of submitted data,
 * and token
 */
router.post("/register", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.register(data);
        return res.status(201).json([
            user
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/login"
 * route type: POST
 * Authorization: none
 * Returns token.
 */
router.post("/login", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.login(data);
        return res.status(200).json([{ user }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:username"
 * route type: GET
 * Authorization: logged in
 * Returns user.
 */
router.get("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.getUser(username);
        return res.status(200).json([{
            user
        }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: PATCH
 * Authorization: logged in
 * Returns updated user data.
 */
router.patch("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const data = req.body;
        const user = await User.editUser(data, username);
        return res.status(200).json([
            {
                user
            }
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.deleteUser(username);
        return res.status(200).json([{
            message: `Deleted ${username}!`
        }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipes/favorites"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipes.
 */
router.get("/:id/recipes/favorites", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const favRecipes = await User.getFavRecipes(id);
        return res.status(200).json(favRecipes);
    } catch (err) {
        return next(err);
    }
})


module.exports = router;