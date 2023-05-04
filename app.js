if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const override = require("method-override"); //use to update, delete
const ejsMate = require("ejs-mate"); //npm i ejs-mate first, allow inject content
const session = require("express-session");
const flash = require("connect-flash"); //store & display flash message, work along with session

//const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
//const { campgroundSchema, reviewSchema } = require("./errorSchemas");

const campgroundRoutes = require("./routes/campgroundRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");

const User = require("./models/user");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet"); //secure Express apps by setting various HTTP headers

const paginate = require("express-paginate");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/YelpCamp";

const MongoDBStore = require("connect-mongo"); //to store session in mongo
//get mongoose model setup====================================
mongoose
    .connect(dbUrl, {
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

app.use(mongoSanitize({ replaceWith: "_" }));

app.use(helmet({ contentSecurityPolicy: false }));

app.use(paginate.middleware(10, 50));

const secret = process.env.SECRET || "thisshouldbeabettersecret";
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: secret },
    touchAfter: 24 * 60 * 60, //has to be in second
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //static method comes along with package

//how to store & unstore user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//order is matter=================================================================
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds", reviewRoutes);
app.use("/", userRoutes);

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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port 3000 ${port}`);
});
