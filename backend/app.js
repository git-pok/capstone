const express = require("express");
const app = express();

/**
 * "/"
 * Test route to verify request works.
 */
app.get("/", (req, res) => {
    return res.status(200).json({
        msg: "HOME ROUTE!"
    });
});

module.exports = app;