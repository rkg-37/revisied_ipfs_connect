const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const ticketRouter = express.Router()

ticketRouter.post("/raiseTicket",ticketController.raiseTicket);
ticketRouter.post("/assignTicket",ticketController.assignTicket);
// ticketRouter.post("/closeTicket",ticketController.closeTicket);

module.exports = {
    ticketRouter,
}