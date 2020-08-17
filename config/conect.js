const mongoose = require("mongoose");
require("dotenv").config;

const db = mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,    
    useUnifiedTopology: true  
    },  () => console.log("Connected to the database!"))

module.exports = db;