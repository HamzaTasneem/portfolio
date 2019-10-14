//importing 3rd party modules
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// establishing database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(res => {
        console.log("Connected To MongoDB");

    })
    .catch(err => {
        console.log("Can Not Connect To Database");
        return false;
    });


module.exports.mongoose = mongoose;
