const { ipfs } = require("../config/ipfs.config")
const fs = require("fs");

// adding images
const ipfsAddFile = async function (fileName, filePath) {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    return fileAdded.cid;
}
// upload json format data
const ipfsAddJson = async function(input) {
    return (await ipfs.add(Buffer.from(JSON.stringify(input)))).cid;
}

module.exports = {
    ipfsAddFile,
    ipfsAddJson,
}
