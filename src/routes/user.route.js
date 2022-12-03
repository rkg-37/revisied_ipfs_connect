const express = require("express");

const userRouter = express.Router();

userRouter.post("/signUp");

module.exports = {
    userRouter,
}