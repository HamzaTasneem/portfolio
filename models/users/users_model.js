//importing 3rd party modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//defining schema
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    _creator: {
        type: mongoose.Types.ObjectId,
        required: [true, "User must be logged in to register user"]
    },
    loggedIn: { type: String, default: false },
    loggedInToken: { type: String, default: false },
    verified: { type: String, default: false },
    resetPassword: { type: String, default: false }

});

//defining hooks and models

//save hook for encrypting password by bcrypt
userSchema.pre("save", function (next) {

    if (this.password !== undefined) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

const User = mongoose.model("User", userSchema);

//exporting model
module.exports = User;