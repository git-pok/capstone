const express = require("express");
const app = express();

app.use(express.json());

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