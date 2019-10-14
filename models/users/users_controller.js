//importing app modules
const bcrypt = require("bcrypt");

//importing local modules 
const User = require("./users_model");
const { checkBodyAndReturnError } = require("../../middleware/utils");

//getting user register page
module.exports.getRegister = (req, res) => {
    res.render("user/register.ejs", {});
};

//posting data for user registeration
module.exports.postUser = async (req, res, next) => {
    try {
        await checkBodyAndReturnError(req);

        if (req.body.password !== req.body.repassword) {
            return res.send({ message: "Passwords do not match", err: true, success: false, file: "users_controller" });
        }

        let oldUser = await User.find({ email: req.body.email });
        if (oldUser.length >= 1) {
            return res.send({ message: `User with same email: ${oldUser.email} already exists`, err: true, success: false, file: "users_controller" });
        }

        let user = new User(req.body);
        user._creator = req.session.user._id;
        await user.save();
        res.send({ message: "User Saved", success: true, err: false, file: "user_controller" });

    } catch (error) {
        next(error);
    }
};

//getting login page
module.exports.getLogin = (req, res, next) => {
    res.render("user/login.ejs", {});
};

//posting data for user login
module.exports.postLogin = async (req, res, next) => {
    try {
        await checkBodyAndReturnError(req);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.send({ message: "Username & Password do not match", err: true, success: false });

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.send({ message: "Username & Password do not match", err: true, success: false });

        req.session.user = user;
        res.send({ message: "Logged In... Redirecting...", err: false, success: true, redirect: "/posts/list" });

    } catch (error) {
        next(error);
    }
};

//getting user list for same user
module.exports.getUserList = (req, res, next) => {
    User.find({ _creator: req.session.user._id }).then(users => { return res.render("user/list.ejs", { users }) }).catch(err => next(err));
};

//deleting user if created by same user
module.exports.deleteUser = (req, res, next) => {
    if (!req.body.user_id) {
        return res.send({ message: "No User Found", err: false, success: false });
    }
    User.findOneAndRemove({ _id: req.body.user_id, _creator: req.session.user._id }, { useFindAndModify: false })
        .then((user) => {
            if (!user) {
                return res.send({ message: "No User Found", success: false, err: false });
            }
            else {
                return res.send({ message: "User Deleted...redirecting", success: true, err: false });
            }

        })
        .catch((err) => {
            next(err);
        });
};

//getting edit page of created by same user
module.exports.getEdit = (req, res, next) => {
    if (!req.params.id) {
        return res.render("error/400.ejs", { message: "No User Found", success: false, err: false });
    }

    User.findOne({ _id: req.params.id, _creator: req.session.user._id })
        .then(user => {
            if (!user) {
                return res.render("error/400.ejs", { message: "No User Found", success: false, err: true });
            }
            return res.render("user/edit.ejs", { user });
        })
        .catch(err => { return res.render("error/400.ejs", { message: "Sorry No User Found", success: false, err: false }); });

};

//posting edit data if created by same user
module.exports.postEdit = async (req, res, next) => {

    try {
        //deleting empty values from update form
        Object.keys(req.body).forEach(function (key) {
            if (!req.body[key]) {
                delete req.body[key];
            }
        });

        //checking password input
        if (req.body.new_password === undefined || req.body.re_password === undefined || req.body.current_password === undefined) {
            if (req.body.current_password !== undefined) delete req.body.current_password;
            if (req.body.new_password !== undefined) delete req.body.new_password;
            if (req.body.re_repassword !== undefined) delete req.body.re_password;
        }
        else {
            if (req.body.new_password !== req.body.re_password) {
                return res.send({ message: "Passwords do not match", success: false, err: false });
            }

            //finding user for creator and password verification
            let user = await User.findOne({_id: req.body.user_id, _creator: req.session.user._id});
            if(!user){
                return res.send({message: "No User Found - For Uodating", success: false, err: false});
            }
            
            // checking password equality
            let match = await bcrypt.compare(req.body.current_password, user.password);
            if (!match) {
                return res.send({ message: "Incorrect current password", success: false, err: false });
            }
            req.body.password = bcrypt.hashSync(req.body.new_password, 10);
        }

        //updating user. Finally !!!!
        await User.findByIdAndUpdate(req.body.user_id, req.body, { useFindAndModify: false });
        res.send({ message: "User Information Updated", success: true, err: false });
    }
    catch (error) {
        next(error);
    }
};

//posting data: session unset and redirect
module.exports.postLogout = (req, res, next) => {
    if (req.session.user) {
        delete req.session.user;
        return res.redirect("/users/login");
    }
    next();
};