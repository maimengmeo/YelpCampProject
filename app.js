const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const override = require("method-override"); //use to update, delete
const ejsMate = require("ejs-mate"); //npm i ejs-mate first
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

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

//order is matter=================================================================
app.get("/", (req, res) => {
    res.render("home");
});

//display all campgrounds
app.get(
    "/campgrounds",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

//go to create campground page
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

//create campground
app.post(
    "/campgrounds",
    catchAsync(async (req, res, next) => {
        if (!req.body.campground)
            throw new ExpressError("Invalid Campground Data", 400);
        const campground = new Campground(req.body.campground); //create new campground from req.body
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`); //redirect to the new campground page after created
    })
);

//go to selected campground page
app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/show", { campground });

        //get the id from index.ejs, find campground by id, put it to show.ejs
    })
);

//go to edit page
app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });

        //get the selected to edit campground from id from url, inject it to edit page
    })
);

//app.put is used to update resource at the spec path
app.put(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        //obj destructuring, extract id
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
            //need to use spread obj here bc this method takes an obj w new data
            //need to spread the obj into obj literal to create new obj
            //that contain all original properties along w new data submitted
        });
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

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
