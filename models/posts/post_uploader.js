//importing 3rd party modules
const multer = require("multer");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");

//setting module variables
const moveFrom = path.join(__dirname, "..", "..", "public");
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
const binPath = path.join(__dirname, "..", "..", "public", "bin");
const uploadPublicPath = "/uploads/";


//Initializing app variables

//initiallizing/setting up multer 
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        const file_name = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        callback(null, file_name);
    }
});

//setting file filter for multer
const imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

//setting multer field method for files acceptance
const upload = multer({ storage, fileFilter: imageFilter }).fields(
    [
        {
            name: "featured_image",
            maxCount: 1
        },
        {
            name: "userPhoto",
            maxCount: 2
        }
    ]);

//method for validating req.body (multi-part form data creates variables after multer is executed)     
const checkBody = fields => {
    //deleting empty file fields from req.body
    if (fields.userPhoto !== undefined) {
        delete fields.userPhoto;
    }
    return new Promise(function (resolve, reject) {
        _.forOwn(fields, (value, key) => {
            if (!value) {
                return reject({ message: key + " Can Not Be Empty.", file: "post_uploader" });
            }
        });
        resolve("Body checked");
    });

};

//main method for uploading post data (including files) -  method changed to async + primisified for linear execution
const uploadForm = (req, res) => {
    return new Promise(function (resolve, reject) {
        upload(req, res, err => {

            //Checking for featured image on basis of "required attr in the form field"
            if (req.body.featured_image_required === "true") {

                //if image is required and not given raise error
                if (req.files.featured_image === undefined) {
                    console.log("Featured Image is required - (post_uploader)");
                    return reject({ message: "Featured Image is required", file: "post uploader", err: true });
                }
                //if required and given: set path
                req.body.featured_image = uploadPublicPath + req.files.featured_image[0].filename;
            }
            else {
                //if featured image not required and not given: unset value in req.body so it doesnt update
                if (req.files.featured_image === undefined) { 
                    delete req.body.featured_image;
                }
                //if featured image not required and given: set path
                else {
                    req.body.featured_image = uploadPublicPath + req.files.featured_image[0].filename;
                }
            }
            //deleting extra variables
            delete req.body.featured_image_required;

            //multer parse or file error
            if (err) {
                console.log({ message: "Could not upload the file (post uploader)", file: "post_uploader", err: err });
                return reject({ message: "Could not upload the file ", file: "post_uploader", err: err });
            }

            //if post images set then make array, otherwise leave to empty array
            let images = Array();
            if (req.files['userPhoto']) {
                req.files['userPhoto'].forEach(function (item) {
                    picture = uploadPublicPath + item.filename;
                    images.push(picture);
                });
            }
            //setting values in req.body for updating
            req.body.images = images;
            resolve();
        })
    });
};

//checks existance and removes files (post images) from fs input:array of imgs, output: nill
const checkAndRemove = (imgs) => {

    imgs.forEach(image => {
        const imagePath = moveFrom + image;
        if (fs.existsSync(imagePath)) {
            // fs.rename(imagePath, binPath, function (err) {
            //     if (err) throw err
            //     console.log("File " + image + "moved to binPath.");
            // });
            fs.unlink(imagePath, function(err){
                if (err) throw err
                console.log("File " + image + " deleted.");
            });
        }
    });
};

module.exports = { uploadForm, checkBody, checkAndRemove };
