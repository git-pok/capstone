const express = require("express");
const ExpressError = require("./models/error.js");
const userRoutes = require("./routes/user.js");

const app = express();

app.use(express.json());
app.use("/user", userRoutes);

/**
 * "/"
 * Test route to verify request works.
 */
// app.get("/", (req, res) => {
//     return res.status(200).json({
//         msg: "HOME ROUTE!"
//     });
// });

/**
 * Bad Request Error Handler
 */
app.use((req, res, next) => {
    const err = new ExpressError(404, "Page not found!");
    return next(err);
})


/**
 * Error Handler
 */
app.use((error, req, res, next) => {
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