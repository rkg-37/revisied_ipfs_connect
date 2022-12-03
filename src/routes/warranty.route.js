const express = require("express");
const warrantyController = require("../controller/warranty.controller");
const warrantyRouter = express.Router()

warrantyRouter.post("/create", warrantyController.CreateWarranty);
warrantyRouter.post("/transitDetails");
warrantyRouter.put("/activateWarranty");
warrantyRouter.get("/:tokenId");

module.exports = {
    warrantyRouter,
}