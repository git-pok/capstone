const express = require("express");
const router = new express.Router();

/**
 * "/register"
 * Register route.
 * User registers
 */
app.get("/", (req, res) => {
    return res.status(200).json({
        msg: "HOME ROUTE!"
    });
});

/**
 * Bad Request Error Handler
 */
app.use((error, req, res, next) => {
    const err = new ExpressError(404, "Page not found!");
    next(err);
})


/**
 * Error Handler
 */
app.use((error, req, res) => {
    const statusCode = error.status || 400;
    const msg = error.msg || error;
    return res.status(statusCode).json({
        error: {
            statusCode,
            message: msg
        }
    });
})

module.exports = app;