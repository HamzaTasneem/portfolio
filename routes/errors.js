//error method for sending error page if no req matches
module.exports.sendErrorPage = (req, res, next) => {
    return res.render("error/400.ejs", { message: "No Page Found" });

};

//2nd last method if no req matches, sends error msg  and logs 
module.exports.sendError = (err, req, res, next) => {

    console.log("Error in (Error Router):", err.message);
    console.log("Error In File(Error Router): ", err.file);

    return res.send({ message: err.message, err: true, success: false });
}