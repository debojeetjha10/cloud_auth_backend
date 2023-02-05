const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true)
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);
const app = express();

app.get("/", (req, res) => {
    res.send("Hello");
})



app.listen(8080, () => {
    console.log("Server is running on PORT: ", process.env.PORT)
})