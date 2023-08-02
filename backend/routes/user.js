const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/user.js");
/**
 * "/register"
 * Register route.
 * User registers
 */
router.post("/register", (req, res, next) => {
    try {
        const data = req.body;
        const isValid = User.register(data);
        return res.status(201).json({
            user: data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;