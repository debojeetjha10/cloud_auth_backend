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
        if (!user) res.sendStatus(401);

        if (req.body.password !== user.password) {
            res.sendStatus(401);
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
        res.status(500).send(err.message);
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

app.listen(process.env.PORT, () => {
    console.log("Server is running on PORT: ", process.env.PORT)
})