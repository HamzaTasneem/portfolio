//importing global/3rd party modules
const fs = require("fs");


//importing local modules
const { uploadForm, checkBody, checkAndRemove } = require("./post_uploader");
const Post = require("./posts_model");


//Defining functions

//getting create post page
const getAddPost = (req, res, next) => {
    res.render("posts/create_post.ejs", {});
};

//posting data for creating of page
const postAddPost = async (req, res, next) => {

    try {
        await uploadForm(req, res);
        await checkBody({ title: req.body.title, description: req.body.description });

        var post = new Post({
            title: req.body.title,
            description: req.body.description,
            featured_image: req.body.featured_image,
            images: req.body.images,
            _creator: req.session.user._id
        });

        await post.save();
        res.send({ message: "Post Created Successfully", err: false, success: true });

    } catch (error) {
        next(error);
    }
};

//getting main portfolio view page
const getViewPost = (req, res) => {

    Post.find({}).then(posts => {
        res.render("posts/portfolio.ejs", { posts });
    }).catch(err => {
        console.log(err);
        res.send({ message: "An error occured while fetching the posts", file: post_controller, err: true });
    });


};

//getting single post data for view page modal
const getSinglePost = (req, res) => {
    Post.findById(req.body.post_id)
        .then(post => {
            if (!post) {
                reject();
            }
            res.send(post);
        })
        .catch(err => {
            res.send({ message: "Error while fetching the post", err: true, file: "post_controller" });
        });
};

//gettign list of all user created posts
const getListPost = (req, res) => {
    Post.find({ _creator: req.session.user._id })
        .then(posts => {
            if (!posts) {
                return res.send({ message: "Sorry!! No Post Found", err: false });
            }

            res.render("posts/list_posts", { posts });
        })
        .catch(err => {
            console.log({ message: "Sorry!! There was an error while fetching the post (post_controller)", err: true });
            res.send({ message: "Sorry!! There was an error while fetching the post", err: true });
        });
};

//getting edit page with post data if it is of same user
const getEditPage = (req, res, next) => {
    let post_id = req.params.id;
    if (!post_id) {
        return res.render("error/400.ejs", { message: "No Such Post Exists", err: false });
    }

    Post.findById(post_id).then(post => {
        if (!post) {
            res.render("error/400.ejs", { message: "Sorry!! No Post Found", err: false });
            return false;
        }

        if (!req.session.user._id.equals(post._creator)) {
            return res.render("error/400.ejs", { message: "Sorry No Post Found", err: false });
        }
        res.render("posts/edit_post.ejs", { post });
    }).catch(err => {
        return res.render("error/400.ejs", { message: "Sorry!! There was an error while fetching the post", err: true });
    });

};

//posting data for post edit if from creator
const postEditPost = async (req, res, next) => {
    //upload and parse form
    try {
        await uploadForm(req, res);
        await checkBody(req.body);

        //if no images updated: unset value so it oes not update
        if (req.body.images.length == 0) delete req.body.images;
        let updatedPost = req.body;
        let post = await Post.findOneAndUpdate({ _id: req.body.post_id, _creator: req.session.user._id }, updatedPost, { useFindAndModify: false });
        if (!post) {
            return res.send({ message: "Sorry No Post Found", success: false, err: false });
        }

        //deleting old images
        if (req.body.featured_image !== undefined) checkAndRemove([post.featured_image]);
        if (req.body.images !== undefined) checkAndRemove(post.images);

        res.send({ message: "Changes Saved", err: false, success: true });

    } catch (error) {
        next(error);
    }
};

//deleting post of from same user
const deletePost = (req, res, next) => {
    console.log(req.body);
    if (!req.body.post_id) {
        res.send({ message: "Kindly send a valid message", err: true, status: "not deleted" });
    }

    return Post.findOneAndRemove({ _id: req.body.post_id, _creator: req.session.user._id }, { useFindAndModify: false })
        .then((post) => {
            if (!post) {
                return res.send({ message: "Sorry No Post Found", success: false, err: false });
            }
            checkAndRemove(post.images);
            checkAndRemove([post.featured_image]);
            res.send({ message: "Post Deleted", err: false, success: true });

        }).catch((error) => {
            next(error);
        });


};

module.exports = { getAddPost, postAddPost, getViewPost, getSinglePost, getListPost, getEditPage, postEditPost, deletePost };
