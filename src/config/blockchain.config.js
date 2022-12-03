const { ethers } = require("ethers");

const rawdata = fs.readFileSync("public/contract_abi.json");
const abi = JSON.parse(rawdata);
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
const signer = provider.getSigner(process.env.WALLET)
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

module.exports = {
    contract
}



