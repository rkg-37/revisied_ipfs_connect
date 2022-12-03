const { contract } = require("../config/blockchain.config")
const { ipfsAddFile, ipfsAddJson } = require("../utils/ipfs.utils")
const fs = require("fs");

const GetIPFSHash = async (req, res) => {
    const file = req.files.file;
    const fileName = req.files.file.name;
    const filePath = "files/" + fileName;

    file.mv(filePath, async (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        const fileHash = await ipfsAddFile(fileName, filePath);
        fs.unlink(filePath, async (err) => {
            if (err) {
            console.log(err);
            }
        });
        const User = {
            company_name : req.body.company_name,
            company_contact: req.body.company_contact,
            company_addr: req.body.company_addr,
            company_pic: fileHash.toString(),
            company_email: req.body.company_email,
            company_registration_number : req.body.company_registration_number
        }
        let userHash;
        try {
            userHash = await ipfsAddJson(prod);
            return res.status(200).json({ userHash: userHash.toString()})
        } catch(err) {
            console.log(err);
            return res.status(500).json({
                message: "IPFS ERROR!!!"
            })
        }
        
    });
}

module.exports = {
    GetIPFSHash,
}
