// //initializing global configs
require("./config/config");

//requiring 3rd party modules
const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);


//requiring local modules
const { mongoose } = require("./middleware/mongoose");
const { postRouter } = require("./routes/posts");
const { sendError, sendErrorPage } = require("./routes/errors");
const { userRouter } = require("./routes/users");
const Post = require("./models/posts/posts_model");

//initializing app variables
const app = express();
const store = new mongoDBStore({ uri: process.env.MONGODB_URI, collection: "sessions" });

//initializing congifs/ middlewares
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//setting up express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.set("views", "views");
app.set("view engine", "ejs");
const port = process.env.PORT;

//seeding data for initial(for initial database deployment)
// require("./seed/user.js");

//Initializing routes
app.get("/", (req, res, next) => {
    Post.find({}).then(posts => {
        res.render("posts/portfolio.ejs", { posts });
    }).catch(err => {
        console.log(err);
        res.send({ message: "An error occured while fetching the posts", file: post_controller, err: true });
    });
});

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use(sendError);
app.use(sendErrorPage);

//Calling methods
app.listen(port, () => {
    console.log("Portfolio App Listening on port " + port);
});