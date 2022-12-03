const express = require("express");
const warrantyController = require("../controllers/warranty.controller");
const warrantyRouter = express.Router()

warrantyRouter.post("/create", warrantyController.CreateWarranty);
warrantyRouter.post("/startTransit");
warrantyRouter.post("/addTrackingData");
warrantyRouter.post("/reachedDestination");
warrantyRouter.post("/addActivity");
warrantyRouter.post("/:tokenId", warrantyController.FetchWarranty);

module.exports = {
    warrantyRouter,
}