const { ethers } = require("ethers");
const fs = require("fs");

const rawdata = fs.readFileSync("public/contract_abi.json");
const rawTicketData = fs.readFileSync("public/ticket_abi.json");
const abi = JSON.parse(rawdata);
const tickat_abi = JSON.parse(rawTicketData);
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
const signer = provider.getSigner(process.env.WALLET)
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);
const ticket_contract = new ethers.Contract(process.env.TICKET_ADDRESS, tickat_abi, signer);

module.exports = {
    contract,
    ticket_contract
}



