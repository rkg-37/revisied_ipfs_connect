const express = require("express");
const warrantyController = require("../controllers/warranty.controller");
const warrantyRouter = express.Router()

warrantyRouter.post("/create", warrantyController.CreateWarranty);
warrantyRouter.post("/startTransit");
warrantyRouter.post("/activateWarranty");
warrantyRouter.post("/:tokenId", warrantyController.FetchWarranty);

module.exports = {
    warrantyRouter,
}