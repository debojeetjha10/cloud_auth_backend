const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true)
require('dotenv').config();
const UserModel = require("./models/users");
const uuid4 = require('uuid').v4;
const JWT = require('jsonwebtoken');
const authenticateToken = require('./middlewares/authorizeToken');
const otpGenerator = require('./helpers/otpGenerator');
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const https = require('https')
const fs = require("fs");


mongoose.connect(process.env.MONGO_URI);
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello");
})

app.post("/createuser", async (req, res) => {
    try {
        const newUser = UserModel({
            id: req.body.id,
            password: req.body.password,
            key: uuid4()
        })
        await newUser.save();
        //console log the key
        console.log("NEW USER CREATED", newUser);
        qrcode.generate(newUser.key, { small: true },
            function (qrcode) { console.log(qrcode) });
        res.status(201);
        res.send({ key: newUser.key });
    } catch (err) {
        console.log(err.message);
        res.status(500);
        res.send(err.message);
    }
})

app.post('/login', async (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.status(401).send("NO CREDENTIALS FOUND");
    }
    try {

        const user = await UserModel.findOne({
            id: req.body.id
        })
        if (!user) {
            res.sendStatus(401);
            return;
        }

        if (req.body.password !== user.password) {
            res.sendStatus(401);
            return;
        }

        const token = JWT.sign(
            {
                id: user.id,
                key: user.key
            },
            process.env.JWT_KEY,
            { expiresIn: '5m' }
        )

        res.json({ token: token })
    } catch (err) {
        console.log(err.message);
        res.statusCode = 500;
        res.send(err.message ?? err.msg)
    }
})

app.post("/verifyotp", authenticateToken, (req, res) => {
    try {
        const otpFromServer = otpGenerator(req.user.key);
        if (otpFromServer === req.body.otp) res.sendStatus(200);
        else res.sendStatus(401);

    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
})

// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};
  
// Creating https server by passing
// options and app object
https.createServer(options, app)
.listen(3000, function (req, res) {
  console.log("Server started at port 3000");
});