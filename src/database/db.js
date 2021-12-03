const mongoose = require("mongoose");



const DB = process.env.DATABASE
// const port = process.env.PORT

// const DB = "mongodb://localhost:27017/SeeBizDB"

mongoose.connect(DB)
.then(()=> {console.log("connection successfull...")})
.catch((err)=> {console.log("There is an Error")})