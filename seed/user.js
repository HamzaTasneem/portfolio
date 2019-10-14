//importing modules
const User = require("../models/users/users_model");
const mongoose = require("mongoose");

const _id = mongoose.Types.ObjectId();

const user = new User({
    _id,
    name: "mydummyname",
    email: "mydummyemail@gmail.com",
    password: "mydummypassword",
    _creator: _id
});


user.save().then((user) => {
    console.log("1st User Seeded");
}).catch((err) => {
    console.log("Error while seeding user");
    console.log(err);
});