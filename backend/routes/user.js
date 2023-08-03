const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/user.js");
const { validateSchema, hashPassword } = require("../helpers/user.js");
/**
 * "/register"
 * Authorization: none
 * Returns object of submitted data,
 * and token
 */
router.post("/register", async (req, res, next) => {
    try {
        const data = req.body;
        const registeredUser = await User.register(data);
        return res.status(201).json({
            user: registeredUser
        });
    } catch (err) {
        return next(err);
    }
});

/**
 * "/login"
 * Authorization: none
 * Returns token.
 */
router.post("/login", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.login(data);
        return res.status(200).json({
            user
        });
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
router.get("/:username", async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.getUser(username);
        return res.status(200).json({
            user
        });
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
router.patch("/:username", async (req, res, next) => {
    try {
        const { username } = req.params;
        const data = req.body;
        const user = await User.editUser(data, username);
        return res.status(200).json({
            user
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;