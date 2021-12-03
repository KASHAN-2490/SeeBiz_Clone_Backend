// const dotenv = require("dotenv");
const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');

// const jwt = require("jsonwebtoken")

const schema = new mongoose.Schema({

    username : {
        type: String,
        required: true,
        // unique: true
    },
    email : {
        type: String,
        required: true,
        // unique: true
    },
    password : {
        type: String,
        required: true
    },
    checkbox : {
        type: String,
        required: true
    },
    // tokens: [
    //     {
    //         token: {
    //             type: String,
    //             required: true 
    //         }
    //     }
    // ]
})

schema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})


// schema.methods.generateAuthToken = async function () {

//     try {
//        let mytoken = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
//        this.tokens = this.tokens.concat({token: mytoken});
//        await this.save();
//        return mytoken;
//     } catch(err) {
//        console.log(err);
//     }
// }

const Model = new mongoose.model("SBFormData", schema);

module.exports = Model;

