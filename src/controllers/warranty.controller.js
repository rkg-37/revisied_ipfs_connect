const express = require("express");
const { contract } = require("../config/blockchain.config")
const { ipfsAddFile, ipfsAddJson } = require("../utils/ipfs.utils")
const fs = require("fs");
const axios = require('axios');
const {Warranty} = require("../models/warranty.model");

const CreateWarranty = async (req, res) => {
    const file = req.files.file;
    const fileName = req.files.file.name;
    const product_id = req.body.product_id;
    const product_name = req.body.product_name;
    const product_desc = req.body.product_desc;
    const product_price = req.body.product_price;

    const warranty_secretkey = req.body.warranty_secretkey;
    const expiry_duration = req.body.expiry_duration;
    const warranty_name = req.body.warranty_name;
    const warranty_desc = req.body.warranty_desc;

    const customer_name = req.body.customer_name;
    const customer_email = req.body.customer_email;
    const customer_phone = req.body.customer_phone;
    const customer_address = req.body.customer_address;

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
        const prod = {
            Product: {
            product_id: product_id,
            product_name: product_name,
            product_desc: product_desc,
            product_price: product_price,
            product_image_hash: fileHash.toString(),
            },
            warranty: {
            warranty_secretkey: warranty_secretkey,
            warranty_name: warranty_name,
            warranty_desc: warranty_desc,
            expiry_duration: expiry_duration,
            },
        };
        const customer = {
            customer: {
            customer_name: customer_name,
            customer_email: customer_email,
            customer_phone: customer_phone,
            customer_address: customer_address,
            },
        };
        let prodHash, cust_hash;
        try {
            prodHash = await ipfsAddJson(prod);
            cust_hash = await ipfsAddJson(customer);
        } catch(err) {
            console.log(err);
            return res.status(500).json({
                message: "IPFS ERROR!!!"
            })
        }
        

        try {
            const txnReceipt = await contract.createWarranty(
                req.body.client_wallet_address,
                req.body.client_secret_key,
                prodHash.toString(),
                cust_hash.toString(),
                Number(req.body.expiry_duration),
            )

            const log = await txnReceipt.wait()
            const transferEvent = log.events.filter( _e => _e.event == "Transfer" )[0];
	    return res.status(200).json({ tokenId: transferEvent.args[2].toString(), message: "Product added"})
        } catch(err) {
            console.log(err);
            return res.status(500).json({
                message: "BLOCKCHAIN ERROR!!!",
            })
        }
        
    });
}

const FetchWarranty = async (req, res) => {
    try{
        const warranty = await contract.getWarrantyDetails(
            req.body.productOwner,
            req.body.secret,
            Number(req.params.tokenId)
        );

        console.log(warranty);
        // decode ipfs details
        const response = await axios({
            method: "get",
            url: `http://${process.env.AWS_IP}/ipfs/${warranty}`
        });
        if (response.status == 200) {
            console.log("Success:", response.data);
            Warranty.warrantyDetails = response.data.warrantyDetails,
            Warranty.customer= response.data.customer,
            Warranty.expiryDuration= response.data.expiryDuration,
            Warranty.startTime = response.data.startTime,
            Warranty.endTime = response.data.endTime,
            Warranty.tracking = response.data.tracking,
            Warranty.activity = response.data.activity,
            Warranty.status = response.data.status,
            Warranty.creationDate =  response.data.creationDate
        }

        
        return res.status(200).json({ message: "lets see"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Error Occurred"})
    }
}

const StartWarranty = async (req, res) => {
    try{
        const txnReceipt = await contract.startTracking(
            req.body.productOwner,
            req.body.secret,
            req.body.token,
        );

        await txnReceipt.wait();

        return res.status(200).json({ message: "Tracking on this token started!!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Error occured!!"});
    }
}

const AddTrackingData = async (req, res) => {
    try{

        const token_id = req.body.token_id;
        const company_officer = req.body.officer;
        const company_location = req.body.location;

        const txnReceipt = await contract.addTrackingData(
            req.body.productOwner,
            req.body.secret,
            req.body.tokenId,

        )
    } catch(err) {
        
    }
}

module.exports = {
    CreateWarranty,
    FetchWarranty,
}


