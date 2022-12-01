const ipfsClient = require("ipfs-http-client");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const { ethers } = require("ethers");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const CONFIG = require("./config.json");
const ipfs = ipfsClient.create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));

if (!fs.existsSync("./files")) {
  fs.mkdirSync("./files");
}

let ip = CONFIG.aws_ip;
async function ip_extractor() {
  const { stdout } = await exec("curl ifconfig.me");
  return stdout.trim();
}

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/upload", (req, res) => {
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

  const filePath = "files/" + fileName;

  let responseObject = null;
  file.mv(filePath, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    const fileHash = await addFile(fileName, filePath);
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
    const finalHash = await AddingJson(prod);
    console.log(fileName, finalHash.toString());
    responseObject = {
      fileName: fileName,
      finalHash: finalHash.toString(),
    };
    return res.status(200).json(responseObject);
  });
});

app.get("/token_burn", (req, res) => {
  const token_id = req.query.token_id;
  try {
    // console.log(req.ip);
    execute(token_id);
    return res.status(200);
  } catch (err) {
    console.log("error occurred", err);
    return res.status(500);
  }
});

// company register details
app.post("/company_signup", (req, res) => {
  const name = req.body.company_name;
  const email = req.body.company_email;
  const phone = req.body.company_phone;
  const address = req.body.company_address;
  const city = req.body.company_city;
  const state = req.body.company_state;
  const registration_number = req.body.company_registration_number;

  (async function calling_addjson() {
    const responseObject = {
      company_name: name,
      company_email: email,
      company_phone: phone,
      company_address: address,
      company_city: city,
      company_state: state,
      company_registration_number: registration_number,
    };

    let resObject = null;
    const company_hash = await AddingJson(responseObject);
    console.log(responseObject);
    resObject = {
      company_hash: company_hash.toString(),
    };
    return res.status(200).json(resObject);
  })();
});

// company register details
app.post("/tracking", (req, res) => {
  const token_id = req.body.token_id;
  const company_officer = req.body.officer;
  const company_location = req.body.location;

  (async function calling_addjson() {
    const responseObject = {
      token_id: token_id,
      company_officer: company_officer,
      company_location: company_location,
    };

    const hash = await AddingJson(responseObject);
    const resObject = {
      hash: hash.toString(),
    };
    return res.status(200).json(resObject);
  })();
});

app.post("/activity_entry", (req, res) => {
  const purpose = req.body.purpose;
  const comment = req.body.comment;
  const officer = req.body.officer;

  (async function calling_addjson() {
    const responseObject = {
      purpose: purpose,
      comment: comment,
      officer: officer,
    };

    const hash = await AddingJson(responseObject);
    const resObject = {
      hash: hash.toString(),
    };
    return res.status(200).json(resObject);
  })();
});

app.post("/master_upload", (req, res) => {
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

  let responseObject = null;
  file.mv(filePath, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    const fileHash = await addFile(fileName, filePath);
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
    const finalHash = await AddingJson(prod);
    const cust_hash = await AddingJson(customer);
    console.log(fileName, finalHash.toString());
    responseObject = {
      fileName: fileName,
      finalHash: finalHash.toString(),
      customer_hash: cust_hash,
    };
    return res.status(200).json(responseObject);
  });
});

// port route
app.listen(3000, "0.0.0.0", async () => {
  ip = await ip_extractor();
  console.log("current public ip address : ", ip);
  console.log("server id listening at port 3000");
});

// methods

// // random api-key generation for company
async function api_secret(size) {
  let result = [];
  let hexRef = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return result.join("").toString();
}

// adding images
async function addFile(fileName, filePath) {
  const file = fs.readFileSync(filePath);
  const fileAdded = await ipfs.add({ path: fileName, content: file });
  return fileAdded.cid;
}
// upload json format data
async function AddingJson(input) {
  return (await ipfs.add(Buffer.from(JSON.stringify(input)))).cid;
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("We are in!!");
    await ethereum.request({ method: "eth_requestAccounts" });
  }
}

async function execute(token_burn) {
  const contractAddress = CONFIG.contractAddress;
  let rawdata = fs.readFileSync("public/contract_abi.json");
  let abi = JSON.parse(rawdata);
  const provider = new ethers.providers.JsonRpcProvider(
    `http://${ip}/blockchain`
  );
  const signer = provider.getSigner(CONFIG.signer);
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const token_burn_response = await contract.burnExpiredToken(token_burn);
  console.log(token_burn_response);
}
