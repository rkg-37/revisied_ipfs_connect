const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const fs = require("fs");
const fileUpload = require("express-fileupload");
const util = require("util");

const { warrantyRouter} = require("./routes/warranty.route")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));

if (!fs.existsSync("./files")) {
    fs.mkdirSync("./files");
}

app.use("/warranty", warrantyRouter);
//app.use("/ticket")

app.listen(3000, "0.0.0.0", async () => {
    console.log("current public ip address : ", process.env.AWS_IP);
    console.log("server id listening at port 3000");
  }
);
