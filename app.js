const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

//const Campground = require("./models/campground");
//const Review = require("./models/review");

const override = require("method-override"); //use to update, delete
const ejsMate = require("ejs-mate"); //npm i ejs-mate first, allow inject content
const session = require("express-session");
const flash = require("connect-flash"); //store & display flash message, work along with session

//const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
//const { campgroundSchema, reviewSchema } = require("./errorSchemas");

const campgroundRoutes = require("./routes/campgroundRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

//get mongoose model setup====================================
mongoose
    .connect("mongodb://127.0.0.1:27017/YelpCamp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connection open");
    })
    .catch((err) => {
        console.log("Connection Error");
        console.log(err);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//middleware set up===============================================================
app.engine("ejs", ejsMate); //tell express we want ejsMate, not the default one

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//tell express to pass the body/ to use req.body
app.use(express.urlencoded({ extened: true }));

app.use(override("_method"));

app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
//order is matter=================================================================
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds", reviewRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

//error handler===========================================================
//order is matter, if it doesnt match any one above, it will go to here
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error", { err });
});
//===================================================================
app.listen(3000, () => {
    console.log("serving on port 3000");
});
