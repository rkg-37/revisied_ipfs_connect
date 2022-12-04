const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const ticketRouter = express.Router()

ticketRouter.post("/raiseTicket",ticketController.raiseTicket);
// ticketRouter.post("/assignTicket",ticketController);
// ticketRouter.post("/closeTicket",ticketController);

module.exports = {
    ticketRouter,
}