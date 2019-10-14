//requiring 3rd party modules
const express = require("express");

//initializing local modules
const postController = require("../models/posts/posts_controller");
const {authorize} = require("../middleware/auth");

//Initializing Variables and functions
const router = express.Router();

//Routes Definations

//getting view post page
router.get("/view", postController.getViewPost);

//getting single post
router.post("/getSinglePost", postController.getSinglePost);

//getting page /posts/create
router.get("/create", authorize, postController.getAddPost);

//posting form from /post/create
router.post("/create",authorize, postController.postAddPost);

//getting list page for posts
router.get("/list", authorize, postController.getListPost);

//getting single post edit page
router.get("/edit/:id",authorize, postController.getEditPage);

//posting form edit form 
router.post("/edit", authorize, postController.postEditPost);

//delete single post from list page
router.delete("/delete",authorize, postController.deletePost);

module.exports.postRouter = router;