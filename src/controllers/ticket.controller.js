const {
    contract
} = require("../config/blockchain.config")
const {
    ipfsAddFile,
    ipfsAddJson,
    ipfsGetData
} = require("../utils/ipfs.utils")
const fs = require("fs");


const raiseTicket = async (req, res) => {
    try {
            
            const ticket_info = {
                "userDetail":req.body.userDetail,
                "token_Id":req.body.token_Id,
                "reason":req.body.reason
            }
            
            const ticket_hash = await ipfsAddJson(ticket_info)


            const raiseTicketResponse = await contract.raiseTicket(
                req.body.productOwner,
                req.body.secret,
                ticket_hash.toString(),
		        process.env.TICKET_ADDRESS
            );
            const log = await raiseTicketResponse.wait()
            const transferEvent = log.events.filter(_e => _e.event == "Transfer")[0];
            return res.status(200).json({
                    ticketId: transferEvent.args[2].toString(),
                    message: "Ticket raised"
            })
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred"
        })
    }
}

module.exports={
    raiseTicket,
}
