const ipfsClient = require("ipfs-http-client");

const ipfs = ipfsClient.create({
    // host: process.env.IPFS_HOST,
    // port: process.env.IPFS_PORT,
    // protocol: process.env.IPFS_PROTOCOL,
    url: process.env.IPFS_URL,
});

module.exports = {
    ipfs,
}