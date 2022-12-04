const { ipfs } = require("../config/ipfs.config")
const fs = require("fs");
const axios = require("axios");

// adding images
const ipfsAddFile = async function (fileName, filePath) {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    const formatedFileHash = `${process.env.IPFS_GET_URL}/${fileAdded.cid.toString()}`
    return formatedFileHash;
}
// upload json format data
const ipfsAddJson = async function(input) {
    return (await ipfs.add(Buffer.from(JSON.stringify(input)))).cid;
}

const ipfsGetData = async (hash) => {
    return (await axios({
        method: "get",
        url: `${process.env.IPFS_GET_URL}/${hash}`
    })).data;
}

module.exports = {
    ipfsAddFile,
    ipfsAddJson,
    ipfsGetData,
}
