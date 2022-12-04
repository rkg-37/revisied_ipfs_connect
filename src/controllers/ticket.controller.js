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
                ticket_hash.toString()
            );
            const demo = await raiseTicketResponse.wait();

            console.log(demo.events);
        // decode ipfs details
        // let responseObject = {
        //     code: 200,
        //     result: {
        //         warrantyDetails: (await ipfsGetData(warranty[0])),
        //         customerDetails: (await ipfsGetData(warranty[1])),
        //         expiry_duration: warranty[2].toString(),
        //         startTime: warranty[3].toString(),
        //         endTime: warranty[4].toString(),
        //         tracking: warranty[5].map(async (_t) => {
        //             return await ipfsGetData(_t)
        //         }),
        //         acitvity: warranty[6].map(async (_a) => {
        //             return await ipfsGetData(_a)
        //         }),
        //         status: warranty[7],
        //         creationDate: (new Date(Number(warranty[8].toString()) * 1000))
        //     },
        //     message: "Warranty fetched!!!"
        // }




        return res.status(200).json({"data":raiseTicketResponse});
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