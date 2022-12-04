const {
    contract,
    ticket_contract
} = require("../config/blockchain.config");
const {
    ipfsAddFile,
    ipfsAddJson,
    ipfsGetData,
} = require("../utils/ipfs.utils");
const fs = require("fs");

const raiseTicket = async (req, res) => {
    try {
        //check User Credentials
        const checkCreds = await contract.checkingCreds(
            req.body.productOwner,
            req.body.secretKey,
        );
        if (!checkCreds) {
            return res.status(401).json({
                message: "Unauthorised!!"
            });
        }

        const ticket_info = {
            userDetail: req.body.userDetail,
            warranty_token_id: req.body.warranty_token_id,
            reason: req.body.reason,
        };

        const ticket_hash = await ipfsAddJson(ticket_info);

        const raiseTicketResponse = await ticket_contract.createTicket(
            req.body.productOwner,
            ticket_hash.toString(),
        );
        const log = await raiseTicketResponse.wait();
        const transferEvent = log.events.filter((_e) => _e.event == "Transfer")[0];
        return res.status(200).json({
            ticketId: transferEvent.args[2].toString(),
            message: "Ticket raised",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred",
        });
    }
};

const assignTicket = async (req, res) => {
    try {

        //check User Credentials
        const checkCreds = await contract.checkingCreds(
            req.body.productOwner,
            req.body.secretKey,
        );
        if (!checkCreds) {
            return res.status(401).json({
                message: "Unauthorised!!"
            });
        }

        const officer_details = {
            userName: req.body.officer_name,
            UserId: req.body.officer_id,
        };

        const officer_hash = await ipfsAddJson(officer_details);

        const assignTicketResponse = await ticket_contract.assignTicket(
            req.body.productOwner,
            req.body.ticketId,
            officer_hash.toString(),
        );

        console.log(assignTicketResponse);

        return res.status(200).json({
            message: "Officer Assigned"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred",
        });
    }
};

const closeTicket = async (req, res) => {
    try {
        //check User Credentials
        const checkCreds = await contract.checkingCreds(
            req.body.productOwner,
            req.body.secretKey,
        );
        if (!checkCreds) {
            return res.status(401).json({
                message: "Unauthorised!!"
            });
        }

        const closeTicketResponse = await ticket_contract.burnTicket(
            req.body.productOwner,
            req.body.ticketId,
        );

        // const log = await closeTicketResponse.wait();

        return res.status(200).json({
            message: "Ticket closed",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred",
        });
    }
};

const getTicketDetails = async (req, res) => {
    try {
        //check User Credentials
        const checkCreds = await contract.checkingCreds(
            req.body.productOwner,
            req.body.secretKey,
        );
        if (!checkCreds) {
            return res.status(401).json({
                message: "Unauthorised!!"
            });
        }

        const Response = await contract.getTicket(
            req.body.productOwner,
            req.body.ticketId,
        );

        console.log(Response);
        return res.status(200);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred",
        });
    }
};

const addComment = async (req, res) => {
    try {

        //check User Credentials
        const checkCreds = await contract.checkingCreds(
            req.body.productOwner,
            req.body.secretKey,
        );
        if (!checkCreds) {
            return res.status(401).json({
                message: "Unauthorised!!"
            });
        }

        const comment = {
            comment: req.body.comment,
        };

        const comment_hash = await ipfsAddJson(comment);

        const assignTicketResponse = await ticket_contract.addComment(
            req.body.productOwner,
            req.body.ticketId,
            comment_hash.toString(),
        );

        return res.status(200).json({
            message: "Comment added."
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred",
        });
    }
}

module.exports = {
    raiseTicket,
    assignTicket,
    closeTicket,
    getTicketDetails,
    addComment,
};