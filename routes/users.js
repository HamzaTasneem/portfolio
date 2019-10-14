//importing 3rd party modules
const express = require("express");
const { check, body } = require("express-validator");
const userController = require("../models/users/users_controller");
const {authorize} = require("../middleware/auth");

//initializing variables
const router = express.Router();

//defining routes
router.get("/register", authorize, userController.getRegister);

//posting user registeration in db
router.post("/register", authorize,
    [
        check("name", "Value of name must be greater than 5 characters").not().isEmpty().isLength({ min: 5 }),
        body("email", "Value of email is not valid").not().isEmpty().isEmail(),
        body("password", "Value of password should be minimum than 8 characters.").isLength({min: 8}),
        body("repassword", "Value of 'Re-Type password' should be minimum 8 characters.").isLength({min: 8})
    ], userController.postUser);

//routing logging in page
router.get("/login", userController.getLogin);

//routing loggin in data
router.post("/login",[
    body("email", "Email is not valid").not().isEmpty().isEmail(),
    body("password", "Email and password do not match").not().isEmpty().isLength({min: 8})
], userController.postLogin);

//routing list page
router.get("/list",authorize, userController.getUserList);

//logging user delete req 
router.delete("/delete",authorize, userController.deleteUser);

//routing user data editing page
router.get("/edit/:id", authorize, userController.getEdit);

//routing of posting data for user editing
router.post("/edit", authorize, userController.postEdit);

//routing loggin out
router.get("/logout", authorize, userController.postLogout);

module.exports.userRouter = router;
