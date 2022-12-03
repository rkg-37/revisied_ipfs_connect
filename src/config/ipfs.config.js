const ipfsClient = require("ipfs-http-client");

const ipfs = ipfsClient.create({
    host: process.env.IPFS_HOST,
    port: process.env.IPFS_PORT,
    protocol: process.env.IPFS_PROTOCOL,
});

module.exports = {
    ipfs,
}