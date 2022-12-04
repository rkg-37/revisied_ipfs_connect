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
            "token_Id":req.body.token_Id
        }
        
        


        const raiseTicketResponse = await contract.raiseTicket(
            req.body.productOwner,
            req.body.secret,
            req.body.ticketDetails
        );

        // decode ipfs details
        let responseObject = {
            code: 200,
            result: {
                warrantyDetails: (await ipfsGetData(warranty[0])),
                customerDetails: (await ipfsGetData(warranty[1])),
                expiry_duration: warranty[2].toString(),
                startTime: warranty[3].toString(),
                endTime: warranty[4].toString(),
                tracking: warranty[5].map(async (_t) => {
                    return await ipfsGetData(_t)
                }),
                acitvity: warranty[6].map(async (_a) => {
                    return await ipfsGetData(_a)
                }),
                status: warranty[7],
                creationDate: (new Date(Number(warranty[8].toString()) * 1000))
            },
            message: "Warranty fetched!!!"
        }




        return res.status(200).json(responseObject);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error Occurred"
        })
    }
}