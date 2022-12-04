const express = require("express");
const userController = require("../controllers/user.controller")
const userRouter = express.Router();

userRouter.post("/getHash", userController.GetIPFSHash);

module.exports = {
    userRouter,
}