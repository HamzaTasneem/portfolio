//requiring 3rd party modules
const { validationResult } = require("express-validator");

//util function for express-validator, checking errors in req
module.exports.checkBodyAndReturnError = (req) => {

    return new Promise(function (resolve, reject) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const message = errors.array()[0];
            reject({ message: message.msg, err: true });
        }

        resolve();
    });

};