//authenticating req on basis of req.session.user set|unset
module.exports.authorize = (req,res,next) => {
    if(!req.session.user){
        return res.redirect("/users/login");
    }
    next();
};