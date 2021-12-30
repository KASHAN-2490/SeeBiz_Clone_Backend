const donenv = require('dotenv');

const express = require("express");

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")


donenv.config({ path: './config.env' })

const PORT = process.env.PORT;

const cors = require('cors');

const app = express();
var socket = require('socket.io')

require("./database/db.js");

const Register = require("./database/model.js");

app.use(express.urlencoded({ extended: true }));

app.use(express.json())

app.use(cors())


// var name;

app.post("/", async (req, res) => {

    // res.send('<h1>hello this is home</h1>');

    const email = req.body.Email;
    // console.log(email);

    try {
        const userExist = await Register.findOne({ email: email })

        // if (userExist) {
        //     // console.log(userExist);
        //     return name = userExist.username;
        // }

        if (userExist) {
            // console.log(userExist);
            return res.status(201).json({ name: userExist.username })

        } else {
            return res.status(422).json({ errmsg: "User credentials are not valid" })
        }

    } catch (err) {
        res.status(400).json({ errmsg: "Failed to Reload." });
    }

})

app.post("/signin", async (req, res) => {

    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ emailmsg: "Email is required" })
    } else if (!password) {
        return res.status(422).json({ passmsg: "Password is required" })
    }

    try {
        const userExist = await Register.findOne({ email: email })

        // if (userExist) {
        //     io.emit("message", { msg: `You are Signed In ${userExist.username}`, count: 1 });
        //     setTimeout(function () {
        //         io.emit("testerEvent", { msg: `Welcome ${userExist.username}`, count: 1 });
        //     }, 4000);
        // }

        if (userExist) {

            const passExist = await bcrypt.compare(password, userExist.password);

            let mytoken = jwt.sign({ _id: userExist._id }, process.env.SECRET_KEY);

            // const mytoken = await userExist.generateAuthToken();
            // console.log(token);
            // res.cookie("jwtoken", token, {
            //     expires: new Date(Date.now() + 25892000000),
            //     httpOnly: true
            // })

            if (passExist) {
                return res.status(201).json({ msg: "You are Signed in", key: true, token: mytoken, name: userExist.username, email: userExist.email })
            } else {
                return res.status(422).json({ errmsg: "User credentials are not valid" })
            }

        } else {
            return res.status(422).json({ errmsg: "User credentials are not valid" })
        }

    } catch (err) {
        res.status(400).json({ errmsg: "Failed to Login." });
    }

})

app.post("/signup", async (req, res) => {

    const { username, email, password, checkbox } = req.body;

    // if (!username || !email || !password || !checkbox) {
    //     return res.status(422).json({ err: "Plz filled the field properly." })
    // }

    try {
        const userExist = await Register.findOne({ username: username })
        const mailExist = await Register.findOne({ email: email })

        if (userExist) {
            return res.status(422).json({ usermsg: "User Name already Exist." })
        }

        if (mailExist) {
            return res.status(422).json({ emailmsg: "Email already Exist." })
        }

        const register = new Register({
            username,
            email,
            password,
            checkbox
        })

        await register.save();

        res.status(201).json({ msg: "Register Successfully.", key: true })
        // console.log("result", result);

    } catch (err) {
        res.status(400).json({ msg: "Failed to register." });
    }

    // console.log("register", req.body);
})

app.get("*", (req, res) => {
    res.send('<h1 style="text-align:center">404, Oops Page not found</h1>');
})

const server = app.listen(PORT, () => {
    console.log(`listning the port at ${PORT}`);
})

const io = socket(server, {
    cors: {
        origin: "*",
    }
})
 
let users = []


const addUsers = (socketId, username) => {
    !users.some((user) =>
        user.username === username
    )
        &&
    users.push({socketId, username});
} 

const removeUser = (socketId) => {
    users = users.filter((users)=>
        users.socketId !== socketId
    ) 
}

const findUser = (sendername) => {
      return users.find((user)=>
          user.username !== sendername
       )
}

io.on('connection', function (socket) {
    console.log('A user connected');

    socket.on('newUser', function(username){
        addUsers(socket.id, username)
    });

    // io.emit("message1", users);
    console.log("users ", users);

    // io.emit("users", users);

    socket.on('clientEvent', function({sendername, usermsg}){
        const name = findUser(sendername)
        console.log("name ", sendername); 

        io.to(name.socketId).emit("message", { msg: usermsg, count: 1 })
    });


    socket.on('disconnect', function () {
        console.log('A user disconnected');
        removeUser(socket.id);
    });
});



  // !users.some((user)=>
    //       user.username === username
    // ) 
    // && 